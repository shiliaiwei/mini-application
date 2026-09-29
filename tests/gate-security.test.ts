import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Vercel Security Config: vercel.json restricts iframe embedding to Telegram clients only", () => {
  const vercelPath = path.resolve(__dirname, "../vercel.json");
  assert.equal(fs.existsSync(vercelPath), true, "vercel.json must exist in root");

  const config = JSON.parse(fs.readFileSync(vercelPath, "utf-8"));
  assert.ok(Array.isArray(config.headers), "vercel.json must define headers array");

  interface HeaderRule {
    key: string;
    value: string;
  }
  interface HeaderGroup {
    source: string;
    headers: HeaderRule[];
  }

  const globalHeaders = (config.headers as HeaderGroup[]).find(
    (h: HeaderGroup) => h.source === "/(.*)"
  );
  assert.ok(globalHeaders, "Must have global header rules for /(.*)");

  const cspHeader = globalHeaders.headers.find(
    (h: HeaderRule) => h.key === "Content-Security-Policy"
  );
  assert.ok(cspHeader, "Must contain Content-Security-Policy header");

  const cspDirectives = (cspHeader.value as string)
    .split(";")
    .map((d: string) => d.trim().split(/\s+/));
  const directiveMap = new Map(cspDirectives.map(([name, ...vals]) => [name, vals]));

  const frameTokens = directiveMap.get("frame-ancestors") || [];
  assert.equal(frameTokens.some((t) => t === "https://web.telegram.org"), true, "CSP must restrict frame-ancestors to Telegram domains");

  const defaultTokens = directiveMap.get("default-src") || [];
  assert.equal(defaultTokens.some((t) => t === "'self'"), true, "CSP must define default-src 'self'");

  const scriptTokens = directiveMap.get("script-src") || [];
  assert.equal(scriptTokens.some((t) => t === "https://telegram.org"), true, "CSP must whitelist Telegram scripts");

  const connectTokens = directiveMap.get("connect-src") || [];
  assert.equal(connectTokens.some((t) => t === "https://api.telegram.org"), true, "CSP must whitelist Telegram API connect endpoints");

  const objectTokens = directiveMap.get("object-src") || [];
  assert.equal(objectTokens.some((t) => t === "'none'"), true, "CSP must disallow plugins with object-src 'none'");

  const robotsHeader = globalHeaders.headers.find((h: HeaderRule) => h.key === "X-Robots-Tag");
  assert.ok(robotsHeader, "Must contain X-Robots-Tag");
  assert.equal(robotsHeader.value, "noindex, nofollow");
});

test("Edge Middleware: src/middleware.ts enables web and mini app access with Telegram detection", () => {
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

  // Unrestricted access with platform headers
  assert.ok(
    content.includes("X-Telegram-Client"),
    "Middleware must set X-Telegram-Client header"
  );
  assert.ok(
    content.includes("X-Platform-Access"),
    "Middleware must set X-Platform-Access header for unrestricted access"
  );
});

test("Zero Dev Mode: Dev mode toolbar and artificial bypasses are eliminated for unified user access", () => {
  const pagePath = path.resolve(__dirname, "../src/app/page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf-8");

  assert.equal(
    pageContent.includes("DevModeToolbar"),
    false,
    "DevModeToolbar must be removed from page.tsx"
  );
  assert.equal(
    pageContent.includes("isLocalTest"),
    false,
    "isLocalTest must be removed from page.tsx"
  );

  const gateScreenPath = path.resolve(
    __dirname,
    "../src/components/common/TelegramGateScreen.tsx"
  );
  const gateContent = fs.readFileSync(gateScreenPath, "utf-8");
  assert.equal(
    gateContent.includes("DEV MODE PREVIEW"),
    false,
    "TelegramGateScreen must not contain dev mode preview banner"
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
  const testBotToken = "mock_test_token_dev_environment_only_123456789";

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

  // 4. Missing or invalid Telegram user identity (must strictly reject)
  const noUserDataCheck = `auth_date=${authDate}`;
  const noUserHash = crypto
    .createHmac("sha256", secretKey)
    .update(noUserDataCheck)
    .digest("hex");
  const noUserPayload = `auth_date=${authDate}&hash=${noUserHash}`;
  const noUserResult = verifyTelegramWebAppData(noUserPayload, testBotToken);
  assert.equal(noUserResult.isValid, false);
  assert.equal(noUserResult.error, "Missing or invalid Telegram user identity");

  // 5. Expired Telegram session (auth_date older than 24 hours)
  const expiredDate = authDate - 100000;
  const expiredDataCheck = `auth_date=${expiredDate}\nuser=${userJson}`;
  const expiredHash = crypto
    .createHmac("sha256", secretKey)
    .update(expiredDataCheck)
    .digest("hex");
  const expiredPayload = `auth_date=${expiredDate}&user=${encodeURIComponent(userJson)}&hash=${expiredHash}`;
  const expiredResult = verifyTelegramWebAppData(expiredPayload, testBotToken);
  assert.equal(expiredResult.isValid, false);
  assert.equal(expiredResult.error, "Telegram session expired (auth_date > 24 hours)");
});

test("Production User Isolation: Demo user strictly restricted to local test; in real product auth is always needed", () => {
  const pagePath = path.resolve(__dirname, "../src/app/page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf-8");

  // Verify LOCAL_DEMO_USER is defined for local development only and strictly gated by isLocal
  assert.ok(pageContent.includes("LOCAL_DEMO_USER"), "LOCAL_DEMO_USER must be defined for local test only");
  assert.ok(
    pageContent.includes("else if (isLocal) {") && pageContent.includes("setUser(LOCAL_DEMO_USER)"),
    "LOCAL_DEMO_USER must strictly be assigned when isLocal is true"
  );

  // Initial user state must be null (zero fallback user in production)
  assert.ok(
    pageContent.includes("const [user, setUser] = useState<TelegramUser | null>(null);"),
    "Initial user state must be null"
  );

  // Verify detectIsTelegramClient enforces native platform or Telegram iframe
  assert.ok(
    pageContent.includes("window.self !== window.top"),
    "detectIsTelegramClient must require iframe or native platform"
  );
  assert.equal(
    pageContent.includes("document.referrer && /telegram\\.org/"),
    false,
    "document.referrer must not be used to bypass Telegram verification"
  );

  // In real product: unverified sessions without Telegram auth are always gated
  assert.ok(
    pageContent.includes("(!isTelegramVerified || !user)"),
    "Unsynced session must be gated until Telegram account is linked"
  );
  assert.ok(
    pageContent.includes("onSyncSuccess"),
    "Gate screen must provide onSyncSuccess handler for web Telegram sync"
  );
});



