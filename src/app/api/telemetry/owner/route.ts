import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get("telegram_id");
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  // Extract client telemetry from request headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "::1";
  const clientCountry = req.headers.get("cf-ipcountry") || "Cambodia";
  const userAgent = req.headers.get("user-agent") || "Unknown Device";

  let botProfileData: Record<string, unknown> | null = null;
  let userPhotosData: Record<string, unknown> | null = null;
  let lastActiveTimestamp: string = new Date().toISOString();

  if (botToken && telegramId) {
    try {
      const [chatRes, photosRes, updatesRes] = await Promise.all([
        fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${telegramId}`, { cache: "no-store" }),
        fetch(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${telegramId}&limit=1`, { cache: "no-store" }),
        fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=10`, { cache: "no-store" }).catch(() => null),
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
            (u: { message?: { from?: { id: number } } }) => String(u.message?.from?.id) === String(telegramId)
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
      console.error("Failed to query Telegram Bot API:", err);
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
