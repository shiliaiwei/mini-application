"use client";

import React from "react";
import { Zap, TrendingUp } from "@/components/icons/KeylineIcons";
import { halvingPct, blockRewardAt, MAX_SUPPLY, HALVING_STEP } from "./weiWalletUtils";

interface WeiHalvingBarProps {
  distributed:  number;
  supplyLoaded: boolean;
}

/**
 * WeiHalvingBar — Bitcoin-style halving progress bar.
 * Shows current halving epoch, block reward, progress %, and remaining supply.
 */
export function WeiHalvingBar({ distributed, supplyLoaded }: WeiHalvingBarProps) {
  const halvingCount  = Math.floor(distributed / HALVING_STEP);
  const blockReward   = blockRewardAt(distributed);
  const pct           = halvingPct(distributed);
  const nextHalvingAt = Math.min(MAX_SUPPLY, (halvingCount + 1) * HALVING_STEP);

  return (
    <div className="bg-white rounded-[22px] border border-amber-200/60 p-4 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-amber-500" />
          <span className="text-xs font-black uppercase text-slate-800">
            Halving #{halvingCount + 1}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-amber-400" />
          <span className="text-[10px] font-mono text-slate-500">
            Block Reward:{" "}
            <span className="text-amber-600 font-bold">
              {blockReward.toLocaleString()} WEI
            </span>
          </span>
        </div>
      </div>

      {/* Progress bar or skeleton */}
      {supplyLoaded ? (
        <>
          <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
              style={{
                width:      `${pct}%`,
                background: "linear-gradient(90deg,#f59e0b,#ef4444)",
              }}
            />
          </div>

          <div className="flex justify-between mt-1.5 text-[9px] font-mono text-slate-400">
            <span>{(halvingCount * HALVING_STEP).toLocaleString()} WEI</span>
            <span className="text-amber-500 font-bold">
              {pct.toFixed(1)}% to next halving
            </span>
            <span>{nextHalvingAt.toLocaleString()} WEI</span>
          </div>

          <div className="mt-1.5 text-center text-[9px] text-slate-400">
            {(MAX_SUPPLY - distributed).toLocaleString()} WEI remaining of 21,000,000 hard cap
          </div>
        </>
      ) : (
        <div className="h-3 rounded-full bg-slate-100 animate-pulse" />
      )}
    </div>
  );
}
