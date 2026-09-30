"use client";

import React from "react";
import { Wallet, TrendingUp, Repeat, Zap } from "@/components/icons/KeylineIcons";
import { blockRewardAt } from "./weiWalletUtils";

interface WeiOverviewGridProps {
  weiBalance:  number;
  usdBalance:  number;
  khrBalance:  number;
  distributed: number;
}

/**
 * WeiOverviewGrid — 2×2 stat grid: WEI, USD, KHR, Block Reward.
 */
export function WeiOverviewGrid({
  weiBalance,
  usdBalance,
  khrBalance,
  distributed,
}: WeiOverviewGridProps) {
  const blockReward = blockRewardAt(distributed);

  const stats = [
    {
      label: "WEI Balance",
      value: weiBalance.toLocaleString(),
      unit:  "WEI",
      color: "#f59e0b",
      Icon:  Wallet,
    },
    {
      label: "USD Vault",
      value: `$${usdBalance.toFixed(2)}`,
      unit:  "USD",
      color: "#10b981",
      Icon:  TrendingUp,
    },
    {
      label: "KHR Bakong",
      value: Math.floor(khrBalance).toLocaleString(),
      unit:  "KHR",
      color: "#8b5cf6",
      Icon:  Repeat,
    },
    {
      label: "Block Reward",
      value: blockReward.toLocaleString(),
      unit:  "WEI",
      color: "#0098ea",
      Icon:  Zap,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-[18px] border border-slate-200 p-3 shadow-sm"
        >
          <div className="flex items-center gap-1 mb-1">
            <s.Icon size={11} style={{ color: s.color }} />
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              {s.label}
            </span>
          </div>
          <span className="text-lg font-black font-mono" style={{ color: s.color }}>
            {s.value}
          </span>
          <span className="text-[9px] font-bold text-slate-400 ml-1">{s.unit}</span>
        </div>
      ))}
    </div>
  );
}
