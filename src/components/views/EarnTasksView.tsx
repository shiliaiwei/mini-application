"use client";

import React, { useState, useMemo } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  Zap,
  Gift,
  Check,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Award,
  Send,
  ShieldCheck,
  Coins,
  Crown,
  ChevronRight,
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

type QuestCategory = "all" | "daily" | "community" | "knowledge" | "milestone";

interface Quest {
  id: string;
  category: "daily" | "community" | "knowledge" | "milestone";
  title: string;
  desc: string;
  rewardPoints: number;
  url?: string;
  claimed: boolean;
  minTapPower?: number;
  minPassiveRate?: number;
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
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory>("all");

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
        id: "daily_claim",
        category: "daily",
        title: "Daily Vault Check-in",
        desc: "Check into the central ledger to claim daily active bounty",
        rewardPoints: 100,
        claimed: false,
      },
      {
        id: "daily_share",
        category: "community",
        title: "Share Mini App with Friends",
        desc: "Invite colleagues and friends to compete on the wealth leaderboard",
        rewardPoints: 500,
        claimed: false,
      },
      {
        id: "tg_channel",
        category: "community",
        title: "Join SHILIAIWEI Official Channel",
        desc: "Stay updated with official game announcements and community updates",
        rewardPoints: 250,
        url: "https://t.me/srievibot",
        claimed: false,
      },
      {
        id: "safety_quiz",
        category: "knowledge",
        title: "Road Knowledge Quiz Challenge",
        desc: "Complete the Kesararam Road Safety verification questions",
        rewardPoints: 350,
        claimed: false,
      },
      {
        id: "tap_power_milestone",
        category: "milestone",
        title: "Mint Power Level 2 Milestone",
        desc: "Upgrade manual tap power to Level 2 or higher to boost minting speed",
        rewardPoints: 200,
        minTapPower: 2,
        claimed: false,
      },
      {
        id: "passive_yield_milestone",
        category: "milestone",
        title: "Autonomous Yield Milestone",
        desc: "Unlock passive yield generation to produce WEI Coin continuously",
        rewardPoints: 300,
        minPassiveRate: 1,
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

  // Calculate streak rewards
  const streakRewards = [50, 100, 200, 350, 600, 1000, 2500];
  const todayStreakReward = streakRewards[(currentStreak - 1) % streakRewards.length];

  const handleClaimStreak = () => {
    if (streakClaimedToday) return;

    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}

    onAddScore(todayStreakReward);
    setStreakClaimedToday(true);

    // Also mark daily_claim quest as claimed if not already
    setQuests((prev) => {
      const updated = prev.map((q) => (q.id === "daily_claim" ? { ...q, claimed: true } : q));
      if (typeof window !== "undefined") {
        const claimedIds = updated.filter((q) => q.claimed).map((q) => q.id);
        localStorage.setItem("shi_claimed_quests", JSON.stringify(claimedIds));
      }
      return updated;
    });

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
          details: `Claimed Day ${currentStreak} streak reward (+${todayStreakReward} WEI COIN)`,
          platform: tgApp?.platform || "TELEGRAM_WEB",
        }),
      }).catch(() => {});
    }
  };

  const handleClaimQuest = (questId: string, rewardPoints: number) => {
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}

    onAddScore(rewardPoints);

    // If claiming daily_claim, sync with streak
    if (questId === "daily_claim" && !streakClaimedToday) {
      setStreakClaimedToday(true);
      if (typeof window !== "undefined") {
        const today = new Date().toDateString();
        localStorage.setItem("shi_streak_last_claim", today);
        const nextDay = (currentStreak % 7) + 1;
        localStorage.setItem("shi_streak_day", String(nextDay));
        setCurrentStreak(nextDay);
      }
    }

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

  const handleShareTask = (questId: string, rewardPoints: number) => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        navigator.share({
          title: "SHILIAIWEI Mini App",
          text: "Play SHILIAIWEI on Telegram, mint WEI Coin, and compete on the wealth leaderboard!",
          url: "https://t.me/srievibot",
        }).catch(() => {});
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText("https://t.me/srievibot");
      }
    } catch {}

    handleClaimQuest(questId, rewardPoints);
  };

  const tapUpgradeCost = tapPower * 150;
  const passiveUpgradeCost = (passiveRate + 1) * 300;

  // Filtered Quests & Progress Metrics
  const claimedCount = useMemo(() => quests.filter((q) => q.claimed).length, [quests]);
  const progressPercent = Math.round((claimedCount / quests.length) * 100);
  const totalBounty = useMemo(() => quests.reduce((acc, q) => acc + q.rewardPoints, 0), [quests]);
  const claimedBounty = useMemo(
    () => quests.filter((q) => q.claimed).reduce((acc, q) => acc + q.rewardPoints, 0),
    [quests]
  );

  const filteredQuests = useMemo(() => {
    if (selectedCategory === "all") return quests;
    return quests.filter((q) => q.category === selectedCategory);
  }, [quests, selectedCategory]);

  return (
    <div className="space-y-3.5 pb-28 font-body select-none text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* 3D Skeuomorphic Purple Leather Overview Pocket */}
      <div
        className="relative rounded-[30px] p-5 overflow-hidden bg-gradient-to-b from-[#5c1a9c] via-[#47127e] to-[#2f0857] text-white"
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

        {/* Guilloche Banknote Background Style */}
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
            <div className="flex items-baseline gap-1 mt-0.5 font-sans">
              <span className="text-2xl sm:text-3xl font-black text-white leading-none">៛</span>
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                {Math.floor(score * 41).toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] text-purple-200/90 font-medium mt-1 flex items-center gap-1.5 font-sans">
              <span className="font-bold text-white">{score.toLocaleString()} WEI COIN</span>
              <span className="text-purple-300">•</span>
              <span className="font-semibold text-purple-100">$ {(score / 100).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-purple-200/90 font-medium uppercase tracking-wider block">
              MINING TELEMETRY
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-white font-bold text-xs mt-1 shadow-inner font-sans">
              <span className="flex items-center gap-1 text-emerald-300">
                <Zap size={13} className="text-emerald-300" />
                +{tapPower}/tap
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1 text-sky-300">
                <TrendingUp size={13} className="text-sky-300" />
                +{passiveRate}/s
              </span>
            </div>
            <div className="text-[10px] text-purple-200/80 font-medium mt-1 text-right font-sans">
              Quests: {claimedCount}/{quests.length} Completed
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
              ? "bg-[#5c1a9c] text-white shadow-md shadow-purple-950/20"
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
              ? "bg-[#5c1a9c] text-white shadow-md shadow-purple-950/20"
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
              ? "bg-[#5c1a9c] text-white shadow-md shadow-purple-950/20"
              : "text-slate-700 hover:text-slate-900"
          }`}
        >
          <Award size={16} />
          <span>Daily Streak</span>
        </button>
      </div>

      {/* 1. MISSIONS & QUESTS LIST */}
      {activeSubTab === "quests" && (
        <div className="space-y-3">
          {/* Progress Overview & Bounty Card */}
          <div className="liquid-glass rounded-[28px] p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-900 font-display">
                Missions Progress
              </span>
              <span className="text-[#5c1a9c] font-black">
                {claimedCount} / {quests.length} Completed ({progressPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-[#5c1a9c] to-[#0098ea] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-2">
              <span>Total Bounty Pool: {totalBounty.toLocaleString()} WEI COIN</span>
              <span className="font-bold text-[#14532d]">
                +{claimedBounty.toLocaleString()} WEI Claimed
              </span>
            </div>
          </div>

          {/* Integrated Daily Login Banner */}
          <div className="liquid-glass rounded-[28px] p-3.5 flex items-center justify-between border border-purple-200/80 bg-gradient-to-r from-purple-50/60 to-sky-50/60 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#5c1a9c] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles size={20} className="text-purple-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 font-display">
                    Day {currentStreak} of 7 Daily Streak
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    +{todayStreakReward} WEI
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {streakClaimedToday
                    ? "Checked in for today. Next reward unlocks tomorrow!"
                    : "Check into the central ledger to advance your streak."}
                </p>
              </div>
            </div>

            <div>
              {streakClaimedToday ? (
                <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-[#14532d] text-xs font-bold min-h-[36px]">
                  <Check size={14} />
                  <span>Done</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleClaimStreak}
                  className="px-4 py-1.5 rounded-full bg-[#5c1a9c] hover:bg-[#47127e] text-white text-xs font-bold active:scale-95 transition-all duration-300 ease-out shadow-xs cursor-pointer min-h-[36px] flex items-center justify-center focus:outline-none"
                >
                  Claim
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "All Tasks", count: quests.length },
              { id: "daily", label: "Daily", count: quests.filter((q) => q.category === "daily").length },
              { id: "community", label: "Community", count: quests.filter((q) => q.category === "community").length },
              { id: "knowledge", label: "Knowledge", count: quests.filter((q) => q.category === "knowledge").length },
              { id: "milestone", label: "Milestones", count: quests.filter((q) => q.category === "milestone").length },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as QuestCategory)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-[#5c1a9c] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Filtered Quests List */}
          <div className="space-y-2.5">
            {filteredQuests.map((quest) => {
              // Icon selector based on category and ID
              const renderQuestIcon = () => {
                if (quest.id === "tg_channel") return <Send size={18} className="text-[#0098ea]" />;
                if (quest.id === "daily_share") return <Sparkles size={18} className="text-amber-500" />;
                if (quest.id === "safety_quiz") return <ShieldCheck size={18} className="text-emerald-600" />;
                if (quest.id === "daily_claim") return <Coins size={18} className="text-purple-600" />;
                if (quest.minTapPower) return <TrendingUp size={18} className="text-[#0098ea]" />;
                return <Zap size={18} className="text-emerald-600" />;
              };

              // Check milestone readiness
              const isTapMilestoneReady = quest.minTapPower ? tapPower >= quest.minTapPower : true;
              const isPassiveMilestoneReady = quest.minPassiveRate ? passiveRate >= quest.minPassiveRate : true;
              const isMilestoneReady = isTapMilestoneReady && isPassiveMilestoneReady;

              return (
                <div
                  key={quest.id}
                  className="liquid-glass rounded-[28px] p-4 flex items-center justify-between border border-slate-200 hover:border-[#0098ea]/60 transition-all duration-300 ease-out shadow-xs"
                >
                  <div className="flex items-start gap-3 flex-1 pr-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      {renderQuestIcon()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {quest.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900 font-display truncate">
                          {quest.title}
                        </span>
                        {quest.url && (
                          <a
                            href={quest.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-[#0098ea]"
                            aria-label={`Open link for ${quest.title}`}
                          >
                            <ArrowUpRight size={14} />
                          </a>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {quest.desc}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-sans">
                        <span className="font-bold text-[#0077b5] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                          +{quest.rewardPoints} WEI COIN
                        </span>
                        <span className="text-slate-500 text-[10px] font-medium">
                          ≈ ៛ {Math.floor(quest.rewardPoints * 41).toLocaleString()} ($ {(quest.rewardPoints / 100).toFixed(2)})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {quest.claimed ? (
                      <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-[#14532d] text-xs font-bold min-h-[36px]">
                        <Check size={14} />
                        <span>Done</span>
                      </div>
                    ) : quest.category === "milestone" && !isMilestoneReady ? (
                      <button
                        type="button"
                        onClick={() => setActiveSubTab("boosts")}
                        className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all duration-200 border border-slate-300 min-h-[36px] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Upgrade</span>
                        <ChevronRight size={12} />
                      </button>
                    ) : quest.id === "daily_share" ? (
                      <button
                        type="button"
                        onClick={() => handleShareTask(quest.id, quest.rewardPoints)}
                        className="px-4 py-1.5 rounded-full bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold active:scale-95 transition-all duration-300 ease-out shadow-xs cursor-pointer min-h-[36px] flex items-center justify-center focus:outline-none"
                      >
                        Share
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (quest.url) {
                            window.open(quest.url, "_blank");
                          }
                          handleClaimQuest(quest.id, quest.rewardPoints);
                        }}
                        className="px-4 py-1.5 rounded-full bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold active:scale-95 transition-all duration-300 ease-out shadow-xs cursor-pointer min-h-[36px] flex items-center justify-center focus:outline-none"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. UPGRADES / BOOSTS */}
      {activeSubTab === "boosts" && (
        <div className="space-y-3">
          {/* Mint Power Upgrade */}
          <div className="liquid-glass rounded-[28px] p-4.5 space-y-3 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0098ea] flex-shrink-0 shadow-xs">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-display">
                      Mint Power
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-[#0077b5] border border-sky-200">
                      Level {tapPower}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    Manual tap minting multiplier per screen tap
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-medium block">Current Yield</span>
                <span className="text-xs font-black text-[#14532d] font-sans">
                  +{tapPower} WEI/Tap
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-sans">
              <span className="text-slate-600 font-medium">Next Tier Boost:</span>
              <span className="font-bold text-[#0098ea]">
                Upgrade to +{tapPower + 1} WEI per tap
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
              {score >= tapUpgradeCost ? (
                <span>
                  Upgrade for {tapUpgradeCost.toLocaleString()} WEI COIN (≈ ៛ {Math.floor(tapUpgradeCost * 41).toLocaleString()})
                </span>
              ) : (
                <span>
                  Need {(tapUpgradeCost - score).toLocaleString()} more WEI COIN to upgrade
                </span>
              )}
            </button>
          </div>

          {/* Passive Mining Yield Upgrade */}
          <div className="liquid-glass rounded-[28px] p-4.5 space-y-3 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16a34a] flex-shrink-0 shadow-xs">
                  <Zap size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-display">
                      Passive WEI Generator
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#14532d] border border-emerald-200">
                      Level {passiveRate}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    Autonomous background yield calculated every second
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-medium block">Current Yield</span>
                <span className="text-xs font-black text-[#14532d] font-sans">
                  +{passiveRate} WEI/s
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-sans">
              <span className="text-slate-600 font-medium">Next Tier Boost:</span>
              <span className="font-bold text-[#16a34a]">
                Upgrade to +{passiveRate + 1} WEI per second
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
              {score >= passiveUpgradeCost ? (
                <span>
                  Upgrade for {passiveUpgradeCost.toLocaleString()} WEI COIN (≈ ៛ {Math.floor(passiveUpgradeCost * 41).toLocaleString()})
                </span>
              ) : (
                <span>
                  Need {(passiveUpgradeCost - score).toLocaleString()} more WEI COIN to upgrade
                </span>
              )}
            </button>
          </div>

          {/* Architecture Tip Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 block font-display">
              Mining Engine Telemetry
            </span>
            <p className="text-[11px] leading-relaxed">
              Mint Power multiplies every manual tap interaction on the central coin. Passive Generator produces yield autonomously in real time even while browsing other menus.
            </p>
          </div>
        </div>
      )}

      {/* 3. DAILY CHECK-IN STREAK */}
      {activeSubTab === "streak" && (
        <div className="liquid-glass rounded-[28px] p-4.5 space-y-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block font-display">
                7-Day Consecutive Protocol
              </span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                Check in every 24 hours to scale your rewards. Day 7 unlocks the Grand Vault Prize.
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#5c1a9c] font-black text-xs">
              Day {currentStreak} / 7
            </div>
          </div>

          {/* 7 Days Grid with Day 7 Highlight */}
          <div className="grid grid-cols-7 gap-1.5">
            {[50, 100, 200, 350, 600, 1000, 2500].map((pts, idx) => {
              const dayNum = idx + 1;
              const isPast = dayNum < currentStreak;
              const isToday = dayNum === currentStreak;
              const isGrand = dayNum === 7;

              return (
                <div
                  key={dayNum}
                  className={`p-2 rounded-2xl text-center border transition-all duration-300 ease-out flex flex-col justify-between min-h-[72px] ${
                    isToday
                      ? "bg-purple-50/80 border-[#5c1a9c] ring-2 ring-[#5c1a9c]/20 shadow-xs"
                      : isGrand
                      ? "bg-gradient-to-b from-amber-50 to-amber-100/60 border-amber-300 text-amber-900"
                      : isPast
                      ? "bg-slate-50 border-slate-200 text-slate-400"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-center gap-0.5">
                    {isGrand && <Crown size={10} className="text-amber-600" />}
                    <span className="text-[9px] font-bold block uppercase text-slate-500">
                      D{dayNum}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black block mt-1 font-sans ${
                      isToday ? "text-[#5c1a9c]" : isGrand ? "text-amber-800" : isPast ? "text-slate-400" : "text-slate-800"
                    }`}
                  >
                    +{pts}
                  </span>

                  <div className="mt-1 flex items-center justify-center">
                    {isPast ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : isToday ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a9c] animate-pulse" />
                    ) : (
                      <span className="text-[8px] text-slate-400 font-medium">WEI</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleClaimStreak}
            disabled={streakClaimedToday}
            className={`w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease-out shadow-xs min-h-[46px] ${
              streakClaimedToday
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-gradient-to-r from-[#5c1a9c] to-[#0098ea] hover:from-[#47127e] hover:to-[#0088cc] text-white active:scale-98 cursor-pointer focus:outline-none shadow-md shadow-purple-950/20"
            }`}
          >
            <Sparkles size={18} />
            <span>
              {streakClaimedToday
                ? "Check-in Claimed for Today"
                : `Claim Day ${currentStreak} Bonus (+${todayStreakReward} WEI COIN)`}
            </span>
          </button>
        </div>
      )}

      {/* Consistent Brand Footer */}
      <BrandFooter height={16} className="mt-4 pb-2" />
    </div>
  );
};
