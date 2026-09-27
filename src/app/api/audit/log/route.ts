import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Mask IP address to prevent PII exposure (e.g. 192.168.1.10 -> 192.168.***.***)
function maskIp(ip: string): string {
  if (!ip) return "::1";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
  }
  return ip.slice(0, 8) + "...";
}

export async function POST(req: Request) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { telegram_id, action, platform, details, city_country } = body;

    const cleanId = String(telegram_id || "").replace(/[^0-9]/g, "").slice(0, 32);
    if (!cleanId) {
      return NextResponse.json({ error: "Valid telegram_id required" }, { status: 400 });
    }

    const cleanAction = String(action || "UNKNOWN").slice(0, 64).toUpperCase().trim();
    const cleanDetails = String(details || "").slice(0, 500).trim();

    // Extract real client metadata from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ipAddress = (forwarded ? forwarded.split(",")[0] : realIp || "127.0.0.1")
      .replace(/[^a-fA-F0-9.:]/g, "")
      .trim()
      .slice(0, 45);

    const detectedCountry = String(req.headers.get("cf-ipcountry") || "Cambodia")
      .replace(/[^a-zA-Z\s]/g, "")
      .slice(0, 64);
    const finalLocation = String(city_country || detectedCountry).slice(0, 128);

    const userAgent = req.headers.get("user-agent") || "";
    let detectedPlatform = platform ? String(platform).slice(0, 64) : "TELEGRAM_WEB";
    if (!platform) {
      if (userAgent.includes("iPhone") || userAgent.includes("iPad")) detectedPlatform = "TELEGRAM_IOS";
      else if (userAgent.includes("Android")) detectedPlatform = "TELEGRAM_ANDROID";
      else if (userAgent.includes("Macintosh")) detectedPlatform = "TELEGRAM_MACOS";
      else if (userAgent.includes("Windows")) detectedPlatform = "TELEGRAM_WINDOWS";
    }

    const sql = neon(dbUrl);

    const result = await sql`
      INSERT INTO player_audit_logs (
        telegram_id, action, ip_address, platform, city_country, details, created_at
      )
      VALUES (
        ${cleanId},
        ${cleanAction},
        ${ipAddress},
        ${detectedPlatform},
        ${finalLocation},
        ${cleanDetails},
        NOW()
      )
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      log: result[0],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    console.error("Audit log error:", message);
    return NextResponse.json(
      { error: "Failed to record audit log" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const telegramIdParam = searchParams.get("telegram_id");
  const limitParam = searchParams.get("limit");

  if (!telegramIdParam) {
    return NextResponse.json({ error: "telegram_id parameter required" }, { status: 400 });
  }

  const cleanId = String(telegramIdParam).replace(/[^0-9]/g, "").slice(0, 32);
  const safeLimit = Math.max(1, Math.min(50, parseInt(limitParam || "20", 10) || 20));

  try {
    const sql = neon(dbUrl);
    const rawLogs = await sql`
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
      LIMIT ${safeLimit};
    `;

    const logs = rawLogs.map((log: any) => ({
      ...log,
      ip_address: maskIp(log.ip_address),
    }));

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    console.error("Fetch audit logs error:", message);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
