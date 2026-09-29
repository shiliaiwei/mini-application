import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegramCrypto";
import { getOrCreateWallet, getWalletBalance } from "@/lib/wallet/ledger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const initData = searchParams.get("initData") || req.headers.get("x-telegram-init-data");

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
  } catch (error: unknown) {
    console.error("Balance fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
