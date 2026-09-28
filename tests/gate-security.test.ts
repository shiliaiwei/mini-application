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
    content.includes("Telegram") && content.includes("user-agent"),
    "Middleware must inspect user-agent for Telegram"
  );
  assert.ok(
    content.includes("tgWebAppVersion") || content.includes("tgWebAppData"),
    "Middleware must inspect query parameters for Telegram WebApp"
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
