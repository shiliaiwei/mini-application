import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Account Auth View: component provides login, account creation, and auto Telegram sync without demo user", () => {
  const authPath = path.resolve(
    __dirname,
    "../src/components/auth/AccountAuthView.tsx"
  );
  assert.equal(fs.existsSync(authPath), true, "AccountAuthView.tsx must exist");

  const content = fs.readFileSync(authPath, "utf-8");
  assert.ok(content.includes("export const AccountAuthView"), "Must export AccountAuthView");
  assert.ok(content.includes("Log In"), "Must provide Log In tab");
  assert.ok(content.includes("Create Account"), "Must provide Create Account tab");
  assert.ok(
    content.includes("handleAutoSyncTelegram"),
    "Must provide auto Telegram sync handler"
  );
  assert.ok(
    content.includes("Auto Sync Telegram Account"),
    "Must display Auto Sync Telegram Account button"
  );
  assert.ok(content.includes("onLogin"), "Must call onLogin with authenticated user");

  // Mandatory Zero Demo User check in AccountAuthView UI
  assert.equal(
    content.includes("handleQuickDemoLogin"),
    false,
    "handleQuickDemoLogin must be permanently removed"
  );
  assert.equal(
    content.includes("shiliaiwei_holder"),
    false,
    "Demo username shiliaiwei_holder must not be hardcoded in AccountAuthView"
  );
  assert.equal(
    content.toLowerCase().includes("instant demo"),
    false,
    "Instant Demo button must not be displayed"
  );

  // Zero Emoji check
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.equal(emojiRegex.test(content), false, "AccountAuthView must not contain emojis");
});

test("App Navigation: UI access is strictly gated behind AccountAuthView when unauthenticated", () => {
  const pagePath = path.resolve(__dirname, "../src/app/page.tsx");
  const content = fs.readFileSync(pagePath, "utf-8");

  assert.ok(
    content.includes("AccountAuthView"),
    "page.tsx must import and render AccountAuthView"
  );
  assert.ok(
    content.includes("if (!user)"),
    "page.tsx must gate access when user is not authenticated"
  );
  assert.ok(
    content.includes("onLogout"),
    "page.tsx must provide onLogout handler to clear session"
  );
  // Ensure LOCAL_DEMO_USER is disabled / null
  assert.ok(
    content.includes("const LOCAL_DEMO_USER: TelegramUser | null = null;"),
    "LOCAL_DEMO_USER must be set to null to prevent exposing demo user"
  );
});
