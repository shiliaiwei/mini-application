/**
 * Authoritative Telegram Mini App Bot Request Validation & Authentication Utility
 * Reused across Edge Middleware, Server API routes, and Client-Side verification.
 */

// Known Telegram client User-Agent identifiers across iOS, Android, Desktop, and Web
const TELEGRAM_USER_AGENT_PATTERN =
  /Telegram|TelegramBot|TelegramMessenger|Telegram-Android|tdesktop/i;

// Official Telegram WebApp launch query parameters
const TELEGRAM_QUERY_PARAMS = [
  "tgWebAppVersion",
  "tgWebAppData",
  "tgWebAppStartParam",
  "tgWebAppPlatform",
  "tgWebAppThemeParams",
];

/**
 * Checks whether a given User-Agent string matches official Telegram clients
 */
export function isTelegramUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return TELEGRAM_USER_AGENT_PATTERN.test(userAgent);
}

/**
 * Checks whether request search parameters contain Telegram WebApp launch parameters
 */
export function hasTelegramLaunchParams(
  searchParams: { has: (name: string) => boolean } | null | undefined
): boolean {
  if (!searchParams) return false;
  return TELEGRAM_QUERY_PARAMS.some((param) => searchParams.has(param));
}

/**
 * Checks whether the referer originates from an official Telegram domain
 */
export function isTelegramReferer(referer: string | null | undefined): boolean {
  if (!referer) return false;
  return /telegram\.org/i.test(referer);
}

/**
 * Checks whether the hostname is a local development environment
 */
export function isLocalhostEnvironment(host: string | null | undefined): boolean {
  if (!host) return false;
  return (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0") ||
    host.includes(".local")
  );
}

export interface TelegramRequestHeaders {
  get: (name: string) => string | null;
}

export interface TelegramSearchParams {
  has: (name: string) => boolean;
}

/**
 * Master validation function: Determines whether an incoming HTTP request
 * originates exclusively from within the Telegram Mini App Bot environment.
 */
export function isTelegramBotRequest(
  headers: TelegramRequestHeaders,
  searchParams?: TelegramSearchParams
): boolean {
  const userAgent = headers.get("user-agent") || "";
  if (isTelegramUserAgent(userAgent)) return true;

  if (searchParams && hasTelegramLaunchParams(searchParams)) return true;

  const referer = headers.get("referer") || "";
  if (isTelegramReferer(referer)) return true;

  return false;
}

/**
 * Parses URL-encoded initData string into key-value pairs
 */
export function parseTelegramInitData(initDataString: string): Record<string, string> {
  if (!initDataString) return {};
  const params = new URLSearchParams(initDataString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}
