/**
 * Server-Side Cryptographic Telegram HMAC-SHA256 Validation Engine
 * Executes in Node.js runtime for API route verification.
 */

import crypto from "crypto";

export interface TelegramValidationResult {
  isValid: boolean;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  authDate?: number;
  error?: string;
}

/**
 * Cryptographically verifies official Telegram initData using HMAC-SHA256.
 * Rejects forged URLs, missing signatures, tampered user data, or missing user identities.
 */
export function verifyTelegramWebAppData(
  initData: string | null | undefined,
  botToken: string | null | undefined
): TelegramValidationResult {
  if (!initData) {
    return { isValid: false, error: "Missing initData payload" };
  }
  if (!botToken) {
    return { isValid: false, error: "TELEGRAM_BOT_TOKEN missing from environment" };
  }

  try {
    let cleanData = initData;
    if (cleanData.startsWith("#tgWebAppData=")) {
      cleanData = cleanData.replace("#tgWebAppData=", "");
    } else if (cleanData.startsWith("tgWebAppData=")) {
      cleanData = cleanData.replace("tgWebAppData=", "");
    }

    const urlParams = new URLSearchParams(cleanData);
    const hash = urlParams.get("hash");
    if (!hash) {
      return { isValid: false, error: "Missing required HMAC hash signature" };
    }

    urlParams.delete("hash");

    // Sort parameters alphabetically
    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckString = keys
      .map((key) => `${key}=${urlParams.get(key)}`)
      .join("\n");

    // Telegram HMAC key: HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // Timing-safe constant-time comparison to prevent timing side-channel attacks
    const calcBuf = Buffer.from(calculatedHash.toLowerCase(), "utf-8");
    const hashBuf = Buffer.from(hash.toLowerCase(), "utf-8");
    if (calcBuf.length !== hashBuf.length || !crypto.timingSafeEqual(calcBuf, hashBuf)) {
      return { isValid: false, error: "Cryptographic HMAC signature mismatch" };
    }

    // Double Check 1: User must specifically originate from Telegram with valid numeric ID
    const userRaw = urlParams.get("user");
    let user = undefined;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw);
      } catch {}
    }

    if (!user || typeof user.id !== "number" || user.id <= 0) {
      return { isValid: false, error: "Missing or invalid Telegram user identity" };
    }

    // Double Check 2: Session freshness verification (auth_date within 24 hours)
    const authDateStr = urlParams.get("auth_date");
    const authDate = authDateStr ? parseInt(authDateStr, 10) : undefined;
    if (authDate) {
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - authDate) > 86400) {
        return { isValid: false, error: "Telegram session expired (auth_date > 24 hours)" };
      }
    }

    return { isValid: true, user, authDate };
  } catch (err: any) {
    return { isValid: false, error: err?.message || "Validation error" };
  }
}
