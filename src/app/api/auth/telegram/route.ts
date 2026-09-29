import { NextResponse } from "next/server";
import { TelegramAuthSchema } from "@/lib/wallet/validation";
import { authenticateAndProvisionUser } from "@/lib/wallet/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = TelegramAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const session = await authenticateAndProvisionUser(parsed.data.initData);

    return NextResponse.json({
      success: true,
      user: session.user,
      wallet: session.wallet,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Telegram authentication failed" },
      { status: 401 }
    );
  }
}
