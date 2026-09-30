"use client";

import React from "react";

export interface BrandStatsQuadGridProps {
  score: number;
  usdBalance?: number;
  khrBalance?: number;
  spendSeconds?: number;
  tapPower?: number;
  showBalance?: boolean;
  className?: string;
}

export const formatSpendSeconds = (s: number = 0): string => {
  if (!s || s <= 0) return "0m";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
};

export const BrandStatsQuadGrid: React.FC<BrandStatsQuadGridProps> = React.memo(({
  score,
  usdBalance,
  khrBalance,
  spendSeconds = 0,
  tapPower = 1,
  showBalance = true,
  className = "",
}) => {
  const usdValue = usdBalance !== undefined ? usdBalance.toFixed(2) : (score / 100).toFixed(2);
  const formattedTime = formatSpendSeconds(spendSeconds);

  return (
    <div className={`grid grid-cols-4 gap-2 sm:gap-2.5 w-full select-none ${className}`}>
      {/* 1. WEI COIN ASSET BALANCE (BLUE) */}
      <div
        className="relative rounded-[20px] sm:rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between text-white overflow-hidden shadow-xs transition-transform active:scale-[0.98] min-h-[88px] sm:min-h-[96px] bg-[#0080c8]"
        style={{
          boxShadow: "0 6px 16px -4px rgba(0, 128, 200, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90">
          WEI COIN
        </span>
        <span className="text-base sm:text-lg md:text-xl font-black text-white leading-tight mt-0.5 truncate tracking-tight">
          {showBalance ? score.toLocaleString() : "••••••"}
        </span>
        <span className="text-[9px] sm:text-[10px] font-medium text-white/80 mt-0.5 truncate">
          Asset Balance
        </span>
      </div>

      {/* 2. US DOLLAR ESTIMATED (GREEN) */}
      <div
        className="relative rounded-[20px] sm:rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between text-white overflow-hidden shadow-xs transition-transform active:scale-[0.98] min-h-[88px] sm:min-h-[96px] bg-[#00875a]"
        style={{
          boxShadow: "0 6px 16px -4px rgba(0, 135, 90, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90">
          US DOLLAR
        </span>
        <span className="text-base sm:text-lg md:text-xl font-black text-white leading-tight mt-0.5 truncate tracking-tight">
          {showBalance ? `$${usdValue}` : "••••••"}
        </span>
        <span className="text-[9px] sm:text-[10px] font-medium text-white/80 mt-0.5 truncate">
          Estimated
        </span>
      </div>

      {/* 3. TAP POWER MULTIPLIER (ORANGE) */}
      <div
        className="relative rounded-[20px] sm:rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between text-white overflow-hidden shadow-xs transition-transform active:scale-[0.98] min-h-[88px] sm:min-h-[96px] bg-[#c86200]"
        style={{
          boxShadow: "0 6px 16px -4px rgba(200, 98, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90">
          TAP POWER
        </span>
        <span className="text-base sm:text-lg md:text-xl font-black text-white leading-tight mt-0.5 truncate tracking-tight">
          {tapPower}x
        </span>
        <span className="text-[9px] sm:text-[10px] font-medium text-white/80 mt-0.5 truncate">
          Multiplier
        </span>
      </div>

      {/* 4. PLAY TIME ENGAGED (PURPLE) */}
      <div
        className="relative rounded-[20px] sm:rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between text-white overflow-hidden shadow-xs transition-transform active:scale-[0.98] min-h-[88px] sm:min-h-[96px] bg-[#7428dd]"
        style={{
          boxShadow: "0 6px 16px -4px rgba(116, 40, 221, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90">
          PLAY TIME
        </span>
        <span className="text-base sm:text-lg md:text-xl font-black text-white leading-tight mt-0.5 truncate tracking-tight">
          {formattedTime}
        </span>
        <span className="text-[9px] sm:text-[10px] font-medium text-white/80 mt-0.5 truncate">
          Engaged
        </span>
      </div>
    </div>
  );
});

BrandStatsQuadGrid.displayName = "BrandStatsQuadGrid";
