"use client";

import React, { useState, useCallback } from "react";
import { ShieldCheck } from "@/components/icons/KeylineIcons";
import { blockRewardAt, flash, type FlashMsg } from "./weiWalletUtils";
import { useCountdown, InlineMsg, useDailyCooldown } from "./weiWalletHooks";
import type { TelegramWebApp } from "@/types/telegram";

interface WeiDailyClaimProps {
  address:          string | null;
  weiBalance:       number;
  distributed:      number;
  initData:         string;
  tgApp:            TelegramWebApp | null;
  onClaimed:        (earnedWei: number, newBalance: number) => void;
}

/**
 * WeiDailyClaimCard — shows countdown timer or claim button.
 * Enforces 24h cooldown client-side; server enforces it too.
 */
export function WeiDailyClaimCard({
  address,
  weiBalance,
  distributed,
  initData,
  tgApp,
  onClaimed,
}: WeiDailyClaimProps) {
  const [claiming, setClaiming]     = useState(false);
  const [msg, setMsg]               = useState<FlashMsg>(null);
  const { canClaim, nextClaimMs, recordClaim } = useDailyCooldown();
  const countdown   = useCountdown(nextClaimMs);
  const blockReward = blockRewardAt(distributed);

  const handleClaim = useCallback(async () => {
    if (!canClaim || !address || claiming) return;
    setClaiming(true);
    setMsg(null);
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
    } catch {}

    try {
      const res = await fetch("/api/wallet/reward", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          toAddress:    address,
          gameId:       "daily_claim",
          score:        100,
          spendSeconds: 5,
          initData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        recordClaim();
        const earned = data.reward?.rewardAmount ?? 0;
        onClaimed(earned, data.reward?.newBalance ?? weiBalance + earned);
        try { tgApp?.HapticFeedback?.notificationOccurred("success"); } catch {}
        flash(setMsg, true, `+${earned.toLocaleString()} WEI claimed`);
      } else {
        flash(setMsg, false, data.error || "Claim failed");
      }
    } catch {
      flash(setMsg, false, "Network error. Try again.");
    } finally {
      setClaiming(false);
    }
  }, [canClaim, address, claiming, initData, weiBalance, tgApp, onClaimed, recordClaim]);

  return (
    <div className="bg-white rounded-[22px] border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-xs font-black uppercase text-slate-800">
            Daily Reward
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Up to {Math.min(blockReward, 100).toLocaleString()} WEI / day
        </span>
      </div>

      <InlineMsg state={msg} />

      {canClaim ? (
        <button
          onClick={handleClaim}
          disabled={claiming || !address}
          className="w-full mt-2 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-60"
        >
          {claiming ? "Processing..." : "Claim Daily WEI Reward"}
        </button>
      ) : (
        <div className="text-center mt-2">
          <span className="text-2xl font-black font-mono text-slate-700">
            {countdown}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">until next claim</p>
        </div>
      )}
    </div>
  );
}
