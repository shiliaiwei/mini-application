import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      telegram_id,
      first_name,
      last_name,
      username,
      photo_url,
      score,
      spend_seconds,
    } = body;

    // Cloudflare Security Audit: Strict Input Sanitization
    const cleanId = String(telegram_id || "").replace(/[^0-9]/g, "").slice(0, 32);
    if (!cleanId) {
      return NextResponse.json(
        { error: "Valid numeric telegram_id required" },
        { status: 400 }
      );
    }

    const cleanFirstName = String(first_name || "Player").slice(0, 64).trim();
    const cleanLastName = last_name ? String(last_name).slice(0, 64).trim() : null;
    const cleanUsername = username ? String(username).replace(/[^a-zA-Z0-9_]/g, "").slice(0, 64) : null;
    const cleanPhotoUrl = photo_url && typeof photo_url === "string" && photo_url.startsWith("https://")
      ? photo_url.slice(0, 255)
      : null;

    const safeScore = Math.max(0, Math.min(100_000_000, Math.floor(Number(score) || 0)));
    const safeSpendSeconds = Math.max(0, Math.min(100_000_000, Math.floor(Number(spend_seconds) || 0)));

    const sql = neon(dbUrl);

    // Upsert player record with parameterized SQL
    const upsertResult = await sql`
      INSERT INTO game_players (
        telegram_id, first_name, last_name, username, photo_url, score, spend_seconds, updated_at
      )
      VALUES (
        ${cleanId}, 
        ${cleanFirstName}, 
        ${cleanLastName}, 
        ${cleanUsername}, 
        ${cleanPhotoUrl}, 
        ${safeScore}, 
        ${safeSpendSeconds}, 
        NOW()
      )
      ON CONFLICT (telegram_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        username = EXCLUDED.username,
        photo_url = COALESCE(EXCLUDED.photo_url, game_players.photo_url),
        score = GREATEST(game_players.score, EXCLUDED.score),
        spend_seconds = GREATEST(game_players.spend_seconds, EXCLUDED.spend_seconds),
        updated_at = NOW()
      RETURNING *;
    `;

    const player = upsertResult[0];

    // Calculate real rank
    const rankResult = await sql`
      SELECT COUNT(*) + 1 as rank 
      FROM game_players 
      WHERE score > ${player.score};
    `;

    const rank = parseInt(rankResult[0].rank, 10) || 1;

    return NextResponse.json({
      success: true,
      player,
      rank,
    });
  } catch (err: any) {
    console.error("Player sync error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
