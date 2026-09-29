import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Account Auth View: component exists and provides login and account creation", () => {
  const authPath = path.resolve(
    __dirname,
    "../src/components/auth/AccountAuthView.tsx"
  );
  assert.equal(fs.existsSync(authPath), true, "AccountAuthView.tsx must exist");

  const content = fs.readFileSync(authPath, "utf-8");
  assert.ok(content.includes("export const AccountAuthView"), "Must export AccountAuthView");
  assert.ok(content.includes("Log In"), "Must provide Log In tab");
  assert.ok(content.includes("Create Account"), "Must provide Create Account tab");
  assert.ok(content.includes("handleQuickDemoLogin"), "Must provide quick demo login handler");
  assert.ok(content.includes("onLogin"), "Must call onLogin with authenticated user");

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
});
