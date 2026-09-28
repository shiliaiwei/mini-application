import { NextResponse } from "next/server";

// Cloudflare Security Audit Hardened: Owner-Only Access Control List
const OWNER_TELEGRAM_IDS = new Set([
  process.env.ADMIN_CHAT_ID || "",
  process.env.ADMIN_TELEGRAM_ID || "",
  "6600489302",
].filter(Boolean));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawTelegramId = searchParams.get("telegram_id");
  const authHeader = req.headers.get("authorization") || "";

  // 1. Strict Input Sanitization
  const cleanId = String(rawTelegramId || "").replace(/[^0-9]/g, "").slice(0, 32);

  // 2. Authorization Verification (BOLA/IDOR Defense)
  const isAuthorizedOwner = cleanId ? OWNER_TELEGRAM_IDS.has(cleanId) : false;
  const isInternalAdmin = process.env.ADMIN_SECRET_KEY
    ? authHeader === `Bearer ${process.env.ADMIN_SECRET_KEY}`
    : false;

  if (!isAuthorizedOwner && !isInternalAdmin) {
    return NextResponse.json(
      {
        success: false,
        error: "Access Denied: Diagnostic telemetry is strictly restricted to authenticated account owners.",
      },
      { status: 403 }
    );
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  // Extract and sanitize client network telemetry from request headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  const rawIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "::1";
  const clientIp = rawIp.replace(/[^a-fA-F0-9.:]/g, "").slice(0, 45) || "::1";

  const clientCountry = String(req.headers.get("cf-ipcountry") || "Cambodia")
    .replace(/[^a-zA-Z\s]/g, "")
    .slice(0, 64);

  const rawUserAgent = req.headers.get("user-agent") || "Unknown Device";
  const userAgent = rawUserAgent.slice(0, 256);

  let botProfileData: Record<string, unknown> | null = null;
  let userPhotosData: Record<string, unknown> | null = null;
  let lastActiveTimestamp: string = new Date().toISOString();

  if (botToken && cleanId) {
    try {
      const [chatRes, photosRes, updatesRes] = await Promise.all([
        fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${cleanId}`, {
          cache: "no-store",
          headers: { "Accept": "application/json" },
        }),
        fetch(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${cleanId}&limit=1`, {
          cache: "no-store",
          headers: { "Accept": "application/json" },
        }),
        fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=10`, {
          cache: "no-store",
          headers: { "Accept": "application/json" },
        }).catch(() => null),
      ]);

      const chatJson = await chatRes.json();
      if (chatJson.ok && chatJson.result) {
        botProfileData = chatJson.result;
      }

      const photosJson = await photosRes.json();
      if (photosJson.ok && photosJson.result) {
        userPhotosData = photosJson.result;
      }

      if (updatesRes) {
        const updatesJson = await updatesRes.json();
        if (updatesJson.ok && Array.isArray(updatesJson.result) && updatesJson.result.length > 0) {
          const matchingUpdates = updatesJson.result.filter(
            (u: { message?: { from?: { id: number } } }) => String(u.message?.from?.id) === cleanId
          );
          if (matchingUpdates.length > 0) {
            const latest = matchingUpdates[matchingUpdates.length - 1];
            if (latest.message?.date) {
              lastActiveTimestamp = new Date(latest.message.date * 1000).toISOString();
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error("Secure Bot API telemetry query error:", err);
    }
  }

  return NextResponse.json({
    success: true,
    telemetry: {
      network: {
        ip_address: clientIp,
        country: clientCountry,
        user_agent: userAgent,
        server_timestamp: new Date().toISOString(),
      },
      bot: {
        bot_username: process.env.TELEGRAM_BOT_USERNAME || "srievibot",
        bot_id: "8873981639",
        profile: botProfileData,
        photos: userPhotosData,
        last_active: lastActiveTimestamp,
      },
    },
  });
}
