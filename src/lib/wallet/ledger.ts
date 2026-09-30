import prisma from "@/lib/prisma";
import crypto from "crypto";
import {
  generateKeypair,
  encryptPrivateKey,
  verifyTransactionSignature,
  calculateTxHash,
} from "./crypto";
import { TransferRequestInput } from "./validation";
import { balanceEvents } from "./realtime";

export interface WalletInfo {
  id: string;
  telegram_id: string;
  address: string;
  public_key: string;
  nonce: number;
  balance: number;
}

/**
 * Calculates real-time user balance using strict SUM(amount) from ledger entries.
 * Never trusts client-provided or cached balance values.
 */
export async function getWalletBalance(walletId: string): Promise<bigint> {
  const result = await prisma.ledgerEntry.aggregate({
    where: { wallet_id: walletId },
    _sum: { amount: true },
  });

  return result._sum.amount ?? BigInt(0);
}

/**
 * Calculates real-time balance for an address directly from the ledger.
 */
export async function getWalletBalanceByAddress(address: string): Promise<bigint> {
  const wallet = await prisma.wallet.findUnique({
    where: { address },
  });
  if (!wallet) return BigInt(0);
  return getWalletBalance(wallet.id);
}

/**
 * Retrieves existing wallet or provisions a new secp256k1 keypair and wallet container.
 */
export async function getOrCreateWallet(
  telegramId: number | bigint,
  initialGrant: number = 0
): Promise<WalletInfo> {
  const tgIdBigInt = BigInt(telegramId);

  let wallet = await prisma.wallet.findUnique({
    where: { telegram_id: tgIdBigInt },
    include: { nonce_record: true },
  });

  if (!wallet) {
    const keypair = generateKeypair();
    const encryptedKey = encryptPrivateKey(keypair.privateKey);

    wallet = await prisma.wallet.create({
      data: {
        telegram_id: tgIdBigInt,
        address: keypair.address,
        public_key: keypair.publicKey,
        encrypted_private_key: encryptedKey,
        nonce: 0,
        nonce_record: {
          create: {
            current_nonce: 0,
          },
        },
      },
      include: { nonce_record: true },
    });

    if (initialGrant > 0) {
      await prisma.ledgerEntry.create({
        data: {
          wallet_id: wallet.id,
          amount: BigInt(initialGrant),
          entry_type: "INITIAL_GRANT",
        },
      });
    }
  } else if (!wallet.nonce_record) {
    await prisma.nonce.create({
      data: {
        wallet_id: wallet.id,
        current_nonce: wallet.nonce,
      },
    });
  }

  const liveBalance = await getWalletBalance(wallet.id);

  return {
    id: wallet.id,
    telegram_id: wallet.telegram_id.toString(),
    address: wallet.address,
    public_key: wallet.public_key,
    nonce: wallet.nonce_record?.current_nonce ?? wallet.nonce,
    balance: Number(liveBalance),
  };
}

/**
 * Returns expected nonce for an address.
 */
export async function getExpectedNonce(address: string): Promise<number> {
  const wallet = await prisma.wallet.findUnique({
    where: { address },
    include: { nonce_record: true },
  });
  if (!wallet) {
    throw new Error("Wallet not found for address");
  }
  return wallet.nonce_record?.current_nonce ?? wallet.nonce;
}

/**
 * Finds a wallet record by its WC... address.
 */
export async function getWalletByAddress(address: string) {
  return prisma.wallet.findUnique({
    where: { address },
    include: { nonce_record: true },
  });
}

/**
 * Executes a secure transfer between two WC addresses.
 * Uses atomic Prisma $transaction, double-entry ledger debit & credit, and secp256k1 verification.
 */
export async function executeSecureTransfer(input: TransferRequestInput): Promise<{
  txHash: string;
  from: string;
  to: string;
  amount: number;
  nonce: number;
  newSenderBalance: number;
  status: string;
}> {
  // 1. Resolve sender and recipient wallets
  const senderWallet = await prisma.wallet.findUnique({
    where: { address: input.fromAddress },
    include: { nonce_record: true },
  });
  if (!senderWallet) {
    throw new Error("Sender wallet does not exist");
  }

  const recipientWallet = await prisma.wallet.findUnique({
    where: { address: input.toAddress },
  });
  if (!recipientWallet) {
    throw new Error("Recipient wallet does not exist");
  }

  // 2. Anti-replay verification: Check nonce against nonces table
  const currentNonce = senderWallet.nonce_record?.current_nonce ?? senderWallet.nonce;
  if (input.nonce !== currentNonce) {
    throw new Error(`Invalid nonce. Expected ${currentNonce}, received ${input.nonce}`);
  }

  // 3. Cryptographic secp256k1 signature verification
  const payload = {
    fromAddress: input.fromAddress,
    toAddress: input.toAddress,
    amount: input.amount,
    nonce: input.nonce,
  };
  const isSignatureValid = verifyTransactionSignature(
    senderWallet.public_key,
    payload,
    input.signature
  );
  if (!isSignatureValid) {
    throw new Error("Cryptographic secp256k1 signature verification failed");
  }

  // 4. Deterministic transaction hash calculation
  const txHash = calculateTxHash(
    input.fromAddress,
    input.toAddress,
    input.amount,
    input.nonce,
    input.signature
  );

  const amountBigInt = BigInt(input.amount);

  // 5. Atomic database execution: debit sender + credit receiver + update nonce
  const result = await prisma.$transaction(async (tx) => {
    // Re-verify real balance strictly inside the transaction boundary
    const sumResult = await tx.ledgerEntry.aggregate({
      where: { wallet_id: senderWallet.id },
      _sum: { amount: true },
    });
    const currentBalance = sumResult._sum.amount ?? BigInt(0);

    if (currentBalance < amountBigInt) {
      throw new Error(
        `Insufficient funds. Available: ${currentBalance.toString()}, required: ${amountBigInt.toString()}`
      );
    }

    // Insert transaction audit record
    const transaction = await tx.transaction.create({
      data: {
        tx_hash: txHash,
        from: input.fromAddress,
        to: input.toAddress,
        amount: amountBigInt,
        nonce: input.nonce,
        signature: input.signature,
        status: "CONFIRMED",
        tx_type: "TRANSFER",
      },
    });

    // Append-only debit entry for sender (negative amount)
    await tx.ledgerEntry.create({
      data: {
        wallet_id: senderWallet.id,
        amount: -amountBigInt,
        entry_type: "TRANSFER_OUT",
        transaction_id: transaction.id,
      },
    });

    // Append-only credit entry for recipient (positive amount)
    await tx.ledgerEntry.create({
      data: {
        wallet_id: recipientWallet.id,
        amount: amountBigInt,
        entry_type: "TRANSFER_IN",
        transaction_id: transaction.id,
      },
    });

    // Increment sender nonce in nonces table and wallet record
    const nextNonce = currentNonce + 1;
    await tx.nonce.upsert({
      where: { wallet_id: senderWallet.id },
      create: { wallet_id: senderWallet.id, current_nonce: nextNonce },
      update: { current_nonce: nextNonce },
    });
    await tx.wallet.update({
      where: { id: senderWallet.id },
      data: { nonce: nextNonce },
    });

    // Calculate new sender and recipient balances strictly from ledger SUM
    const newSenderSum = await tx.ledgerEntry.aggregate({
      where: { wallet_id: senderWallet.id },
      _sum: { amount: true },
    });
    const newRecipientSum = await tx.ledgerEntry.aggregate({
      where: { wallet_id: recipientWallet.id },
      _sum: { amount: true },
    });

    return {
      newSenderBalance: Number(newSenderSum._sum.amount ?? BigInt(0)),
      newRecipientBalance: Number(newRecipientSum._sum.amount ?? BigInt(0)),
    };
  });

  // 6. Broadcast updated balances to realtime listeners
  balanceEvents.notifyBalanceUpdate(input.fromAddress, result.newSenderBalance, txHash);
  balanceEvents.notifyBalanceUpdate(input.toAddress, result.newRecipientBalance, txHash);

  return {
    txHash,
    from: input.fromAddress,
    to: input.toAddress,
    amount: input.amount,
    nonce: input.nonce,
    newSenderBalance: result.newSenderBalance,
    status: "CONFIRMED",
  };
}

/**
 * Executes a server-controlled currency exchange from WEI COIN to USD or KHR.
 * Exchange rates are retrieved exclusively from the server database.
 */
export async function executeExchange(
  fromAddress: string,
  pair: "WEI_USD" | "WEI_KHR",
  weiAmount: number
): Promise<{
  txHash: string;
  weiAmount: number;
  rate: number;
  convertedAmount: number;
  targetCurrency: string;
  newBalance: number;
}> {
  // 1. Fetch server-controlled rate strictly from the database
  const rateRecord = await prisma.exchangeRate.findUnique({
    where: { pair },
  });
  if (!rateRecord) {
    throw new Error(`Exchange rate for pair ${pair} not available in database`);
  }
  const rate = rateRecord.rate;

  const wallet = await prisma.wallet.findUnique({
    where: { address: fromAddress },
    include: { nonce_record: true },
  });
  if (!wallet) {
    throw new Error("Wallet not found for address");
  }

  // Enforce standard rare coin scarcity thresholds
  if (weiAmount < 100) {
    throw new Error("Exchange amount is below minimum rare threshold (100 WEI)");
  }
  if (weiAmount > 25000) {
    throw new Error("Exchange amount exceeds maximum rare batch limit (25,000 WEI)");
  }

  const amountBigInt = BigInt(weiAmount);
  const currentNonce = wallet.nonce_record?.current_nonce ?? wallet.nonce;

  // Cryptographic signature generated with system settlement authority
  const settlementSignature = crypto
    .createHmac("sha256", "EXCHANGE_SETTLEMENT_AUTHORITY")
    .update(`${fromAddress}:${pair}:${weiAmount}:${currentNonce}`)
    .digest("hex");

  const txHash = crypto
    .createHash("sha256")
    .update(`${fromAddress}:EXCHANGE:${weiAmount}:${currentNonce}:${settlementSignature}`)
    .digest("hex");

  const convertedAmount =
    pair === "WEI_USD"
      ? Number((weiAmount * rate).toFixed(2))
      : Math.round(weiAmount * rate);

  const targetCurrency = pair === "WEI_USD" ? "USD" : "KHR";

  const newBalance = await prisma.$transaction(async (tx) => {
    // Check balance strictly from ledger
    const sumResult = await tx.ledgerEntry.aggregate({
      where: { wallet_id: wallet.id },
      _sum: { amount: true },
    });
    const currentBalance = sumResult._sum.amount ?? BigInt(0);

    if (currentBalance < amountBigInt) {
      throw new Error(
        `Insufficient funds for exchange. Available: ${currentBalance.toString()}, required: ${amountBigInt.toString()}`
      );
    }

    const transaction = await tx.transaction.create({
      data: {
        tx_hash: txHash,
        from: fromAddress,
        to: `SYSTEM_EXCHANGE_${targetCurrency}`,
        amount: amountBigInt,
        nonce: currentNonce,
        signature: settlementSignature,
        status: "CONFIRMED",
        tx_type: "EXCHANGE",
        rate: rate,
        target_currency: targetCurrency,
      },
    });

    // Debit sender in ledger
    await tx.ledgerEntry.create({
      data: {
        wallet_id: wallet.id,
        amount: -amountBigInt,
        entry_type: "EXCHANGE",
        transaction_id: transaction.id,
      },
    });

    // Increment nonce
    const nextNonce = currentNonce + 1;
    await tx.nonce.upsert({
      where: { wallet_id: wallet.id },
      create: { wallet_id: wallet.id, current_nonce: nextNonce },
      update: { current_nonce: nextNonce },
    });
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { nonce: nextNonce },
    });

    const newSum = await tx.ledgerEntry.aggregate({
      where: { wallet_id: wallet.id },
      _sum: { amount: true },
    });

    return Number(newSum._sum.amount ?? BigInt(0));
  });

  balanceEvents.notifyBalanceUpdate(fromAddress, newBalance, txHash);

  return {
    txHash,
    weiAmount,
    rate,
    convertedAmount,
    targetCurrency,
    newBalance,
  };
}

/**
 * Awards validated game rewards with server-side proof and append-only ledger credit.
 * Calculates block rewards atomically in one block with strict anti-cheat and rare coin rules.
 */
export async function executeGameReward(
  toAddress: string,
  gameId: string,
  score: number,
  spendSeconds: number
): Promise<{
  txHash: string;
  rewardAmount: number;
  newBalance: number;
  blockHeight: number;
}> {
  // Anti-cheat: Validate gameplay duration vs score feasibility (fair gameplay rules)
  if (spendSeconds < 3 && score > 0) {
    throw new Error("Invalid gameplay duration for reported score");
  }
  if (score > spendSeconds * 60) {
    throw new Error("Anomalous gameplay score rejected by anti-cheat rules");
  }
  if (score < 10) {
    throw new Error("Score must be at least 10 to earn cryptographic block reward");
  }

  // Server-controlled rare block reward formula: 10 WEI per 100 score (1 WEI per 10 score), capped at rare limit 2,500 WEI
  const calculatedReward = Math.min(2500, Math.max(1, Math.floor(score / 10)));
  const rewardBigInt = BigInt(calculatedReward);

  const wallet = await prisma.wallet.findUnique({
    where: { address: toAddress },
    include: { nonce_record: true },
  });
  if (!wallet) {
    throw new Error("Wallet not found for recipient address");
  }

  const currentNonce = wallet.nonce_record?.current_nonce ?? wallet.nonce;
  const rewardSignature = crypto
    .createHmac("sha256", "GAME_REWARD_AUTHORITY")
    .update(`${toAddress}:${gameId}:${calculatedReward}:${currentNonce}`)
    .digest("hex");

  const txHash = crypto
    .createHash("sha256")
    .update(`REWARD:${gameId}:${toAddress}:${calculatedReward}:${currentNonce}:${Date.now()}`)
    .digest("hex");

  // All calculations performed in one atomic block transaction
  const newBalance = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        tx_hash: txHash,
        from: "WC_GAME_REWARD_SYSTEM",
        to: toAddress,
        amount: rewardBigInt,
        nonce: currentNonce,
        signature: rewardSignature,
        status: "CONFIRMED",
        tx_type: "GAME_REWARD",
        metadata: {
          gameId,
          score,
          spendSeconds,
          block_height: currentNonce,
          rarity_tier: "RARE_BLOCK",
          timestamp: Date.now(),
        },
      },
    });

    await tx.ledgerEntry.create({
      data: {
        wallet_id: wallet.id,
        amount: rewardBigInt,
        entry_type: "GAME_REWARD",
        transaction_id: transaction.id,
      },
    });

    // Advance block sequence / nonce in the exact same block
    await tx.nonce.upsert({
      where: { wallet_id: wallet.id },
      update: { current_nonce: currentNonce + 1 },
      create: { wallet_id: wallet.id, current_nonce: currentNonce + 1 },
    });
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { nonce: currentNonce + 1 },
    });

    const newSum = await tx.ledgerEntry.aggregate({
      where: { wallet_id: wallet.id },
      _sum: { amount: true },
    });

    return Number(newSum._sum.amount ?? BigInt(0));
  });

  balanceEvents.notifyBalanceUpdate(toAddress, newBalance, txHash);

  return {
    txHash,
    rewardAmount: calculatedReward,
    newBalance,
    blockHeight: currentNonce,
  };
}

/**
 * Resets all currency stores, game scores, and earnings in the database to Block 0 (Genesis state).
 * Sets all dollar, Khmer coin, and time course earnings to 0 so all users start from zero.
 */
export async function resetAllCurrencyStoresToGenesis(): Promise<{
  success: boolean;
  resetWalletsCount: number;
  resetPlayersCount: number;
  timestamp: number;
}> {
  const wallets = await prisma.wallet.findMany();
  for (const wallet of wallets) {
    const balanceSum = await prisma.ledgerEntry.aggregate({
      where: { wallet_id: wallet.id },
      _sum: { amount: true },
    });
    const currentBal = balanceSum._sum.amount ?? BigInt(0);
    if (currentBal !== BigInt(0)) {
      await prisma.ledgerEntry.create({
        data: {
          wallet_id: wallet.id,
          amount: -currentBal,
          entry_type: "ADMIN_ZERO_RESET",
        },
      });
    }
  }

  await prisma.nonce.updateMany({
    data: { current_nonce: 0 },
  });
  await prisma.wallet.updateMany({
    data: { nonce: 0 },
  });

  const dbUrl = process.env.DATABASE_URL;
  let resetPlayersCount = 0;
  if (dbUrl) {
    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(dbUrl);
      await sql`UPDATE game_players SET score = 0, spend_seconds = 0`;
      await sql`UPDATE game_scores SET score = 0, time_taken = 0`;
      const countRes = await sql`SELECT count(*) FROM game_players`;
      resetPlayersCount = Number(countRes[0]?.count || 0);
    } catch (e) {
      console.warn("Neon SQL reset warning:", e);
    }
  }

  return {
    success: true,
    resetWalletsCount: wallets.length,
    resetPlayersCount,
    timestamp: Date.now(),
  };
}
