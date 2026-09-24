import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });
  }

  try {
    const sql = neon(dbUrl);

    // Fetch real players ranked by score descending, spend_seconds ascending
    const players = await sql`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY score DESC, spend_seconds ASC) as rank,
        telegram_id,
        first_name,
        last_name,
        username,
        photo_url,
        score,
        spend_seconds
      FROM game_players
      ORDER BY score DESC, spend_seconds ASC
      LIMIT 100;
    `;

    return NextResponse.json({
      success: true,
      count: players.length,
      players,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Leaderboard fetch error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
