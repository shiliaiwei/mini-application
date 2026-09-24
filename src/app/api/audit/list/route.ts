import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const telegramIdParam = searchParams.get("telegram_id");

  if (!telegramIdParam) {
    return NextResponse.json({ error: "telegram_id parameter required" }, { status: 400 });
  }

  const cleanId = String(telegramIdParam).replace(/[^0-9]/g, "").slice(0, 32);

  try {
    const sql = neon(dbUrl);
    const logs = await sql`
      SELECT 
        id, 
        telegram_id, 
        action, 
        ip_address, 
        platform, 
        city_country, 
        details, 
        created_at
      FROM player_audit_logs
      WHERE telegram_id = ${cleanId}
      ORDER BY created_at DESC
      LIMIT 40;
    `;

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (err: any) {
    console.error("Fetch audit logs error:", err);
    return NextResponse.json(
      { error: "Failed to fetch audit logs", details: err.message },
      { status: 500 }
    );
  }
}
