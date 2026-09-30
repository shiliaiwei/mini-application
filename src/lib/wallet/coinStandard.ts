import { GAMES_CATALOGUE } from "@/data/gamesCatalogue";
import { RARE_COIN_EXCHANGE_LIMITS } from "@/lib/wallet/validation";

export type CoinType = "WEI" | "USD" | "KHR";

export interface CoinDistributionBreakdown {
  blockAllocation: number;
  gameModesAllocation: number;
  missionsAllocation: number;
  totalDailyDistribution: number;
}

export interface CoinStandardDefinition {
  type: CoinType;
  name: string;
  symbol: string;
  unit: string;
  decimals: number;
  isNativeCrypto: boolean;
  baseRateVsWei: number; // 1 WEI = baseRateVsWei * Currency Unit
  badgeBrandIdentifier: string; // "WEI"
  minExchangeLimit: number;
  maxExchangeLimit: number;
  dailyDistribution: CoinDistributionBreakdown;
}

/**
 * Standard Daily Allocation Constants (SHILIAIWEI System)
 */
export const DAILY_BLOCK_ALLOCATION_WEI = 1000;
export const DAILY_MISSION_ALLOCATION_WEI = 3000; // 500 Check-in + 1,000 Telegram Mission + 1,500 Institutional Partners

/**
 * Calculates sum of all registered game mode rewards in the catalog.
 */
export const getCatalogGameModesTotalWei = (): number => {
  return GAMES_CATALOGUE.reduce((sum, item) => sum + item.rewardWei, 0);
};

/**
 * Calculates daily distribution breakdown for any supported coin type.
 */
export const calculateDailyDistributionRate = (coin: CoinType): CoinDistributionBreakdown => {
  const gameModesTotal = getCatalogGameModesTotalWei();

  if (coin === "WEI") {
    return {
      blockAllocation: DAILY_BLOCK_ALLOCATION_WEI,
      gameModesAllocation: gameModesTotal,
      missionsAllocation: DAILY_MISSION_ALLOCATION_WEI,
      totalDailyDistribution: DAILY_BLOCK_ALLOCATION_WEI + gameModesTotal + DAILY_MISSION_ALLOCATION_WEI,
    };
  }

  if (coin === "USD") {
    const rate = 0.01; // 1 WEI = $0.01 USD
    return {
      blockAllocation: Number((DAILY_BLOCK_ALLOCATION_WEI * rate).toFixed(2)),
      gameModesAllocation: Number((gameModesTotal * rate).toFixed(2)),
      missionsAllocation: Number((DAILY_MISSION_ALLOCATION_WEI * rate).toFixed(2)),
      totalDailyDistribution: Number(
        ((DAILY_BLOCK_ALLOCATION_WEI + gameModesTotal + DAILY_MISSION_ALLOCATION_WEI) * rate).toFixed(2)
      ),
    };
  }

  if (coin === "KHR") {
    const rate = 41; // 1 WEI = 41 KHR
    return {
      blockAllocation: DAILY_BLOCK_ALLOCATION_WEI * rate,
      gameModesAllocation: gameModesTotal * rate,
      missionsAllocation: DAILY_MISSION_ALLOCATION_WEI * rate,
      totalDailyDistribution: (DAILY_BLOCK_ALLOCATION_WEI + gameModesTotal + DAILY_MISSION_ALLOCATION_WEI) * rate,
    };
  }

  throw new Error(`Unsupported coin type: ${coin}`);
};

/**
 * Standardized Specifications for each supported coin type.
 */
export const COIN_STANDARDS: Record<CoinType, CoinStandardDefinition> = {
  WEI: {
    type: "WEI",
    name: "WEI COIN",
    symbol: "WEI",
    unit: "1 WEI",
    decimals: 0,
    isNativeCrypto: true,
    baseRateVsWei: 1,
    badgeBrandIdentifier: "WEI",
    minExchangeLimit: RARE_COIN_EXCHANGE_LIMITS.MIN_EXCHANGE,
    maxExchangeLimit: RARE_COIN_EXCHANGE_LIMITS.MAX_EXCHANGE,
    dailyDistribution: calculateDailyDistributionRate("WEI"),
  },
  USD: {
    type: "USD",
    name: "US DOLLAR",
    symbol: "$",
    unit: "$0.01",
    decimals: 2,
    isNativeCrypto: false,
    baseRateVsWei: 0.01,
    badgeBrandIdentifier: "WEI",
    minExchangeLimit: Number((RARE_COIN_EXCHANGE_LIMITS.MIN_EXCHANGE * 0.01).toFixed(2)),
    maxExchangeLimit: Number((RARE_COIN_EXCHANGE_LIMITS.MAX_EXCHANGE * 0.01).toFixed(2)),
    dailyDistribution: calculateDailyDistributionRate("USD"),
  },
  KHR: {
    type: "KHR",
    name: "KHMER RIEL",
    symbol: "៛",
    unit: "1 KHR",
    decimals: 0,
    isNativeCrypto: false,
    baseRateVsWei: 41,
    badgeBrandIdentifier: "WEI",
    minExchangeLimit: RARE_COIN_EXCHANGE_LIMITS.MIN_EXCHANGE * 41,
    maxExchangeLimit: RARE_COIN_EXCHANGE_LIMITS.MAX_EXCHANGE * 41,
    dailyDistribution: calculateDailyDistributionRate("KHR"),
  },
};

/**
 * Retrieves standard definition for a specific coin.
 */
export const getCoinStandard = (coin: CoinType): CoinStandardDefinition => {
  return COIN_STANDARDS[coin];
};

/**
 * Formats a coin amount using its standard currency representation.
 */
export const formatCoinAmount = (amount: number, coin: CoinType): string => {
  if (coin === "USD") {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (coin === "KHR") {
    return `${Math.floor(amount).toLocaleString()} ៛`;
  }
  return `${Math.floor(amount).toLocaleString()} WEI`;
};

/**
 * Converts value from one coin standard to another.
 */
export const convertCoin = (amount: number, from: CoinType, to: CoinType): number => {
  if (from === to) return amount;

  // Convert to WEI base
  let wei = 0;
  if (from === "WEI") wei = amount;
  else if (from === "USD") wei = amount / 0.01;
  else if (from === "KHR") wei = amount / 41;

  // Convert WEI to target
  if (to === "WEI") return Math.round(wei);
  if (to === "USD") return Number((wei * 0.01).toFixed(2));
  if (to === "KHR") return Math.floor(wei * 41);

  return 0;
};
