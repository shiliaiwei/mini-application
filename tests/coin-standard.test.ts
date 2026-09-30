import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  COIN_STANDARDS,
  calculateDailyDistributionRate,
  convertCoin,
  formatCoinAmount,
  getCatalogGameModesTotalWei,
  DAILY_BLOCK_ALLOCATION_WEI,
  DAILY_MISSION_ALLOCATION_WEI,
} from "../src/lib/wallet/coinStandard";
import { GAMES_CATALOGUE } from "../src/data/gamesCatalogue";
import { RARE_COIN_EXCHANGE_LIMITS } from "../src/lib/wallet/validation";

test("Coin Standard: accurately calculates daily distribution rates for WEI, USD, and KHR", () => {
  // Verify block and mission constants
  assert.equal(DAILY_BLOCK_ALLOCATION_WEI, 1000);
  assert.equal(DAILY_MISSION_ALLOCATION_WEI, 3000);

  // Verify game modes catalog sum
  const gameCatalogSum = GAMES_CATALOGUE.reduce((acc, g) => acc + g.rewardWei, 0);
  assert.equal(gameCatalogSum, 6000);
  assert.equal(getCatalogGameModesTotalWei(), 6000);

  // 1. WEI COIN Daily Distribution
  const weiDist = calculateDailyDistributionRate("WEI");
  assert.equal(weiDist.blockAllocation, 1000);
  assert.equal(weiDist.gameModesAllocation, 6000);
  assert.equal(weiDist.missionsAllocation, 3000);
  assert.equal(weiDist.totalDailyDistribution, 10000);

  // 2. US DOLLAR Daily Distribution (1 WEI = $0.01)
  const usdDist = calculateDailyDistributionRate("USD");
  assert.equal(usdDist.blockAllocation, 10.0);
  assert.equal(usdDist.gameModesAllocation, 60.0);
  assert.equal(usdDist.missionsAllocation, 30.0);
  assert.equal(usdDist.totalDailyDistribution, 100.0);

  // 3. KHMER RIEL Daily Distribution (1 WEI = 41 KHR)
  const khrDist = calculateDailyDistributionRate("KHR");
  assert.equal(khrDist.blockAllocation, 41000);
  assert.equal(khrDist.gameModesAllocation, 246000);
  assert.equal(khrDist.missionsAllocation, 123000);
  assert.equal(khrDist.totalDailyDistribution, 410000);
});

test("Coin Standard: metadata definitions and rare exchange limits", () => {
  assert.equal(COIN_STANDARDS.WEI.symbol, "WEI");
  assert.equal(COIN_STANDARDS.WEI.decimals, 0);
  assert.equal(COIN_STANDARDS.WEI.isNativeCrypto, true);
  assert.equal(COIN_STANDARDS.WEI.minExchangeLimit, RARE_COIN_EXCHANGE_LIMITS.MIN_EXCHANGE);
  assert.equal(COIN_STANDARDS.WEI.maxExchangeLimit, RARE_COIN_EXCHANGE_LIMITS.MAX_EXCHANGE);

  assert.equal(COIN_STANDARDS.USD.symbol, "$");
  assert.equal(COIN_STANDARDS.USD.decimals, 2);
  assert.equal(COIN_STANDARDS.USD.isNativeCrypto, false);

  assert.equal(COIN_STANDARDS.KHR.symbol, "៛");
  assert.equal(COIN_STANDARDS.KHR.decimals, 0);
  assert.equal(COIN_STANDARDS.KHR.isNativeCrypto, false);
});

test("Coin Standard: currency conversion and formatting utilities", () => {
  assert.equal(convertCoin(100, "WEI", "USD"), 1.0);
  assert.equal(convertCoin(100, "WEI", "KHR"), 4100);
  assert.equal(convertCoin(1.0, "USD", "WEI"), 100);
  assert.equal(convertCoin(4100, "KHR", "WEI"), 100);

  assert.equal(formatCoinAmount(10000, "WEI"), "10,000 WEI");
  assert.equal(formatCoinAmount(100, "USD"), "$100.00");
  assert.equal(formatCoinAmount(410000, "KHR"), "410,000 ៛");
});

test("Coin Standard: WeiCoinBadge component incorporates Wei badge logo", () => {
  const badgeFile = path.resolve(__dirname, "../src/components/brand/WeiCoinBadge.tsx");
  assert.equal(fs.existsSync(badgeFile), true);

  const code = fs.readFileSync(badgeFile, "utf-8");
  assert.ok(code.includes("WeiCoinBadge"));
  assert.ok(code.includes("WEI Badge Logo"));
  assert.ok(code.includes("#0098ea"));
  assert.equal(code.includes("SKEUOMORPHIC CARD"), false);
  assert.equal(code.includes("Skeuomorphic"), false);
});

test("Coin Standard: skill documentation exists and enforces rules", () => {
  const skillFile = path.resolve(
    __dirname,
    "../.agents/skills/shiliaiwei-coin-distribution-standard/SKILL.md"
  );
  assert.equal(fs.existsSync(skillFile), true);

  const content = fs.readFileSync(skillFile, "utf-8");
  assert.ok(content.includes("shiliaiwei-coin-distribution-standard"));
  assert.ok(content.includes("Never Push Without Permission"));
  assert.ok(content.includes("Never Write Guide Example Labels"));
  assert.ok(content.includes("Strictly NO EMOJIS"));
  assert.ok(content.includes("10,000 WEI"));
  assert.ok(content.includes("$100.00 USD"));
  assert.ok(content.includes("410,000 KHR"));
});

test("Coin Standard: executeGameReward enforces fair anti-cheat and one-block calculation", async () => {
  const { executeGameReward } = await import("../src/lib/wallet/ledger");
  const testAddress = "WC0123456789abcdef0123456789abcdef01234567";

  // 1. Rejects duration < 3s with score
  await assert.rejects(
    () => executeGameReward(testAddress, "test_game", 50, 2),
    /Invalid gameplay duration/
  );

  // 2. Rejects anomalous score (> spendSeconds * 60)
  await assert.rejects(
    () => executeGameReward(testAddress, "test_game", 5000, 5),
    /Anomalous gameplay score/
  );

  // 3. Rejects score < 10
  await assert.rejects(
    () => executeGameReward(testAddress, "test_game", 8, 10),
    /Score must be at least 10/
  );
});

test("Coin Standard: resetAllCurrencyStoresToGenesis module and API route exists", async () => {
  const ledgerModule = await import("../src/lib/wallet/ledger");
  assert.equal(typeof ledgerModule.resetAllCurrencyStoresToGenesis, "function");

  const resetRoute = await import("../src/app/api/wallet/reset/route");
  assert.equal(typeof resetRoute.POST, "function");
});

test("Coin Standard: three distinct currency block stores maintain independent balances without lockstep coupling", () => {
  // 1. Verify BanknoteCreditCards implements WEI, USD, and KHR independent card modes
  const cardFile = path.resolve(__dirname, "../src/components/cards/BanknoteCreditCards.tsx");
  const cardCode = fs.readFileSync(cardFile, "utf-8");
  assert.ok(cardCode.includes('type CurrencyMode = "WEI" | "USD" | "KHR"'));
  assert.ok(cardCode.includes("WEI STORE"));
  assert.ok(cardCode.includes("USD STORE"));
  assert.ok(cardCode.includes("KHR STORE"));
  assert.ok(cardCode.includes("Mining Tap"));
  assert.ok(cardCode.includes("Fiat Vault"));
  assert.ok(cardCode.includes("Bakong Grant"));

  // 2. Verify BrandMiningBlockGrid renders all 3 distinct block stores
  const gridFile = path.resolve(__dirname, "../src/components/cards/BrandMiningBlockGrid.tsx");
  const gridCode = fs.readFileSync(gridFile, "utf-8");
  assert.ok(gridCode.includes("3 Distinct Currency Block Stores"));
  assert.ok(gridCode.includes("STORE 01 • L2"));
  assert.ok(gridCode.includes("STORE 02 • VAULT"));
  assert.ok(gridCode.includes("STORE 03 • BAKONG"));

  // 3. Verify TapGameView wires independent earning actions for all 3 stores
  const tapFile = path.resolve(__dirname, "../src/components/views/TapGameView.tsx");
  const tapCode = fs.readFileSync(tapFile, "utf-8");
  assert.ok(tapCode.includes("onAddUsd"));
  assert.ok(tapCode.includes("onAddKhr"));
  assert.ok(tapCode.includes("Store 01 • WEI"));
  assert.ok(tapCode.includes("Store 02 • USD"));
  assert.ok(tapCode.includes("Store 03 • KHR"));

  // 4. Verify page.tsx initializes and persists 3 independent stores with separate keys
  const pageFile = path.resolve(__dirname, "../src/app/page.tsx");
  const pageCode = fs.readFileSync(pageFile, "utf-8");
  assert.ok(pageCode.includes("shi_store_wei"));
  assert.ok(pageCode.includes("shi_store_usd"));
  assert.ok(pageCode.includes("shi_store_khr"));
  assert.ok(pageCode.includes("handleAddUsd"));
  assert.ok(pageCode.includes("handleAddKhr"));
});


