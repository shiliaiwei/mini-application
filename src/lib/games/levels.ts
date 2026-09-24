export interface UserLevelInfo {
  level: number;
  title: string;
  minScore: number;
  maxScore: number;
  color: string;
  progressPercent: number;
  nextLevelScore: number;
  multiplier: number;
}

export const LEVEL_TIERS: Array<{
  level: number;
  title: string;
  minScore: number;
  maxScore: number;
  color: string;
  multiplier: number;
}> = [
  { level: 1, title: "Bronze Cadet", minScore: 0, maxScore: 500, color: "#b45309", multiplier: 1.0 },
  { level: 2, title: "Silver Scout", minScore: 500, maxScore: 2000, color: "#94a3b8", multiplier: 1.2 },
  { level: 3, title: "Gold Master", minScore: 2000, maxScore: 10000, color: "#eab308", multiplier: 1.5 },
  { level: 4, title: "Platinum Champion", minScore: 10000, maxScore: 50000, color: "#0098ea", multiplier: 2.0 },
  { level: 5, title: "Diamond Legend", minScore: 50000, maxScore: 200000, color: "#38bdf8", multiplier: 3.0 },
];

export function getUserLevelInfo(score: number): UserLevelInfo {
  const safeScore = Math.max(0, score || 0);

  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    const tier = LEVEL_TIERS[i];
    if (safeScore >= tier.minScore) {
      const isMaxTier = i === LEVEL_TIERS.length - 1;
      const range = tier.maxScore - tier.minScore;
      const progressIntoTier = safeScore - tier.minScore;
      const progressPercent = isMaxTier
        ? Math.min(100, Math.round((progressIntoTier / range) * 100))
        : Math.min(100, Math.max(0, Math.round((progressIntoTier / range) * 100)));

      return {
        level: tier.level,
        title: tier.title,
        minScore: tier.minScore,
        maxScore: tier.maxScore,
        color: tier.color,
        progressPercent,
        nextLevelScore: tier.maxScore,
        multiplier: tier.multiplier,
      };
    }
  }

  const base = LEVEL_TIERS[0];
  return {
    level: base.level,
    title: base.title,
    minScore: base.minScore,
    maxScore: base.maxScore,
    color: base.color,
    progressPercent: 0,
    nextLevelScore: base.maxScore,
    multiplier: base.multiplier,
  };
}
