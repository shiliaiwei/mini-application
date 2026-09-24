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

    if (!telegram_id) {
      return NextResponse.json(
        { error: "telegram_id required" },
        { status: 400 }
      );
    }

    const sql = neon(dbUrl);

    // Upsert player record
    const upsertResult = await sql`
      INSERT INTO game_players (
        telegram_id, first_name, last_name, username, photo_url, score, spend_seconds, updated_at
      )
      VALUES (
        ${telegram_id}, 
        ${first_name || "Player"}, 
        ${last_name || null}, 
        ${username || null}, 
        ${photo_url || null}, 
        ${Number(score) || 0}, 
        ${Number(spend_seconds) || 0}, 
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

    const rank = Number(rankResult[0]?.rank) || 1;

    return NextResponse.json({
      success: true,
      player,
      rank,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Database sync error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
