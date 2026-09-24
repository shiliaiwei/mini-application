import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Brand Rules: workspace-rules.md includes mandatory mutual exclusivity rule", () => {
  const rulesPath = path.resolve(__dirname, "../.agents/rules/workspace-rules.md");
  assert.equal(fs.existsSync(rulesPath), true, "workspace-rules.md should exist");

  const content = fs.readFileSync(rulesPath, "utf-8");
  assert.ok(
    content.includes("Brand Asset Mutual Exclusivity Rule"),
    "Rules must contain the Brand Asset Mutual Exclusivity Rule"
  );
  assert.ok(
    content.includes("Logo Only Mode"),
    "Rules must specify Logo Only Mode"
  );
  assert.ok(
    content.includes("Brand Name Only Mode"),
    "Rules must specify Brand Name Only Mode"
  );
  assert.ok(
    content.includes("mutually exclusive"),
    "Rules must declare logo mark and brand name as mutually exclusive"
  );
});

test("Brand Component: ShiliaiweiBrand file structure and variants definition", () => {
  const brandPath = path.resolve(__dirname, "../src/components/brand/ShiliaiweiBrand.tsx");
  assert.equal(fs.existsSync(brandPath), true, "ShiliaiweiBrand.tsx should exist");

  const code = fs.readFileSync(brandPath, "utf-8");
  assert.ok(code.includes('export type BrandVariant = "wordmark" | "mark"'));
  assert.ok(code.includes("SHILIAI"));
  assert.ok(code.includes("WEI"));
  assert.ok(code.includes("ShiliaiweiBrand"));
});

test("Keyline Icons: KeylineIcons.tsx exports required two-tone 24x24 icons", () => {
  const iconPath = path.resolve(__dirname, "../src/components/icons/KeylineIcons.tsx");
  assert.equal(fs.existsSync(iconPath), true, "KeylineIcons.tsx should exist");

  const code = fs.readFileSync(iconPath, "utf-8");
  assert.ok(code.includes("KeylineGamepad"), "Must export KeylineGamepad");
  assert.ok(code.includes("KeylineArrowUpDown"), "Must export KeylineArrowUpDown");
  assert.ok(code.includes("@keyline-icons/react/two-tone"), "Must import from two-tone package");
});
