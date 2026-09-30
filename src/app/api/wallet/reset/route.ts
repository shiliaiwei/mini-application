import { NextRequest, NextResponse } from "next/server";
import { resetAllCurrencyStoresToGenesis } from "@/lib/wallet/ledger";
import { checkRateLimit } from "@/lib/wallet/security";

/**
 * Resets all currency stores, game scores, and earnings in the database to Block 0 (Genesis state).
 * Sets all dollar, Khmer coin, and time course earnings to 0 so all users start from zero.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client-unknown";
    const rateCheck = checkRateLimit(ip, 2, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many reset requests. Please wait." },
        { status: 429 }
      );
    }

    const result = await resetAllCurrencyStoresToGenesis();

    return NextResponse.json({
      message: "All currency stores reset to Block 0 Genesis state successfully",
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Reset failed" },
      { status: 500 }
    );
  }
}
