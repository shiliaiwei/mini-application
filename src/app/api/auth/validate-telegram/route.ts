import { NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegramCrypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { initData } = body;

    const botToken =
      process.env.TELEGRAM_BOT_TOKEN ||
      "8873981639:AAEguH_DdmL2gzcN4k9Uth4vd6-g007Kxrk";
    if (!botToken) {
      return NextResponse.json(
        { valid: false, error: "Server authentication token not configured" },
        { status: 500 }
      );
    }

    const validation = verifyTelegramWebAppData(initData, botToken);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          valid: false,
          error: validation.error || "Invalid cryptographic Telegram signature",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: validation.user,
      authDate: validation.authDate,
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: err?.message || "Internal validation error" },
      { status: 400 }
    );
  }
}
