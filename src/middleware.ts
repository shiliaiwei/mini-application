import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTelegramBotRequest, isLocalhostEnvironment } from "@/lib/telegramAuth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Whitelist Telegram Bot Webhook & Auth validation endpoints
  if (pathname === "/api/bot/webhook" || pathname === "/api/auth/validate-telegram") {
    return NextResponse.next();
  }

  // 2. Resolve hostname for local development bypass
  const host = request.headers.get("host") || "";
  const isLocal = isLocalhostEnvironment(host);

  if (isLocal) {
    const response = NextResponse.next();
    response.headers.set("X-Dev-Environment", "localhost");
    return response;
  }

  // 3. Detect Telegram Mini App Bot client signatures via centralized utility
  // On API routes, strictly evaluate headers to prevent query parameter spoofing
  const isApiRoute = pathname.startsWith("/api/");
  const isTelegramClient = isTelegramBotRequest(
    request.headers,
    isApiRoute ? undefined : request.nextUrl.searchParams
  );

  // 4. Handle API routes - Immediately terminate port access for external web browsers
  if (pathname.startsWith("/api/")) {
    if (!isTelegramClient) {
      return NextResponse.json(
        {
          error: "Forbidden: Port access restricted to Telegram Bot client only.",
          code: 403,
          channel: "https://t.me/shiliaiwei",
          bot: "https://t.me/srievibot/app",
        },
        {
          status: 403,
          headers: {
            "Connection": "close",
            "X-Port-Access": "Restricted-To-Telegram-Bot",
            "X-Robots-Tag": "noindex, nofollow",
          },
        }
      );
    }
  }

  // 5. Pass through page requests with verification metadata
  const response = NextResponse.next();
  response.headers.set("X-Telegram-Client", isTelegramClient ? "true" : "false");
  if (!isTelegramClient) {
    response.headers.set("Connection", "close");
    response.headers.set("X-Port-Access", "Restricted-To-Telegram-Bot");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - backgrounds (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|backgrounds/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
