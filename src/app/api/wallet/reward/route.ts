import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegramCrypto";
import { checkRateLimit } from "@/lib/wallet/security";
import { GameRewardRequestSchema } from "@/lib/wallet/validation";
import { executeGameReward, getOrCreateWallet } from "@/lib/wallet/ledger";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-unknown";
    const rateCheck = checkRateLimit(ip, 5, 10000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many reward claim requests. Please wait." },
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

    const parsed = GameRewardRequestSchema.safeParse(rawBody);
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

    const { toAddress, gameId, score, spendSeconds, initData } = parsed.data;

    const auth = verifyTelegramWebAppData(initData, process.env.TELEGRAM_BOT_TOKEN);
    if (!auth.isValid || !auth.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized Telegram session" },
        { status: 401 }
      );
    }

    const recipientWallet = await getOrCreateWallet(auth.user.id);
    if (recipientWallet.address.toLowerCase() !== toAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Reward can only be claimed for authenticated user wallet" },
        { status: 403 }
      );
    }

    const rewardResult = await executeGameReward(toAddress, gameId, score, spendSeconds);

    return NextResponse.json({
      success: true,
      reward: rewardResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Reward settlement failed" },
      { status: 400 }
    );
  }
}
