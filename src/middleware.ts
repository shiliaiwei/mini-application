import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTelegramBotRequest } from "@/lib/telegramAuth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Whitelist Telegram Bot Webhook & Auth validation endpoints
  if (pathname === "/api/bot/webhook" || pathname === "/api/auth/validate-telegram") {
    return NextResponse.next();
  }

  // 2. Detect Telegram Mini App Bot client signatures via centralized utility
  const isApiRoute = pathname.startsWith("/api/");
  const isTelegramClient = isTelegramBotRequest(
    request.headers,
    isApiRoute ? undefined : request.nextUrl.searchParams
  );

  // 3. Pass through all requests: Unrestricted access for both Web and Telegram Mini App
  // Both platforms are allowed full access; sessions must have a synced Telegram account
  const response = NextResponse.next();
  response.headers.set("X-Telegram-Client", isTelegramClient ? "true" : "false");
  response.headers.set("X-Platform-Access", "Unrestricted-Telegram-Sync");

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
