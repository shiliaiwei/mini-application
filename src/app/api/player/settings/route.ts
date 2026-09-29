import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * GET /api/player/settings?telegram_id=...
 * Retrieves server-persisted user settings
 */
export async function GET(req: Request) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const telegramId = searchParams.get("telegram_id");
    const cleanId = String(telegramId || "").replace(/[^0-9]/g, "").slice(0, 32);

    if (!cleanId) {
      return NextResponse.json({ error: "Valid telegram_id required" }, { status: 400 });
    }

    const sql = neon(dbUrl);

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        telegram_id VARCHAR(64) PRIMARY KEY,
        settings JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const rows = await sql`
      SELECT settings, updated_at 
      FROM user_settings 
      WHERE telegram_id = ${cleanId}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ found: false, settings: null });
    }

    return NextResponse.json({
      found: true,
      settings: rows[0].settings,
      updated_at: rows[0].updated_at,
    });
  } catch (err: unknown) {
    console.error("GET /api/player/settings error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/player/settings
 * Upserts server-persisted user settings
 */
export async function POST(req: Request) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { telegram_id, settings } = body;

    const cleanId = String(telegram_id || "").replace(/[^0-9]/g, "").slice(0, 32);
    if (!cleanId) {
      return NextResponse.json({ error: "Valid telegram_id required" }, { status: 400 });
    }

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Valid settings object required" }, { status: 400 });
    }

    const sql = neon(dbUrl);

    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        telegram_id VARCHAR(64) PRIMARY KEY,
        settings JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const settingsJson = JSON.stringify(settings);

    const rows = await sql`
      INSERT INTO user_settings (telegram_id, settings, updated_at)
      VALUES (${cleanId}, ${settingsJson}::jsonb, NOW())
      ON CONFLICT (telegram_id) DO UPDATE SET
        settings = EXCLUDED.settings,
        updated_at = NOW()
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      telegram_id: cleanId,
      updated_at: rows[0]?.updated_at,
    });
  } catch (err: unknown) {
    console.error("POST /api/player/settings error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
