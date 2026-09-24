"use client";

import React, { useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  Zap,
  Gift,
  CheckCircle2,
  TrendingUp,
  BatteryCharging,
  Sparkles,
  ExternalLink,
  Award,
} from "lucide-react";

interface EarnTasksViewProps {
  score: number;
  onAddScore: (amount: number) => void;
  tapPower: number;
  onUpgradeTapPower: () => void;
  passiveRate: number;
  onUpgradePassiveRate: () => void;
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
}

interface Quest {
  id: string;
  title: string;
  desc: string;
  rewardUSD: number;
  rewardSHI: number;
  rewardKHR: number;
  url?: string;
  claimed: boolean;
}

export const EarnTasksView: React.FC<EarnTasksViewProps> = ({
  score,
  onAddScore,
  tapPower,
  onUpgradeTapPower,
  passiveRate,
  onUpgradePassiveRate,
  user,
  tgApp,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"quests" | "boosts" | "streak">("quests");

  // Streak State
  const [currentStreak, setCurrentStreak] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("shi_streak_day") || "1", 10);
    }
    return 1;
  });

  const [streakClaimedToday, setStreakClaimedToday] = useState(() => {
    if (typeof window !== "undefined") {
      const lastClaim = localStorage.getItem("shi_streak_last_claim");
      const today = new Date().toDateString();
      return lastClaim === today;
    }
    return false;
  });

  // Quests State
  const [quests, setQuests] = useState<Quest[]>(() => {
    const defaultQuests: Quest[] = [
      {
        id: "tg_channel",
        title: "Join SHILIAIWEI Official Channel",
        desc: "Stay updated with SHILIAIWEI announcements and vault releases",
        rewardUSD: 50,
        rewardSHI: 500,
        rewardKHR: 205000,
        url: "https://t.me/srievibot",
        claimed: false,
      },
      {
        id: "daily_share",
        title: "Share SHILIAIWEI Wallet Invite",
        desc: "Invite friends to mint simulated USD, KHR, and $SHI",
        rewardUSD: 100,
        rewardSHI: 1000,
        rewardKHR: 410000,
        claimed: false,
      },
      {
        id: "safety_quiz",
        title: "Road Knowledge Verification",
        desc: "Complete the Kesararam Road Safety Knowledge verification",
        rewardUSD: 75,
        rewardSHI: 750,
        rewardKHR: 307500,
        claimed: false,
      },
      {
        id: "daily_claim",
        title: "Daily Web3 Check-in",
        desc: "Sign daily simulated vault block transaction",
        rewardUSD: 25,
        rewardSHI: 250,
        rewardKHR: 102500,
        claimed: false,
      },
    ];

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shi_claimed_quests");
      if (saved) {
        try {
          const claimedIds: string[] = JSON.parse(saved);
          return defaultQuests.map((q) => ({
            ...q,
            claimed: claimedIds.includes(q.id),
          }));
        } catch {}
      }
    }
    return defaultQuests;
  });

  const handleClaimQuest = (questId: string, rewardUSD: number) => {
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}

    onAddScore(rewardUSD);

    setQuests((prev) => {
      const updated = prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q));
      if (typeof window !== "undefined") {
        const claimedIds = updated.filter((q) => q.claimed).map((q) => q.id);
        localStorage.setItem("shi_claimed_quests", JSON.stringify(claimedIds));
      }
      return updated;
    });
  };

  const handleClaimStreak = () => {
    if (streakClaimedToday) return;

    const streakRewards = [20, 40, 80, 150, 300, 500, 1000];
    const reward = streakRewards[(currentStreak - 1) % streakRewards.length];

    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}

    onAddScore(reward);
    setStreakClaimedToday(true);

    if (typeof window !== "undefined") {
      const today = new Date().toDateString();
      localStorage.setItem("shi_streak_last_claim", today);
      const nextDay = (currentStreak % 7) + 1;
      localStorage.setItem("shi_streak_day", String(nextDay));
      setCurrentStreak(nextDay);
    }
  };

  const tapUpgradeCost = tapPower * 150;
  const passiveUpgradeCost = (passiveRate + 1) * 300;

  return (
    <div className="space-y-4 pb-24 font-body select-none text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* Top Banner Overview */}
      <div className="liquid-glass p-4 flex items-center justify-between border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            AVAILABLE VAULT BALANCE
          </span>
          <div className="text-2xl font-black text-slate-900 font-display mt-0.5">
            <span className="text-[#16a34a] mr-1">$</span>
            {score.toLocaleString()}
            <span className="text-slate-400 text-sm ml-1">.00 USD</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            MINT CAPABILITY
          </span>
          <span className="text-xs font-bold text-[#0098ea] block mt-1">
            +${tapPower} / Tap • +${passiveRate}/s
          </span>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveSubTab("quests")}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "quests"
              ? "bg-[#0098ea] text-white shadow-sm shadow-[#0098ea]/20"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Missions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("boosts")}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "boosts"
              ? "bg-[#0098ea] text-white shadow-sm shadow-[#0098ea]/20"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Boosts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("streak")}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === "streak"
              ? "bg-[#0098ea] text-white shadow-sm shadow-[#0098ea]/20"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Daily</span>
        </button>
      </div>

      {/* 1. QUESTS LIST */}
      {activeSubTab === "quests" && (
        <div className="space-y-2">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="liquid-glass p-3.5 flex items-center justify-between border border-slate-200/90 hover:border-[#0098ea]/60 transition-all shadow-sm"
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 font-display">
                    {quest.title}
                  </span>
                  {quest.url && (
                    <a
                      href={quest.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#0098ea]"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  {quest.desc}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
                  <span className="text-[#16a34a]">+${quest.rewardUSD}.00 USD</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[#0098ea]">+{quest.rewardSHI} $SHI</span>
                </div>
              </div>

              <div>
                {quest.claimed ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#16a34a] text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleClaimQuest(quest.id, quest.rewardUSD)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. UPGRADES / BOOSTS */}
      {activeSubTab === "boosts" && (
        <div className="space-y-3">
          {/* Mint Power Upgrade - Unboxed Icon */}
          <div className="liquid-glass p-4 space-y-3 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-6 h-6 text-[#0098ea] flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-display">
                    Mint Power (Lvl {tapPower})
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Earns +${tapPower} per tap
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16a34a]">
                +${tapPower + 1} Next Lvl
              </span>
            </div>

            <button
              type="button"
              onClick={onUpgradeTapPower}
              disabled={score < tapUpgradeCost}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
                score >= tapUpgradeCost
                  ? "bg-[#0098ea] hover:bg-[#0088cc] text-white active:scale-98"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              <span>Upgrade Tap Power</span>
              <span>•</span>
              <span>${tapUpgradeCost}.00 USD</span>
            </button>
          </div>

          {/* Passive Yield Auto-Miner - Unboxed Icon */}
          <div className="liquid-glass p-4 space-y-3 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BatteryCharging className="w-6 h-6 text-[#16a34a] flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-display">
                    Auto-Miner Vault (Lvl {passiveRate})
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Yields +${passiveRate}/sec automatically
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16a34a]">
                +${passiveRate + 1}/s Next Lvl
              </span>
            </div>

            <button
              type="button"
              onClick={onUpgradePassiveRate}
              disabled={score < passiveUpgradeCost}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
                score >= passiveUpgradeCost
                  ? "bg-[#0098ea] hover:bg-[#0088cc] text-white active:scale-98"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              <span>Upgrade Auto-Miner</span>
              <span>•</span>
              <span>${passiveUpgradeCost}.00 USD</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. DAILY STREAK */}
      {activeSubTab === "streak" && (
        <div className="liquid-glass p-4 space-y-4 border border-slate-200/90 shadow-sm">
          <div className="text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
              7-DAY VAULT LOGIN STREAK
            </span>
            <h3 className="text-lg font-black text-slate-900 font-display">
              Day {currentStreak} of 7
            </h3>
            <p className="text-[11px] text-slate-500">
              Claim consecutive daily blocks to unlock major simulated dollar rewards.
            </p>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {[20, 40, 80, 150, 300, 500, 1000].map((rew, idx) => {
              const dayNum = idx + 1;
              const isPast = dayNum < currentStreak;
              const isCurrent = dayNum === currentStreak;

              return (
                <div
                  key={dayNum}
                  className={`p-2 rounded-xl text-center border flex flex-col items-center justify-between min-h-[70px] ${
                    isCurrent
                      ? "bg-sky-50 border-[#0098ea] text-[#0098ea] shadow-sm font-bold"
                      : isPast
                      ? "bg-slate-50 border-slate-200 text-slate-500"
                      : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase">D{dayNum}</span>
                  <span className="text-xs font-black my-1 font-display">
                    +${rew}
                  </span>
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                  ) : (
                    <Sparkles className={`w-3.5 h-3.5 ${isCurrent ? "text-[#0098ea]" : "text-slate-300"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleClaimStreak}
            disabled={streakClaimedToday}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
              !streakClaimedToday
                ? "bg-[#0098ea] hover:bg-[#0088cc] text-white active:scale-98"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            {streakClaimedToday ? "Streak Claimed Today" : "Claim Today's Bonus"}
          </button>
        </div>
      )}
    </div>
  );
};
