import { NextResponse } from "next/server";

interface CacheEntry {
  buffer: Buffer;
  contentType: string;
  expiresAt: number;
}

// In-memory cache for user avatars (15 minutes TTL) to prevent Telegram API rate limits
const avatarCache = new Map<string, CacheEntry>();

function createDefaultAvatarSvg(initial = "U"): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0098ea" />
      <stop offset="100%" stop-color="#005f99" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#bgGrad)" />
  <circle cx="64" cy="48" r="22" fill="#ffffff" fill-opacity="0.9" />
  <path d="M26 104 C26 84 43 78 64 78 C85 78 102 84 102 104 Z" fill="#ffffff" fill-opacity="0.9" />
</svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("telegram_id");
  const size = searchParams.get("size") || "medium";
  const refresh = searchParams.get("refresh") === "1";
  const checkOnly = searchParams.get("check") === "1" || searchParams.get("format") === "json";

  const cleanId = String(rawId || "").replace(/[^0-9]/g, "").slice(0, 32);
  if (!cleanId) {
    if (checkOnly) {
      return NextResponse.json({ success: false, error: "Valid numeric telegram_id required" }, { status: 400 });
    }
    const svg = createDefaultAvatarSvg("?");
    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const cacheKey = `${cleanId}_${size}`;
  const now = Date.now();

  // Return cached image if fresh and not forced refresh
  if (!refresh && avatarCache.has(cacheKey)) {
    const entry = avatarCache.get(cacheKey)!;
    if (entry.expiresAt > now) {
      if (checkOnly) {
        return NextResponse.json({ success: true, hasPhoto: true, cached: true });
      }
      return new Response(new Uint8Array(entry.buffer), {
        status: 200,
        headers: {
          "Content-Type": entry.contentType,
          "Content-Length": String(entry.buffer.length),
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    if (checkOnly) {
      return NextResponse.json({ success: false, error: "Bot token not configured" }, { status: 500 });
    }
    const svg = createDefaultAvatarSvg("U");
    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  try {
    // 1. Query Telegram Bot API for user's profile photos
    const photosRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${cleanId}&limit=1`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

    const photosJson = await photosRes.json();

    if (!photosJson.ok || !photosJson.result?.photos?.length || !photosJson.result.photos[0]?.length) {
      if (checkOnly) {
        return NextResponse.json({ success: true, hasPhoto: false });
      }
      const svg = createDefaultAvatarSvg("U");
      return new Response(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const photoSizes: Array<{ file_id: string; width: number; height: number }> = photosJson.result.photos[0];

    // Pick size:
    // small: 160x160 (photoSizes[0])
    // medium: 320x320 (photoSizes[1] || photoSizes[0])
    // large: largest (photoSizes[photoSizes.length - 1])
    let selectedPhoto = photoSizes[0];
    if (size === "large") {
      selectedPhoto = photoSizes[photoSizes.length - 1];
    } else if (size === "small") {
      selectedPhoto = photoSizes[0];
    } else {
      selectedPhoto = photoSizes.length > 1 ? photoSizes[1] : photoSizes[0];
    }

    // 2. Fetch File Path from Telegram Bot API
    const fileRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${selectedPhoto.file_id}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

    const fileJson = await fileRes.json();
    if (!fileJson.ok || !fileJson.result?.file_path) {
      if (checkOnly) {
        return NextResponse.json({ success: true, hasPhoto: false });
      }
      const svg = createDefaultAvatarSvg("U");
      return new Response(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // 3. Download the actual photo file from Telegram's secure CDN
    const filePath = fileJson.result.file_path;
    const downloadRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);

    if (!downloadRes.ok) {
      if (checkOnly) {
        return NextResponse.json({ success: false, error: "Failed to download avatar" }, { status: 502 });
      }
      const svg = createDefaultAvatarSvg("U");
      return new Response(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const arrayBuffer = await downloadRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = "image/jpeg";

    // Cache for 15 minutes (900 seconds)
    avatarCache.set(cacheKey, {
      buffer,
      contentType,
      expiresAt: now + 15 * 60 * 1000,
    });

    if (checkOnly) {
      return NextResponse.json({
        success: true,
        hasPhoto: true,
        width: selectedPhoto.width,
        height: selectedPhoto.height,
        photoUrl: `/api/player/avatar?telegram_id=${cleanId}`,
      });
    }

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: unknown) {
    console.error("Avatar proxy error:", err);
    if (checkOnly) {
      return NextResponse.json({ success: false, error: "Internal avatar fetch error" }, { status: 500 });
    }
    const svg = createDefaultAvatarSvg("U");
    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
