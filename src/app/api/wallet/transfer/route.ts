import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegramCrypto";
import { checkRateLimit } from "@/lib/wallet/security";
import { TransferRequestSchema } from "@/lib/wallet/validation";
import { executeSecureTransfer, getOrCreateWallet } from "@/lib/wallet/ledger";

export async function POST(req: NextRequest) {
  try {
    // 1. Sliding-window rate limit (5 requests per 10 seconds per IP)
    const ip = req.headers.get("x-forwarded-for") || "client-unknown";
    const rateCheck = checkRateLimit(ip, 5, 10000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Too many transfer requests. Please slow down.",
          retryAfterMs: rateCheck.retryAfterMs,
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate payload strictly with Zod
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const parsed = TransferRequestSchema.safeParse(rawBody);
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

    const input = parsed.data;

    // 3. Strict Server-Side Telegram initData verification (HMAC-SHA-256 only)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const auth = verifyTelegramWebAppData(input.initData, botToken);
    if (!auth.isValid || !auth.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid or tampered Telegram session signature",
        },
        { status: 401 }
      );
    }

    // 4. Ensure authenticated Telegram user owns the sender wallet address
    const senderWallet = await getOrCreateWallet(auth.user.id);
    if (senderWallet.address.toLowerCase() !== input.fromAddress.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Sender address does not belong to authenticated Telegram user",
        },
        { status: 403 }
      );
    }

    // 5. Execute atomic transfer with ledger verification, nonce increment, and signatures
    const transferReceipt = await executeSecureTransfer(input);

    return NextResponse.json({
      success: true,
      transaction: transferReceipt,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Transfer processing failed",
      },
      { status: 400 }
    );
  }
}
