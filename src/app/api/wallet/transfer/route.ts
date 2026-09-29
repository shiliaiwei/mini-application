import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTelegramWebAppData } from "@/lib/telegramCrypto";
import { isValidAddress, verifyTransactionSignature } from "@/lib/wallet/crypto";
import { getOrCreateWallet, getWalletBalance, getWalletByAddress } from "@/lib/wallet/ledger";

interface TransferBody {
  initData?: string;
  to_address?: string;
  amount?: number;
  nonce?: number;
  signature?: string;
}

export async function POST(req: NextRequest) {
  try {
    let body: TransferBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { initData, to_address, amount, nonce, signature } = body;

    // 1. Authenticate user identity through Telegram session
    const headerInitData = req.headers.get("x-telegram-init-data");
    const rawInitData = initData || headerInitData;

    const host = req.headers.get("host") || "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

    let telegramId: number | null = null;

    if (rawInitData) {
      const auth = verifyTelegramWebAppData(rawInitData, process.env.TELEGRAM_BOT_TOKEN);
      if (auth.isValid && auth.user?.id) {
        telegramId = auth.user.id;
      }
    }

    if (!telegramId && isLocal) {
      telegramId = 88888888;
    }

    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing Telegram session" },
        { status: 401 }
      );
    }

    // 2. Validate to_address format (WC... address)
    if (!to_address || !isValidAddress(to_address)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid recipient address format. Must be a valid WC... address (WC followed by 40 hex characters)",
        },
        { status: 400 }
      );
    }

    // 3. Ensure transfer amount is a finite positive integer greater than 0
    if (
      typeof amount !== "number" ||
      isNaN(amount) ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      Math.floor(amount) !== amount
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Transfer amount must be a positive whole integer greater than 0 WEI COIN",
        },
        { status: 400 }
      );
    }

    // 4. Validate nonce format
    if (typeof nonce !== "number" || !Number.isInteger(nonce) || nonce < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid nonce format. Must be a non-negative integer" },
        { status: 400 }
      );
    }

    // 5. Validate signature format
    if (!signature || typeof signature !== "string" || signature.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required secp256k1 transaction signature" },
        { status: 400 }
      );
    }

    // 6. Retrieve sender's wallet
    const senderWallet = await getOrCreateWallet(telegramId);

    // Prevent self-transfers
    if (senderWallet.address.toLowerCase() === to_address.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Self-transfer is not allowed. Destination must be a different address" },
        { status: 400 }
      );
    }

    // 7. Verify recipient wallet exists
    const recipientWallet = await getWalletByAddress(to_address);
    if (!recipientWallet) {
      return NextResponse.json(
        { success: false, error: `Recipient address ${to_address} not found in the ledger system` },
        { status: 404 }
      );
    }

    // 8. Anti-Replay: Verify transaction nonce matches sender's registered database nonce
    if (nonce !== senderWallet.nonce) {
      return NextResponse.json(
        {
          success: false,
          error: `Nonce mismatch: expected nonce ${senderWallet.nonce}, received ${nonce}. Replay attack prevented`,
        },
        { status: 400 }
      );
    }

    // 9. Calculate user's real balance using strict SUM(amount) from ledger entries
    const currentBalance = await getWalletBalance(senderWallet.id);
    const transferAmountBigInt = BigInt(amount);

    if (currentBalance < transferAmountBigInt) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient balance: required ${amount} WEI COIN, available balance is ${Number(currentBalance)} WEI COIN`,
        },
        { status: 400 }
      );
    }

    // 10. Verify cryptographic secp256k1 signature
    const isSignatureValid = verifyTransactionSignature(
      senderWallet.public_key,
      {
        fromAddress: senderWallet.address,
        toAddress: to_address,
        amount,
        nonce,
      },
      signature
    );

    if (!isSignatureValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Cryptographic signature verification failed: invalid secp256k1 signature for the given transaction parameters",
        },
        { status: 400 }
      );
    }

    // 11. Atomic Prisma transaction: debit, credit, nonce increment, and audit log
    const result = await prisma.$transaction(async (tx) => {
      // Re-verify balance inside transaction to prevent double spending race conditions
      const txBalanceAgg = await tx.ledgerEntry.aggregate({
        where: { wallet_id: senderWallet.id },
        _sum: { amount: true },
      });
      const confirmedBalance = txBalanceAgg._sum.amount ?? BigInt(0);

      if (confirmedBalance < transferAmountBigInt) {
        throw new Error(
          `Insufficient balance during atomic commit: available ${Number(confirmedBalance)} WEI COIN`
        );
      }

      // Increment sender nonce
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { nonce: { increment: 1 } },
      });

      // Insert transaction record
      const createdTx = await tx.walletTransaction.create({
        data: {
          from_address: senderWallet.address,
          to_address,
          amount: transferAmountBigInt,
          nonce,
          signature,
          status: "CONFIRMED",
          tx_type: "TRANSFER",
        },
      });

      // Insert debit entry for sender
      await tx.ledgerEntry.create({
        data: {
          wallet_id: senderWallet.id,
          amount: -transferAmountBigInt,
          entry_type: "TRANSFER_DEBIT",
          transaction_id: createdTx.id,
        },
      });

      // Insert credit entry for recipient
      await tx.ledgerEntry.create({
        data: {
          wallet_id: recipientWallet.id,
          amount: transferAmountBigInt,
          entry_type: "TRANSFER_CREDIT",
          transaction_id: createdTx.id,
        },
      });

      // Calculate final sender balance
      const finalSenderBalance = confirmedBalance - transferAmountBigInt;

      return {
        transactionId: createdTx.id,
        newBalance: Number(finalSenderBalance),
      };
    });

    // 12. Optional sync with legacy game_players table for backwards compatibility
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE game_players SET score = ${result.newBalance}, updated_at = NOW() WHERE telegram_id = ${telegramId};`
      );
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Transfer executed and verified successfully",
      transaction: {
        id: result.transactionId,
        from_address: senderWallet.address,
        to_address,
        amount,
        nonce,
        status: "CONFIRMED",
      },
      new_balance: result.newBalance,
    });
  } catch (error: unknown) {
    console.error("Transfer execution error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
