import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegramCrypto";
import { getOrCreateWallet, getWalletBalance, getWalletByAddress } from "@/lib/wallet/ledger";
import { isValidAddress } from "@/lib/wallet/crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const initData = searchParams.get("initData") || req.headers.get("x-telegram-init-data");

    // 1. Direct address balance lookup calculated exclusively from SUM(amount) in ledger_entries
    if (address && isValidAddress(address)) {
      const wallet = await getWalletByAddress(address);
      if (!wallet) {
        return NextResponse.json(
          { success: false, error: "Wallet not found" },
          { status: 404 }
        );
      }

      const liveBalance = await getWalletBalance(wallet.id);

      return NextResponse.json({
        success: true,
        address: wallet.address,
        balance: Number(liveBalance),
        nonce: wallet.nonce_record?.current_nonce ?? wallet.nonce,
      });
    }

    // 2. Telegram session authentication lookup
    const host = req.headers.get("host") || "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

    let telegramId: number | null = null;

    if (initData) {
      const auth = verifyTelegramWebAppData(initData, process.env.TELEGRAM_BOT_TOKEN);
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

    const wallet = await getOrCreateWallet(telegramId);
    const liveBalance = await getWalletBalance(wallet.id);

    return NextResponse.json({
      success: true,
      address: wallet.address,
      balance: Number(liveBalance),
      nonce: wallet.nonce,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
