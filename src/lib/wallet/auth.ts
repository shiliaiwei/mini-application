import prisma from "@/lib/prisma";
import { verifyTelegramWebAppData } from "@/lib/telegramCrypto";
import { generateKeypair, encryptPrivateKey } from "./crypto";
import { getWalletBalance } from "./ledger";

export interface AuthenticatedUserSession {
  user: {
    id: string;
    telegram_id: string;
    first_name: string;
    last_name?: string | null;
    username?: string | null;
    language_code?: string | null;
    is_premium: boolean;
  };
  wallet: {
    id: string;
    address: string;
    public_key: string;
    nonce: number;
    balance: number;
  };
}

/**
 * Validates Telegram initData cryptographic HMAC-SHA-256 signature server-side.
 * Finds or creates User and provisions secp256k1 Wallet on first login.
 * Private keys are encrypted and strictly isolated on the server.
 */
export async function authenticateAndProvisionUser(
  initData: string
): Promise<AuthenticatedUserSession> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN missing from server environment");
  }

  // 1. Strict HMAC-SHA-256 validation (rejects forged/tampered URLs)
  const validation = verifyTelegramWebAppData(initData, botToken);
  if (!validation.isValid || !validation.user) {
    throw new Error(validation.error || "Cryptographic HMAC verification failed");
  }

  const tgIdBigInt = BigInt(validation.user.id);

  // 2. Find or create user in database
  let user = await prisma.user.findUnique({
    where: { telegram_id: tgIdBigInt },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegram_id: tgIdBigInt,
        first_name: validation.user.first_name,
        last_name: validation.user.last_name || null,
        username: validation.user.username || null,
        language_code: validation.user.language_code || null,
        is_premium: validation.user.is_premium || false,
      },
    });
  } else {
    // Keep cached user details synced with verified Telegram data
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        first_name: validation.user.first_name,
        last_name: validation.user.last_name !== undefined ? validation.user.last_name : user.last_name,
        username: validation.user.username !== undefined ? validation.user.username : user.username,
        is_premium: validation.user.is_premium !== undefined ? validation.user.is_premium : user.is_premium,
      },
    });
  }

  // 3. Find or create user wallet with secp256k1 keypair
  let wallet = await prisma.wallet.findUnique({
    where: { telegram_id: tgIdBigInt },
    include: { nonce_record: true },
  });

  if (!wallet) {
    const keypair = generateKeypair();
    const encryptedKey = encryptPrivateKey(keypair.privateKey);

    wallet = await prisma.wallet.create({
      data: {
        user_id: user.id,
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

    // Initial welcome grant of 1,000 WEI COIN on first wallet creation via append-only ledger
    await prisma.ledgerEntry.create({
      data: {
        wallet_id: wallet.id,
        amount: BigInt(1000),
        entry_type: "INITIAL_GRANT",
      },
    });
  } else {
    if (!wallet.user_id) {
      wallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { user_id: user.id },
        include: { nonce_record: true },
      });
    }
    if (!wallet.nonce_record) {
      await prisma.nonce.create({
        data: {
          wallet_id: wallet.id,
          current_nonce: wallet.nonce,
        },
      });
    }
  }

  // 4. Compute real-time balance strictly from SUM(amount) in ledger_entries
  const realBalanceBigInt = await getWalletBalance(wallet.id);

  return {
    user: {
      id: user.id,
      telegram_id: user.telegram_id.toString(),
      first_name: user.first_name || "Player",
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      is_premium: user.is_premium,
    },
    wallet: {
      id: wallet.id,
      address: wallet.address,
      public_key: wallet.public_key,
      nonce: wallet.nonce_record?.current_nonce ?? wallet.nonce,
      balance: Number(realBalanceBigInt),
    },
  };
}
