import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Vercel Security Config: vercel.json restricts iframe embedding to Telegram clients only", () => {
  const vercelPath = path.resolve(__dirname, "../vercel.json");
  assert.equal(fs.existsSync(vercelPath), true, "vercel.json must exist in root");

  const config = JSON.parse(fs.readFileSync(vercelPath, "utf-8"));
  assert.ok(Array.isArray(config.headers), "vercel.json must define headers array");

  const globalHeaders = config.headers.find((h: any) => h.source === "/(.*)");
  assert.ok(globalHeaders, "Must have global header rules for /(.*)");

  const cspHeader = globalHeaders.headers.find(
    (h: any) => h.key === "Content-Security-Policy"
  );
  assert.ok(cspHeader, "Must contain Content-Security-Policy header");
  assert.ok(
    cspHeader.value.includes("frame-ancestors") &&
      cspHeader.value.includes("https://web.telegram.org"),
    "CSP must restrict frame-ancestors to Telegram domains"
  );
  assert.ok(
    cspHeader.value.includes("default-src 'self'"),
    "CSP must define default-src 'self'"
  );
  assert.ok(
    cspHeader.value.includes("script-src") && cspHeader.value.includes("https://telegram.org"),
    "CSP must whitelist Telegram scripts"
  );
  assert.ok(
    cspHeader.value.includes("connect-src") && cspHeader.value.includes("api.telegram.org"),
    "CSP must whitelist Telegram API connect endpoints"
  );
  assert.ok(
    cspHeader.value.includes("object-src 'none'"),
    "CSP must disallow plugins with object-src 'none'"
  );

  const robotsHeader = globalHeaders.headers.find((h: any) => h.key === "X-Robots-Tag");
  assert.ok(robotsHeader, "Must contain X-Robots-Tag");
  assert.equal(robotsHeader.value, "noindex, nofollow");
});

test("Edge Middleware: src/middleware.ts restricts web browser access and whitelists Telegram bot", () => {
  const middlewarePath = path.resolve(__dirname, "../src/middleware.ts");
  assert.equal(fs.existsSync(middlewarePath), true, "src/middleware.ts must exist");

  const content = fs.readFileSync(middlewarePath, "utf-8");

  // Webhook exemption
  assert.ok(
    content.includes("/api/bot/webhook"),
    "Middleware must whitelist /api/bot/webhook"
  );

  // Telegram detection
  assert.ok(
    content.includes("isTelegramBotRequest") && content.includes("@/lib/telegramAuth"),
    "Middleware must reuse isTelegramBotRequest from telegramAuth"
  );

  // 403 Port Access Restriction
  assert.ok(
    content.includes("status: 403") || content.includes("403"),
    "Middleware must return 403 for unauthorized browser access"
  );
  assert.ok(
    content.includes("Connection") && content.includes("close"),
    "Middleware must set Connection: close to terminate web browser port access"
  );
});

test("Dev Mode Controls: DevModeToolbar and Gate Screen bypass are wired", () => {
  const toolbarPath = path.resolve(
    __dirname,
    "../src/components/common/DevModeToolbar.tsx"
  );
  assert.equal(fs.existsSync(toolbarPath), true, "DevModeToolbar.tsx must exist");

  const toolbarContent = fs.readFileSync(toolbarPath, "utf-8");
  assert.ok(
    toolbarContent.includes("DEV MODE"),
    "DevModeToolbar must display DEV MODE indicator"
  );
  assert.ok(
    toolbarContent.includes("onToggleGate"),
    "DevModeToolbar must expose onToggleGate action"
  );

  const gateScreenPath = path.resolve(
    __dirname,
    "../src/components/common/TelegramGateScreen.tsx"
  );
  const gateContent = fs.readFileSync(gateScreenPath, "utf-8");
  assert.ok(
    gateContent.includes("isDev") && gateContent.includes("onBypass"),
    "TelegramGateScreen must handle isDev and onBypass props"
  );
});

test("Telegram Auth Utility: src/lib/telegramAuth.ts validates Telegram signatures correctly", async () => {
  const {
    isTelegramUserAgent,
    hasTelegramLaunchParams,
    isTelegramBotRequest,
    isLocalhostEnvironment,
    parseTelegramInitData,
  } = await import("../src/lib/telegramAuth");

  // User-Agent validation
  assert.equal(isTelegramUserAgent("TelegramMessenger"), true);
  assert.equal(isTelegramUserAgent("Telegram-Android/10.0"), true);
  assert.equal(
    isTelegramUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0"),
    false
  );
  assert.equal(isTelegramUserAgent(null), false);

  // Launch parameters validation
  const validParams = new URLSearchParams("tgWebAppVersion=7.0&tgWebAppData=auth_test");
  assert.equal(hasTelegramLaunchParams(validParams), true);
  const emptyParams = new URLSearchParams("utm_source=google");
  assert.equal(hasTelegramLaunchParams(emptyParams), false);

  // Consolidated request validation
  const telegramHeaders = {
    get: (key: string) => (key === "user-agent" ? "TelegramMessenger" : null),
  };
  assert.equal(isTelegramBotRequest(telegramHeaders), true);

  const browserHeaders = {
    get: (key: string) => (key === "user-agent" ? "Mozilla/5.0 Safari/537.36" : null),
  };
  assert.equal(isTelegramBotRequest(browserHeaders), false);

  // Localhost resolution
  assert.equal(isLocalhostEnvironment("localhost:3000"), true);
  assert.equal(isLocalhostEnvironment("127.0.0.1"), true);
  assert.equal(isLocalhostEnvironment("mini-application.vercel.app"), false);

  // InitData parsing
  const parsed = parseTelegramInitData("query_id=AAHd&user=%7B%22id%22%3A123%7D");
  assert.equal(parsed.query_id, "AAHd");
  assert.ok(parsed.user.includes("123"));
});

test("Primary Skill Documentation: telegram-bot-exclusive-access/SKILL.md is recorded", () => {
  const skillPath = path.resolve(
    __dirname,
    "../.agents/skills/telegram-bot-exclusive-access/SKILL.md"
  );
  assert.equal(fs.existsSync(skillPath), true, "Primary skill file SKILL.md must exist");

  const skillContent = fs.readFileSync(skillPath, "utf-8");
  assert.ok(
    skillContent.includes("name: telegram-bot-exclusive-access"),
    "Skill must specify name: telegram-bot-exclusive-access"
  );
  assert.ok(
    skillContent.includes("Deploy Checkpoint"),
    "Skill must document Deploy Checkpoint gate"
  );
  assert.ok(
    skillContent.includes("src/lib/telegramAuth.ts"),
    "Skill must reference src/lib/telegramAuth.ts"
  );
});

test("Cryptographic Anti-Forging: Rejects forged browser URLs with missing or invalid HMAC signature", async () => {
  const { verifyTelegramWebAppData } = await import("../src/lib/telegramCrypto");
  const testBotToken = "8873981639:AAEguH_DdmL2gzcN4k9Uth4vd6-g007Kxrk";

  // 1. Exact forged URL reported by user (missing hash parameter)
  const forgedPayload =
    "user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22tester%22%7D&tgWebAppVersion=7.0&tgWebAppPlatform=web";
  const forgedResult = verifyTelegramWebAppData(forgedPayload, testBotToken);
  assert.equal(forgedResult.isValid, false);
  assert.equal(forgedResult.error, "Missing required HMAC hash signature");

  // 2. Forged URL with fake arbitrary hash
  const fakeHashPayload = `${forgedPayload}&hash=deadbeefcafe1234`;
  const fakeHashResult = verifyTelegramWebAppData(fakeHashPayload, testBotToken);
  assert.equal(fakeHashResult.isValid, false);
  assert.equal(fakeHashResult.error, "Cryptographic HMAC signature mismatch");

  // 3. Legitimate Telegram payload with correct HMAC-SHA256 signature
  const crypto = await import("crypto");
  const authDate = Math.floor(Date.now() / 1000);
  const userJson = JSON.stringify({ id: 6600489302, first_name: "Srievi" });
  const dataCheckString = `auth_date=${authDate}\nuser=${userJson}`;
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(testBotToken)
    .digest();
  const validHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const validPayload = `auth_date=${authDate}&user=${encodeURIComponent(userJson)}&hash=${validHash}`;
  const validResult = verifyTelegramWebAppData(validPayload, testBotToken);
  assert.equal(validResult.isValid, true);
  assert.equal(validResult.user?.id, 6600489302);
});


