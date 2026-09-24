import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

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
    const ipAddress = (forwarded ? forwarded.split(",")[0] : realIp || "127.0.0.1").trim().slice(0, 64);

    const detectedCountry = req.headers.get("cf-ipcountry") || "Cambodia";
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
  } catch (err: any) {
    console.error("Audit log error:", err);
    return NextResponse.json(
      { error: "Failed to record audit log", details: err.message },
      { status: 500 }
    );
  }
}
