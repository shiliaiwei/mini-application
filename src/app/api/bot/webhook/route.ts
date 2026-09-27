import { NextResponse } from "next/server";
import { processTelegramUpdate } from "@/lib/bot/engine";
import { TelegramUpdate } from "@/lib/bot/types";

export async function POST(req: Request) {
  // Cloudflare Security Audit: Telegram Secret Token Verification
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (webhookSecret) {
    const receivedSecret = req.headers.get("x-telegram-bot-api-secret-token");
    if (receivedSecret !== webhookSecret) {
      return NextResponse.json({ ok: false, error: "Unauthorized webhook origin" }, { status: 401 });
    }
  }

  try {
    const update = (await req.json()) as TelegramUpdate;
    if (!update || typeof update.update_id !== "number") {
      return NextResponse.json({ ok: false, error: "Invalid Telegram update format" }, { status: 400 });
    }

    await processTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Bot Webhook Error";
    console.error("Webhook processing error:", errorMsg);
    return NextResponse.json({ ok: false, error: "Error processing webhook update" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    bot_service: "SHILIAIWEI Telegram Bot Application",
    endpoint: "/api/bot/webhook",
    standard: "Telegram Bot API (BotFather Compliant)",
  });
}
