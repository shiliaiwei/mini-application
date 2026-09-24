"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { WinGramHeader } from "@/components/navigation/WinGramHeader";
import { CategoryBar, NavCategory } from "@/components/navigation/CategoryBar";
import { WinGramFooter } from "@/components/navigation/WinGramFooter";
import { GameDock, GameTab } from "@/components/dock/GameDock";
import { TapGameView } from "@/components/views/TapGameView";
import { EarnTasksView } from "@/components/views/EarnTasksView";
import { SwapView } from "@/components/views/SwapView";
import { LeaderboardView } from "@/components/views/LeaderboardView";
import { GameProfileView } from "@/components/views/GameProfileView";
import { GameWelcomeScreen } from "@/components/welcome/GameWelcomeScreen";
import { TelegramGateScreen } from "@/components/common/TelegramGateScreen";
import { Headphones, X, Check, Wallet, ArrowUpRight, DollarSign } from "lucide-react";

import { GameCards3DView } from "@/components/views/GameCards3DView";

export default function MiniAppPage() {
  const [tgApp, setTgApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState<GameTab>("wallet");
  const [activeCategory, setActiveCategory] = useState<NavCategory>("lobby");

  // Modals
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Game Mechanics State
  const [score, setScore] = useState(0);
  const [spendSeconds, setSpendSeconds] = useState(0);
  const [energy, setEnergy] = useState(1000);
  const [userRank, setUserRank] = useState(1);
  const maxEnergy = 1000;

  // Crypto Upgrades & Mining Power
  const [tapPower, setTapPower] = useState(1);
  const [passiveRate, setPassiveRate] = useState(0);

  const scoreRef = useRef(score);
  const spendRef = useRef(spendSeconds);
  scoreRef.current = score;
  spendRef.current = spendSeconds;

  // Track active time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setSpendSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Energy regeneration
  useEffect(() => {
    const energyTimer = setInterval(() => {
      setEnergy((prev) => Math.min(maxEnergy, prev + 2));
    }, 2000);
    return () => clearInterval(energyTimer);
  }, [maxEnergy]);

  // Passive Auto-Miner Yield
  useEffect(() => {
    if (passiveRate <= 0) return;
    const passiveTimer = setInterval(() => {
      setScore((prev) => prev + passiveRate);
    }, 1000);
    return () => clearInterval(passiveTimer);
  }, [passiveRate]);

  // Load initial score and upgrades from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScore = localStorage.getItem("shi_game_score");
      if (savedScore) {
        setScore(parseInt(savedScore, 10) || 0);
      }
      const savedTime = localStorage.getItem("shi_game_time");
      if (savedTime) {
        setSpendSeconds(parseInt(savedTime, 10) || 0);
      }
      const savedPower = localStorage.getItem("shi_tap_power");
      if (savedPower) {
        setTapPower(parseInt(savedPower, 10) || 1);
      }
      const savedPassive = localStorage.getItem("shi_passive_rate");
      if (savedPassive) {
        setPassiveRate(parseInt(savedPassive, 10) || 0);
      }
    }
  }, []);

  // Sync to Neon Database
  const syncWithDatabase = useCallback(async (currentScore: number, currentTime: number) => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/player/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          score: currentScore,
          spend_seconds: currentTime,
        }),
      });
      const data = await res.json();
      if (data && data.rank) {
        setUserRank(data.rank);
      }
    } catch {}
  }, [user]);

  // Periodic database sync every 4 seconds
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      syncWithDatabase(scoreRef.current, spendRef.current);
    }, 4000);
    return () => clearInterval(interval);
  }, [user, syncWithDatabase]);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && score > 0) {
      localStorage.setItem("shi_game_score", String(score));
      localStorage.setItem("shi_game_time", String(spendSeconds));
    }
  }, [score, spendSeconds]);

  // Initialize Telegram WebApp & Auto-Sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      const app = window.Telegram?.WebApp;
      if (app) {
        try {
          app.ready();
          app.expand();
          if (app.requestFullscreen) {
            try {
              app.requestFullscreen();
            } catch {}
          }
          if (app.enableClosingConfirmation) {
            app.enableClosingConfirmation();
          }
          if (app.setHeaderColor) {
            app.setHeaderColor("#ffffff");
          }
          if (app.setBackgroundColor) {
            app.setBackgroundColor("#ffffff");
          }
        } catch (e) {
          console.warn("Telegram WebApp init error:", e);
        }

        setTgApp(app);

        const tgUser = app.initDataUnsafe?.user;
        if (tgUser && tgUser.id) {
          setUser(tgUser);
          syncWithDatabase(scoreRef.current, spendRef.current);
        }
      }

      setIsReady(true);
    }
  }, [syncWithDatabase]);

  const handleTap = useCallback(() => {
    setScore((prev) => prev + tapPower);
    setEnergy((prev) => Math.max(0, prev - 1));
  }, [tapPower]);

  const handleUpgradeTapPower = useCallback(() => {
    const cost = tapPower * 150;
    if (score >= cost) {
      setScore((prev) => prev - cost);
      setTapPower((prev) => {
        const next = prev + 1;
        if (typeof window !== "undefined") {
          localStorage.setItem("shi_tap_power", String(next));
        }
        return next;
      });
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
    }
  }, [score, tapPower, tgApp]);

  const handleUpgradePassiveRate = useCallback(() => {
    const cost = (passiveRate + 1) * 300;
    if (score >= cost) {
      setScore((prev) => prev - cost);
      setPassiveRate((prev) => {
        const next = prev + 1;
        if (typeof window !== "undefined") {
          localStorage.setItem("shi_passive_rate", String(next));
        }
        return next;
      });
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
    }
  }, [score, passiveRate, tgApp]);

  const handleAddScore = useCallback((amount: number) => {
    setScore((prev) => prev + amount);
  }, []);

  const handleTabChange = (tab: GameTab) => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}
    syncWithDatabase(scoreRef.current, spendRef.current);
    setActiveTab(tab);

    // Sync category bar state
    if (tab === "wallet") setActiveCategory("lobby");
    else if (tab === "games") setActiveCategory("games");
    else if (tab === "earn") setActiveCategory("earn");
    else if (tab === "swap") setActiveCategory("swap");
    else if (tab === "leaderboard") setActiveCategory("tournaments");
    else if (tab === "profile") setActiveCategory("security");
  };

  const handleCategorySelect = (cat: NavCategory) => {
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
    setActiveCategory(cat);

    if (cat === "lobby" || cat === "vault" || cat === "popular" || cat === "favorites") {
      setActiveTab("wallet");
    } else if (cat === "games") {
      setActiveTab("games");
    } else if (cat === "earn") {
      setActiveTab("earn");
    } else if (cat === "swap") {
      setActiveTab("swap");
    } else if (cat === "tournaments") {
      setActiveTab("leaderboard");
    } else if (cat === "security") {
      setActiveTab("profile");
    }
  };

  const handleExecuteTopUp = () => {
    setScore((prev) => prev + topUpAmount);
    setTopUpSuccess(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setTimeout(() => {
      setTopUpSuccess(false);
      setShowTopUpModal(false);
    }, 1500);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen app-bg-white flex items-center justify-center text-[#0098ea] font-display text-sm">
        <span className="uppercase tracking-widest animate-pulse">CONNECTING SHILIAIWEI VAULT...</span>
      </div>
    );
  }

  // Telegram Sync Gate: Users outside Telegram can connect a dev/browser session
  if (!user?.id) {
    return (
      <TelegramGateScreen
        onBypass={() => {
          const devUser: TelegramUser = {
            id: 88888888,
            first_name: "SHILIAIWEI Holder",
            username: "shiliaiwei_holder",
          };
          setUser(devUser);
          syncWithDatabase(scoreRef.current, spendRef.current);
        }}
      />
    );
  }

  // Welcome Screen with Auto-Sync & Auto-Open
  if (showWelcome) {
    return (
      <GameWelcomeScreen
        user={user}
        tgApp={tgApp}
        onComplete={() => setShowWelcome(false)}
      />
    );
  }

  return (
    <div className="min-h-dvh flex flex-col justify-between app-bg-white text-slate-900 select-none overflow-x-hidden font-body relative">
      {/* 1. WinGram Style Top Navigation Header */}
      <WinGramHeader
        score={score}
        user={user}
        activeMode={activeTab === "wallet" ? "lobby" : activeTab}
        onSelectMode={(mode) => {
          if (mode === "lobby") handleTabChange("wallet");
          else if (mode === "earn") handleTabChange("earn");
          else if (mode === "bonuses") handleTabChange("games");
        }}
        onOpenProfile={() => handleTabChange("profile")}
        onOpenTopUp={() => setShowTopUpModal(true)}
      />

      {/* 2. WinGram Style Horizontal Category Scroller */}
      <CategoryBar
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* 3. Main SPA View Switcher */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 pt-3">
        {activeTab === "wallet" && (
          <TapGameView
            score={score}
            onTap={handleTap}
            energy={energy}
            maxEnergy={maxEnergy}
            spendSeconds={spendSeconds}
            tapPower={tapPower}
            passiveRate={passiveRate}
            onGoToSwap={() => handleTabChange("swap")}
            onGoToEarn={() => handleTabChange("earn")}
            user={user}
            tgApp={tgApp}
          />
        )}

        {activeTab === "games" && (
          <GameCards3DView
            score={score}
            onAddScore={handleAddScore}
            user={user}
            tgApp={tgApp}
          />
        )}

        {activeTab === "earn" && (
          <EarnTasksView
            score={score}
            onAddScore={handleAddScore}
            tapPower={tapPower}
            onUpgradeTapPower={handleUpgradeTapPower}
            passiveRate={passiveRate}
            onUpgradePassiveRate={handleUpgradePassiveRate}
            user={user}
            tgApp={tgApp}
          />
        )}

        {activeTab === "swap" && (
          <SwapView
            score={score}
            onSetScore={(newScore) => setScore(newScore)}
            user={user}
            tgApp={tgApp}
          />
        )}

        {activeTab === "leaderboard" && (
          <LeaderboardView
            userScore={score}
            userSpendSeconds={spendSeconds}
            user={user}
            userRank={userRank}
          />
        )}

        {activeTab === "profile" && (
          <GameProfileView
            user={user}
            tgApp={tgApp}
            score={score}
            spendSeconds={spendSeconds}
            tapPower={tapPower}
            passiveRate={passiveRate}
            onBack={() => handleTabChange("wallet")}
          />
        )}
      </main>

      {/* 4. WinGram Floating Headphone Support Button */}
      <button
        type="button"
        onClick={() => setShowSupportModal(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-[#0098ea] hover:bg-[#0087d1] text-white flex items-center justify-center shadow-2xl shadow-[#0098ea]/40 border border-white/20 active:scale-90 transition-all cursor-pointer"
        title="24/7 Support"
      >
        <Headphones className="w-5 h-5" />
      </button>

      {/* 5. WinGram Style Official Footer */}
      <WinGramFooter
        onOpenSupport={() => setShowSupportModal(true)}
        onScrollToTop={() => {
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      />

      {/* 6. Floating Bottom Dock for Easy Mobile Navigation */}
      <GameDock
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        user={user}
      />

      {/* Support Modal (WinGram 24/7 Support) */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="liquid-glass-modal p-5 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#0098ea]" />
                <span className="text-sm font-bold text-slate-900 uppercase font-display">
                  SHILIAIWEI Support 24/7
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-center">
              <Headphones className="w-8 h-8 text-[#0098ea] mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Live Customer Assistance</h4>
              <p className="text-xs text-slate-500">
                Contact our official Telegram concierge desk for instant deposit, account verification, and transaction support.
              </p>
            </div>

            <a
              href="https://t.me/srievibot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-[#0098ea] hover:bg-[#0088cc] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>Message Support on Telegram</span>
            </a>

            <button
              type="button"
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Top Up Modal (WinGram Quick Top-up) */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="liquid-glass-modal p-5 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#16a34a]" />
                <span className="text-sm font-bold text-slate-900 uppercase font-display">
                  Top Up Vault
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select simulated USD credit package to instantly boost your vault balance.
            </p>

            {/* Amount Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 250, 500, 1000, 2500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2.5 rounded-xl border text-xs font-black transition-all ${
                    topUpAmount === amt
                      ? "bg-[#0098ea] border-[#0098ea] text-white shadow-sm shadow-[#0098ea]/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  +${amt}
                </button>
              ))}
            </div>

            {topUpSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16a34a] text-xs font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Successfully added +${topUpAmount}.00 to Vault!</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExecuteTopUp}
              disabled={topUpSuccess}
              className="w-full py-3.5 rounded-xl bg-[#0098ea] hover:bg-[#0088cc] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <DollarSign className="w-4 h-4" />
              <span>Confirm Top Up (${topUpAmount}.00)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
