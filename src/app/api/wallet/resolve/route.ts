import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isValidAddress } from "@/lib/wallet/crypto";
import { getOrCreateWallet, getWalletByAddress } from "@/lib/wallet/ledger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("target")?.trim();

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Target parameter is required" },
        { status: 400 }
      );
    }

    // 1. Direct WC address
    if (isValidAddress(target)) {
      const wallet = await getWalletByAddress(target);
      if (wallet) {
        return NextResponse.json({
          success: true,
          address: wallet.address,
          telegram_id: wallet.telegram_id.toString(),
        });
      }
      return NextResponse.json(
        { success: false, error: "Address not found in wallet registry" },
        { status: 404 }
      );
    }

    // 2. Resolve via @username
    const cleanUsername = target.replace(/^@/, "").toLowerCase();
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const sql = neon(dbUrl);
    const rows = await sql`
      SELECT telegram_id, username, first_name 
      FROM game_players 
      WHERE LOWER(username) = ${cleanUsername}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: `User @${cleanUsername} not found` },
        { status: 404 }
      );
    }

    const recipientTgId = BigInt(rows[0].telegram_id);
    const wallet = await getOrCreateWallet(recipientTgId);

    return NextResponse.json({
      success: true,
      address: wallet.address,
      telegram_id: recipientTgId.toString(),
      username: rows[0].username,
      first_name: rows[0].first_name,
    });
  } catch (error: unknown) {
    console.error("Resolve error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve recipient" },
      { status: 500 }
    );
  }
}
