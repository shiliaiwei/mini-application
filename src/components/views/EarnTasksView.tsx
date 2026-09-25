"use client";

import React, { useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  Zap,
  Gift,
  Check,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Award,
} from "@/components/icons/KeylineIcons";
import { BrandFooter } from "@/components/brand/BrandFooter";

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
  rewardPoints: number;
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

  // Quests State with Real Points Rewards
  const [quests, setQuests] = useState<Quest[]>(() => {
    const defaultQuests: Quest[] = [
      {
        id: "tg_channel",
        title: "Join SHILIAIWEI Official Channel",
        desc: "Stay updated with official game announcements and community updates",
        rewardPoints: 250,
        url: "https://t.me/srievibot",
        claimed: false,
      },
      {
        id: "daily_share",
        title: "Share Mini App with Friends",
        desc: "Invite colleagues and friends to compete on the wealth leaderboard",
        rewardPoints: 500,
        claimed: false,
      },
      {
        id: "safety_quiz",
        title: "Road Knowledge Quiz Challenge",
        desc: "Complete the Kesararam Road Safety verification questions",
        rewardPoints: 350,
        claimed: false,
      },
      {
        id: "daily_claim",
        title: "Daily Vault Check-in",
        desc: "Check into the central ledger to claim daily active points",
        rewardPoints: 100,
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

  const handleClaimQuest = (questId: string, rewardPoints: number) => {
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}

    onAddScore(rewardPoints);

    setQuests((prev) => {
      const updated = prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q));
      if (typeof window !== "undefined") {
        const claimedIds = updated.filter((q) => q.claimed).map((q) => q.id);
        localStorage.setItem("shi_claimed_quests", JSON.stringify(claimedIds));
      }
      return updated;
    });

    // Record audit log into Neon DB
    if (user?.id) {
      fetch("/api/audit/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: user.id,
          action: "MISSION_CLAIMED",
          details: `Completed mission ${questId} (+${rewardPoints} PTS)`,
          platform: tgApp?.platform || "TELEGRAM_WEB",
        }),
      }).catch(() => {});
    }
  };

  const handleClaimStreak = () => {
    if (streakClaimedToday) return;

    const streakRewards = [50, 100, 200, 350, 600, 1000, 2500];
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

    // Record audit log into Neon DB
    if (user?.id) {
      fetch("/api/audit/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: user.id,
          action: "DAILY_STREAK_CLAIMED",
          details: `Claimed Day ${currentStreak} streak reward (+${reward} PTS)`,
          platform: tgApp?.platform || "TELEGRAM_WEB",
        }),
      }).catch(() => {});
    }
  };

  const tapUpgradeCost = tapPower * 150;
  const passiveUpgradeCost = (passiveRate + 1) * 300;

  return (
    <div className="space-y-3.5 pb-28 font-body select-none text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* Top Banner Overview */}
      <div className="liquid-glass p-3.5 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">
              TOTAL EARNED POINTS (PTS)
            </span>
            <div className="text-2xl font-black text-slate-900 font-display mt-0.5">
              <span>{score.toLocaleString()}</span>
              <span className="text-slate-500 text-sm ml-1">PTS</span>
            </div>
            <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
              <span>≈ ${(score / 100).toFixed(2)} USD</span>
              <span className="mx-1">•</span>
              <span>{Math.floor(score * 41).toLocaleString()} KHR</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">
              EARNING RATE
            </span>
            <span className="text-xs font-black text-[#0077b5] block mt-1">
              +{tapPower} PTS/Tap • +{passiveRate} PTS/s
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab("quests")}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] ${
            activeSubTab === "quests"
              ? "bg-[#0098ea] text-white shadow-xs"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Gift size={16} />
          <span>Missions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("boosts")}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] ${
            activeSubTab === "boosts"
              ? "bg-[#0098ea] text-white shadow-xs"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Zap size={16} />
          <span>Boosts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("streak")}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] ${
            activeSubTab === "streak"
              ? "bg-[#0098ea] text-white shadow-xs"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Award size={16} />
          <span>Daily</span>
        </button>
      </div>

      {/* 1. QUESTS LIST */}
      {activeSubTab === "quests" && (
        <div className="space-y-2">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="liquid-glass p-3 flex items-center justify-between border border-slate-200 hover:border-[#0098ea]/60 transition-all shadow-xs"
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 font-display">
                    {quest.title}
                  </span>
                  {quest.url && (
                    <a
                      href={quest.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-[#0098ea]"
                      aria-label={`Open link for ${quest.title}`}
                    >
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {quest.desc}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
                  <span className="text-[#14532d]">+{quest.rewardPoints} PTS</span>
                  <span className="text-slate-500">
                    (≈ ${(quest.rewardPoints / 100).toFixed(2)} USD • {Math.floor(quest.rewardPoints * 41).toLocaleString()} KHR)
                  </span>
                </div>
              </div>

              <div>
                {quest.claimed ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-[#14532d] text-xs font-bold min-h-[36px]">
                    <Check size={16} />
                    <span>Done</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleClaimQuest(quest.id, quest.rewardPoints)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer min-h-[36px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
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
        <div className="space-y-2.5">
          {/* Mint Power Upgrade */}
          <div className="liquid-glass p-3.5 space-y-2.5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp size={22} className="text-[#0098ea] flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-display">
                    Mint Power (Lvl {tapPower})
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Earns +{tapPower} PTS per tap
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-[#14532d]">
                +{tapPower + 1} PTS / Tap
              </span>
            </div>

            <button
              type="button"
              onClick={onUpgradeTapPower}
              disabled={score < tapUpgradeCost}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs min-h-[44px] ${
                score >= tapUpgradeCost
                  ? "bg-[#0098ea] hover:bg-[#0088cc] text-white active:scale-98 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              <span>Upgrade for {tapUpgradeCost.toLocaleString()} PTS</span>
            </button>
          </div>

          {/* Passive Mining Yield Upgrade */}
          <div className="liquid-glass p-3.5 space-y-2.5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap size={22} className="text-[#16a34a] flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-display">
                    Passive Point Generator (Lvl {passiveRate})
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Generates +{passiveRate} PTS every second
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-[#14532d]">
                +{passiveRate + 1} PTS/s
              </span>
            </div>

            <button
              type="button"
              onClick={onUpgradePassiveRate}
              disabled={score < passiveUpgradeCost}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs min-h-[44px] ${
                score >= passiveUpgradeCost
                  ? "bg-[#16a34a] hover:bg-[#15803d] text-white active:scale-98 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              <span>Upgrade for {passiveUpgradeCost.toLocaleString()} PTS</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. DAILY CHECK-IN STREAK */}
      {activeSubTab === "streak" && (
        <div className="liquid-glass p-3.5 space-y-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block font-display">
                Daily Check-in Streak
              </span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                Check in continuously for 7 days to unlock maximum point bonuses.
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-[#0077b5] font-black text-xs">
              Day {currentStreak} / 7
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {[50, 100, 200, 350, 600, 1000, 2500].map((pts, idx) => {
              const dayNum = idx + 1;
              const isPast = dayNum < currentStreak;
              const isToday = dayNum === currentStreak;

              return (
                <div
                  key={dayNum}
                  className={`p-1.5 rounded-xl text-center border transition-all ${
                    isToday
                      ? "bg-sky-50 border-[#0098ea] shadow-xs"
                      : isPast
                      ? "bg-slate-50 border-slate-200 text-slate-400"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="text-[9px] font-bold block uppercase text-slate-500">
                    D{dayNum}
                  </span>
                  <span className={`text-[10px] font-black block mt-0.5 ${isToday ? "text-[#0077b5]" : ""}`}>
                    +{pts}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleClaimStreak}
            disabled={streakClaimedToday}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs min-h-[44px] ${
              streakClaimedToday
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-[#0098ea] hover:bg-[#0088cc] text-white active:scale-98 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
            }`}
          >
            <Sparkles size={18} />
            <span>{streakClaimedToday ? "Claimed for Today" : `Claim Day ${currentStreak} Bonus`}</span>
          </button>
        </div>
      )}

      {/* Consistent Brand Footer */}
      <BrandFooter height={16} className="mt-4 pb-2" />
    </div>
  );
};
