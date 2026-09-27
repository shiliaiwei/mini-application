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
          details: `Completed mission ${questId} (+${rewardPoints} WEI COIN)`,
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
          details: `Claimed Day ${currentStreak} streak reward (+${reward} WEI COIN)`,
          platform: tgApp?.platform || "TELEGRAM_WEB",
        }),
      }).catch(() => {});
    }
  };

  const tapUpgradeCost = tapPower * 150;
  const passiveUpgradeCost = (passiveRate + 1) * 300;

  return (
    <div className="space-y-3.5 pb-28 font-body select-none text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* 3D Skeuomorphic Purple Leather Overview Pocket */}
      <div
        className="relative rounded-[30px] p-5 overflow-hidden bg-gradient-to-b from-[#6420a7] via-[#4e1688] to-[#340b5c] text-white"
        style={{
          boxShadow:
            "0 16px 36px -10px rgba(45, 10, 80, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Leather Grain Texture */}
        <div
          className="absolute inset-0 rounded-[30px] opacity-15 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(0,0,0,0.5) 1px, transparent 1px)`,
            backgroundSize: "6px 6px, 8px 8px",
          }}
        />

        {/* Perimeter Thread Stitching */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="7"
            y="7"
            width="calc(100% - 14px)"
            height="calc(100% - 14px)"
            rx="23"
            ry="23"
            fill="none"
            stroke="#e9d5ff"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            opacity="0.45"
            style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
          />
        </svg>

        {/* Guilloche Banknote Background Style with Suitable Contrast */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
          style={{
            backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover",
            filter: "contrast(1.35) brightness(1.1)",
          }}
        />

        {/* Specular Top Rim */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-purple-200/90 font-medium uppercase tracking-wider block">
              TOTAL EARNED ASSETS (RIEL)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white font-display mt-0.5 drop-shadow-sm flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">៛</span>
              <span>{Math.floor(score * 41).toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-purple-200/90 font-medium mt-1 flex items-center">
              <span>{score.toLocaleString()} WEI COIN</span>
              <span className="mx-1.5">•</span>
              <span className="font-bold text-white">$ {(score / 100).toFixed(2)}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-purple-200/90 font-medium uppercase tracking-wider block">
              EARNING RATE
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-white font-bold text-xs mt-1 shadow-inner">
              <span>+{tapPower} WEI/Tap</span>
              <span>•</span>
              <span>+{passiveRate} WEI/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="grid grid-cols-3 gap-1.5 bg-purple-950/5 p-1.5 rounded-full text-xs font-bold border border-purple-200/50 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab("quests")}
          className={`py-2 rounded-full transition-all duration-300 ease-out flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] focus:outline-none ${
            activeSubTab === "quests"
              ? "bg-[#6420a7] text-white shadow-md shadow-purple-950/20"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Gift size={16} />
          <span>Missions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("boosts")}
          className={`py-2 rounded-full transition-all duration-300 ease-out flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] focus:outline-none ${
            activeSubTab === "boosts"
              ? "bg-[#6420a7] text-white shadow-md shadow-purple-950/20"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Zap size={16} />
          <span>Boosts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("streak")}
          className={`py-2 rounded-full transition-all duration-300 ease-out flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] focus:outline-none ${
            activeSubTab === "streak"
              ? "bg-[#6420a7] text-white shadow-md shadow-purple-950/20"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Award size={16} />
          <span>Daily</span>
        </button>
      </div>

      {/* 1. QUESTS LIST */}
      {activeSubTab === "quests" && (
        <div className="space-y-2.5">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="liquid-glass rounded-[32px] p-4 flex items-center justify-between border border-slate-200 hover:border-[#0098ea]/60 transition-all duration-300 ease-out shadow-xs"
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
                <div className="flex items-center gap-2 mt-1 text-[11px] font-bold">
                  <span className="text-[#0077b5] font-black">+៛ {Math.floor(quest.rewardPoints * 41).toLocaleString()}</span>
                  <span className="text-slate-500 font-medium">
                    (+{quest.rewardPoints} WEI COIN • $ {(quest.rewardPoints / 100).toFixed(2)})
                  </span>
                </div>
              </div>

              <div>
                {quest.claimed ? (
                  <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-[#14532d] text-xs font-bold min-h-[36px]">
                    <Check size={16} />
                    <span>Done</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleClaimQuest(quest.id, quest.rewardPoints)}
                    className="px-4 py-1.5 rounded-full bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold active:scale-95 transition-all duration-300 ease-out shadow-xs cursor-pointer min-h-[36px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
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
          <div className="liquid-glass rounded-[32px] p-4 space-y-2.5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp size={22} className="text-[#0098ea] flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-display">
                    Mint Power (Lvl {tapPower})
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Earns +{tapPower} WEI Coin per tap
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-[#14532d]">
                +{tapPower + 1} WEI / Tap
              </span>
            </div>

            <button
              type="button"
              onClick={onUpgradeTapPower}
              disabled={score < tapUpgradeCost}
              className={`w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease-out shadow-xs min-h-[44px] ${
                score >= tapUpgradeCost
                  ? "bg-[#0098ea] hover:bg-[#0088cc] text-white active:scale-98 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              <span>Upgrade for {tapUpgradeCost.toLocaleString()} WEI COIN (≈ {Math.floor(tapUpgradeCost * 41).toLocaleString()} ៛)</span>
            </button>
          </div>

          {/* Passive Mining Yield Upgrade */}
          <div className="liquid-glass rounded-[32px] p-4 space-y-2.5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Zap size={22} className="text-[#16a34a] flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block font-display">
                    Passive WEI Coin Generator (Lvl {passiveRate})
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Generates +{passiveRate} WEI Coin every second
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-[#14532d]">
                +{passiveRate + 1} WEI/s
              </span>
            </div>

            <button
              type="button"
              onClick={onUpgradePassiveRate}
              disabled={score < passiveUpgradeCost}
              className={`w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease-out shadow-xs min-h-[44px] ${
                score >= passiveUpgradeCost
                  ? "bg-[#16a34a] hover:bg-[#15803d] text-white active:scale-98 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              <span>Upgrade for {passiveUpgradeCost.toLocaleString()} WEI COIN (≈ {Math.floor(passiveUpgradeCost * 41).toLocaleString()} ៛)</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. DAILY CHECK-IN STREAK */}
      {activeSubTab === "streak" && (
        <div className="liquid-glass rounded-[32px] p-4 space-y-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block font-display">
                Daily Check-in Streak
              </span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                Check in continuously for 7 days to unlock maximum WEI Coin bonuses.
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0077b5] font-black text-xs">
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
                  className={`p-1.5 rounded-2xl text-center border transition-all duration-300 ease-out ${
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
            className={`w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease-out shadow-xs min-h-[44px] ${
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
