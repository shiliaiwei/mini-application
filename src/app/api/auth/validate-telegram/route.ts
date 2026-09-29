import { NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegramCrypto";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { initData, telegram_id, username, first_name } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const dbUrl = process.env.DATABASE_URL;

    // 1. Cryptographic HMAC validation for Telegram WebApp initData payload
    if (initData) {
      if (!botToken) {
        return NextResponse.json(
          { valid: false, error: "Server authentication token not configured" },
          { status: 500 }
        );
      }

      const validation = verifyTelegramWebAppData(initData, botToken);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            valid: false,
            error: validation.error || "Invalid cryptographic Telegram signature",
          },
          { status: 403 }
        );
      }

      const userWithAvatar = validation.user
        ? {
            ...validation.user,
            photo_url:
              validation.user.photo_url ||
              `/api/player/avatar?telegram_id=${validation.user.id}`,
          }
        : undefined;

      return NextResponse.json({
        valid: true,
        user: userWithAvatar,
        authDate: validation.authDate,
      });
    }

    // 2. Direct Telegram Account Sync for Web access
    const cleanId = String(telegram_id || "").replace(/[^0-9]/g, "").slice(0, 32);
    if (!cleanId || Number(cleanId) <= 0) {
      return NextResponse.json(
        { valid: false, error: "Valid numeric Telegram User ID required for account sync" },
        { status: 400 }
      );
    }

    const numericId = Number(cleanId);
    let resolvedFirstName = String(first_name || "").trim().slice(0, 64);
    let resolvedUsername = username
      ? String(username).replace(/[^a-zA-Z0-9_]/g, "").slice(0, 64)
      : undefined;
    let photoUrl = `/api/player/avatar?telegram_id=${cleanId}`;

    // Lookup existing profile in Neon database if available
    if (dbUrl) {
      try {
        const sql = neon(dbUrl);
        const rows = await sql`
          SELECT telegram_id, first_name, username, photo_url 
          FROM game_players 
          WHERE telegram_id = ${cleanId} 
          LIMIT 1;
        `;
        if (rows.length > 0) {
          if (!resolvedFirstName && rows[0].first_name) {
            resolvedFirstName = rows[0].first_name;
          }
          if (!resolvedUsername && rows[0].username) {
            resolvedUsername = rows[0].username;
          }
          if (rows[0].photo_url) {
            photoUrl = rows[0].photo_url;
          }
        }
      } catch (dbErr) {
        console.warn("Player lookup notice:", dbErr);
      }
    }

    // Lookup authentic Telegram profile from Bot API if name/username wasn't provided
    if (botToken && (!resolvedFirstName || !resolvedUsername)) {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${botToken}/getChat?chat_id=${cleanId}`,
          { next: { revalidate: 3600 } }
        );
        const chatData = await res.json();
        if (chatData?.ok && chatData?.result) {
          if (chatData.result.first_name) resolvedFirstName = chatData.result.first_name;
          if (chatData.result.username) resolvedUsername = chatData.result.username;
        }
      } catch {}
    }

    if (!resolvedFirstName) {
      resolvedFirstName = resolvedUsername
        ? `@${resolvedUsername}`
        : `Telegram User #${cleanId.slice(-4)}`;
    }

    const syncedUser = {
      id: numericId,
      first_name: resolvedFirstName,
      username: resolvedUsername,
      photo_url: photoUrl,
    };

    return NextResponse.json({
      valid: true,
      user: syncedUser,
      syncedAt: Date.now(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { valid: false, error: err instanceof Error ? err.message : "Internal validation error" },
      { status: 400 }
    );
  }
}
