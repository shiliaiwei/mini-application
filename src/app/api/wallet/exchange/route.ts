import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegramCrypto";
import { checkRateLimit } from "@/lib/wallet/security";
import { ExchangeRequestSchema } from "@/lib/wallet/validation";
import { executeExchange, getOrCreateWallet } from "@/lib/wallet/ledger";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-unknown";
    const rateCheck = checkRateLimit(ip, 10, 10000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many exchange requests. Please wait." },
        { status: 429 }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const parsed = ExchangeRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { fromAddress, pair, amount, initData } = parsed.data;

    // Strict Telegram session verification
    const auth = verifyTelegramWebAppData(initData, process.env.TELEGRAM_BOT_TOKEN);
    if (!auth.isValid || !auth.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized Telegram session" },
        { status: 401 }
      );
    }

    const userWallet = await getOrCreateWallet(auth.user.id);
    if (userWallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Wallet does not belong to authenticated user" },
        { status: 403 }
      );
    }

    const exchangeResult = await executeExchange(fromAddress, pair, amount);

    return NextResponse.json({
      success: true,
      exchange: exchangeResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Exchange failed" },
      { status: 400 }
    );
  }
}
