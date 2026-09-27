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
  assert.ok(code.includes("export type BrandVariant"));
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

test("Brand Mascot: ShiliaiweiMascot file structure and poses definition", () => {
  const mascotPath = path.resolve(__dirname, "../src/components/brand/ShiliaiweiMascot.tsx");
  assert.equal(fs.existsSync(mascotPath), true, "ShiliaiweiMascot.tsx should exist");

  const code = fs.readFileSync(mascotPath, "utf-8");
  assert.ok(code.includes("export type MascotPose"));
  assert.ok(code.includes("ShiliaiweiMascot"));
  assert.ok(code.includes("idle"));
  assert.ok(code.includes("wave"));
  assert.ok(code.includes("announce"));
  assert.ok(code.includes("cheer"));
  assert.ok(code.includes("WEI"));
});

test("Currency Terminology: workspace-rules.md mandates WEI COIN and prohibits PTS", () => {
  const rulesPath = path.resolve(__dirname, "../.agents/rules/workspace-rules.md");
  assert.equal(fs.existsSync(rulesPath), true);

  const content = fs.readFileSync(rulesPath, "utf-8");
  assert.ok(content.includes("WEI Coin Terminology Rule"));
  assert.ok(content.includes("WEI COIN"));
  assert.ok(content.includes("Prohibition of \"PTS\""));
});

test("Card Component: BanknoteCreditCards includes crypto address, hanging animation, and excludes mascot", () => {
  const cardPath = path.resolve(__dirname, "../src/components/cards/BanknoteCreditCards.tsx");
  assert.equal(fs.existsSync(cardPath), true);

  const code = fs.readFileSync(cardPath, "utf-8");
  assert.ok(code.includes("walletAddress"), "Must display crypto wallet address");
  assert.ok(code.includes("isHangingSwitch"), "Must have hanging switch state");
  assert.ok(code.includes("switchDirection"), "Must track left/right switch direction");
  assert.equal(code.includes("ShiliaiweiMascot"), false, "Wallet card must NOT include mascot");
});

test("Navbar Component: TopBrandNavBar excludes eye button", () => {
  const navPath = path.resolve(__dirname, "../src/components/navigation/TopBrandNavBar.tsx");
  assert.equal(fs.existsSync(navPath), true);

  const code = fs.readFileSync(navPath, "utf-8");
  assert.equal(code.includes("EyeOff"), false, "Navbar must NOT have eye balance toggle");
});

test("Card & Profile Components: Guilloche banknote background, transparent encrypted address, and larger currency signs without codes", () => {
  const cardPath = path.resolve(__dirname, "../src/components/cards/BanknoteCreditCards.tsx");
  const cardCode = fs.readFileSync(cardPath, "utf-8");
  assert.ok(cardCode.includes("cardbanknote.svg"), "Card must include guilloche banknote background");
  assert.ok(cardCode.includes("encryptedAddress"), "Card must include encryptedAddress");
  assert.ok(cardCode.includes("text-white/60"), "Address must use transparent text");
  assert.equal(cardCode.includes("WEI Coin Token Medallion"), false, "Address must NOT include icons");

  const profilePath = path.resolve(__dirname, "../src/components/views/GameProfileView.tsx");
  const profileCode = fs.readFileSync(profilePath, "utf-8");
  assert.ok(profileCode.includes("cardbanknote.svg"), "Profile must include guilloche banknote background");
  assert.ok(profileCode.includes("encryptedAddress"), "Profile must include encryptedAddress");
});

test("App & Card Backgrounds: background.svg for app, cardbanknote.svg for card wallet, zero banknote behind app", () => {
  const cardPath = path.resolve(__dirname, "../src/components/cards/BanknoteCreditCards.tsx");
  const cardCode = fs.readFileSync(cardPath, "utf-8");
  assert.ok(cardCode.includes('backgroundImage: `url("/backgrounds/cardbanknote.svg")`'), "Card wallet must use cardbanknote.svg");

  const pagePath = path.resolve(__dirname, "../src/app/page.tsx");
  const pageCode = fs.readFileSync(pagePath, "utf-8");
  assert.ok(pageCode.includes("bg-app-background"), "App must include bg-app-background");
  assert.equal(pageCode.includes("bg-app-banknote"), false, "App must NOT show banknote background behind app");

  const cssPath = path.resolve(__dirname, "../src/app/globals.css");
  const cssCode = fs.readFileSync(cssPath, "utf-8");
  assert.ok(cssCode.includes('background-image: url("/backgrounds/background.svg")'), "globals.css must define background.svg");
});
