"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { NavCategory } from "@/components/navigation/CategoryBar";
import { GameDock, GameTab } from "@/components/dock/GameDock";
import { TapGameView } from "@/components/views/TapGameView";
import { EarnTasksView } from "@/components/views/EarnTasksView";
import { LeaderboardView } from "@/components/views/LeaderboardView";
import { GameProfileView, ProfileSubTab } from "@/components/views/GameProfileView";
import { GameWelcomeScreen } from "@/components/welcome/GameWelcomeScreen";
import { TelegramGateScreen } from "@/components/common/TelegramGateScreen";
import { MiniGameFullView, MiniGameType } from "@/components/views/MiniGameFullView";
import { StatsDetailSpaView } from "@/components/views/StatsDetailSpaView";
import { AdDetailSpaView } from "@/components/views/AdDetailSpaView";
import { TopBrandNavBar } from "@/components/navigation/TopBrandNavBar";
import {
  Check,
  Wallet,
  DollarSign,
  ChevronLeft,
} from "@/components/icons/KeylineIcons";

export default function MiniAppPage() {
  const [tgApp, setTgApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState<GameTab>("wallet");
  const [activeCategory, setActiveCategory] = useState<NavCategory>("lobby");
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>("profile");
  const [activeGameScreen, setActiveGameScreen] = useState<MiniGameType | null>(null);
  const [activeStatsScreen, setActiveStatsScreen] = useState(false);
  const [activeAdPartnerId, setActiveAdPartnerId] = useState<string>("mpwt");
  const [activeAdSpaScreen, setActiveAdSpaScreen] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [activeTopUpScreen, setActiveTopUpScreen] = useState(false);

  // Top Up State
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

  // Passive Auto-Miner Yield: Auto-increase is disabled to prevent dollar and Khmer currency from auto-ticking in Telegram.
  // Points must be explicitly claimed through playing games or tapping.

  // Load initial score, upgrades, and cached Telegram user from localStorage for instant start
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
      // Instant User Hydration from cache
      try {
        const cachedUserStr = localStorage.getItem("shi_tg_user_cache");
        if (cachedUserStr) {
          const cachedUser = JSON.parse(cachedUserStr);
          if (cachedUser?.id) {
            setUser(cachedUser);
          }
        }
      } catch {}
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
      if (data?.player?.score && data.player.score > currentScore) {
        setScore(data.player.score);
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

  // Audit Log: Record login event into Neon PostgreSQL
  useEffect(() => {
    if (!user?.id) return;
    const recordedKey = `audit_login_${user.id}_${new Date().toDateString()}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(recordedKey)) return;

    fetch("/api/audit/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegram_id: user.id,
        action: "LOGIN",
        details: `User @${user.username || user.first_name} authenticated session`,
        platform: tgApp?.platform || "TELEGRAM_WEB",
      }),
    })
      .then(() => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(recordedKey, "true");
        }
      })
      .catch(() => {});
  }, [user?.id, user?.username, user?.first_name, tgApp?.platform]);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && score > 0) {
      localStorage.setItem("shi_game_score", String(score));
      localStorage.setItem("shi_game_time", String(spendSeconds));
    }
  }, [score, spendSeconds]);

  // High-Speed Telegram WebApp Detection & Instant Sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setupApp = (app: TelegramWebApp) => {
      try {
        app.ready();
        app.expand();
        if (app.isVersionAtLeast?.("8.0") && typeof app.requestFullscreen === "function") {
          try {
            app.requestFullscreen();
          } catch {}
        }
        if (app.isVersionAtLeast?.("6.2") && typeof app.enableClosingConfirmation === "function") {
          try {
            app.enableClosingConfirmation();
          } catch {}
        }
        if (app.isVersionAtLeast?.("6.1")) {
          try {
            app.setHeaderColor?.("#ffffff");
            app.setBackgroundColor?.("#ffffff");
          } catch {}
        }
      } catch (e) {
        console.warn("Telegram WebApp init error:", e);
      }

      setTgApp(app);

      const tgUser = app.initDataUnsafe?.user;
      if (tgUser && tgUser.id) {
        setUser(tgUser);
        try {
          localStorage.setItem("shi_tg_user_cache", JSON.stringify(tgUser));
        } catch {}
        syncWithDatabase(scoreRef.current, spendRef.current);
      }
      setIsReady(true);
    };

    // Check immediately
    const directApp = window.Telegram?.WebApp;
    if (directApp) {
      setupApp(directApp);
      return;
    }

    // High-speed micro-poll every 20ms up to 600ms to catch Telegram injection without delay
    let pollCount = 0;
    const interval = setInterval(() => {
      pollCount++;
      const polledApp = window.Telegram?.WebApp;
      if (polledApp) {
        clearInterval(interval);
        setupApp(polledApp);
      } else if (pollCount >= 30) {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 20);

    return () => clearInterval(interval);
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
    setActiveGameScreen(null);
    setActiveStatsScreen(false);
    setActiveAdSpaScreen(false);
    setActiveTab(tab);

    // Sync category bar state
    if (tab === "wallet") setActiveCategory("lobby");
    else if (tab === "earn") setActiveCategory("earn");
    else if (tab === "leaderboard") setActiveCategory("tournaments");
    else if (tab === "profile") setActiveCategory("settings");
  };

  const handleCategorySelect = (cat: NavCategory) => {
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
    setActiveGameScreen(null);
    setActiveStatsScreen(false);
    setActiveAdSpaScreen(false);
    setActiveCategory(cat);

    if (cat === "lobby" || cat === "vault" || cat === "popular" || cat === "favorites") {
      setActiveTab("wallet");
    } else if (cat === "earn") {
      setActiveTab("earn");
    } else if (cat === "tournaments") {
      setActiveTab("leaderboard");
    } else if (cat === "settings") {
      setProfileSubTab("profile");
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
      setActiveTopUpScreen(false);
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
      {/* Vector Guilloche Banknote Security Mesh from background.svg */}
      <div className="fixed inset-0 bg-app-guilloche opacity-[0.06] pointer-events-none z-0" />

      {/* Sticky Global Top Navigation Bar with pt-[45px] - NOT in profile menu */}
      {activeTab !== "profile" && (
        <TopBrandNavBar
          showBalances={showBalances}
          onToggleBalances={() => setShowBalances(!showBalances)}
          onOpenProfile={() => {
            setProfileSubTab("profile");
            handleTabChange("profile");
          }}
          onOpenNotifications={() => setActiveStatsScreen(true)}
          user={user}
          tgApp={tgApp}
        />
      )}

      {/* 3. Main SPA View Switcher */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 pt-2 pb-safe">
        {activeTopUpScreen ? (
          <div className="w-full max-w-xl mx-auto space-y-4 pt-1 pb-28 animate-fadeIn select-none font-sans text-slate-900">
            {/* Top Navigation Bar with Back Button */}
            <div className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-2">
              <button
                type="button"
                onClick={() => setActiveTopUpScreen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft size={16} className="text-[#0098ea]" />
                <span>Back</span>
              </button>
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-[#16a34a]" />
                <span className="text-sm font-black uppercase text-slate-900">
                  Top Up Vault
                </span>
              </div>
              <div className="w-14" />
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
              <div className="text-center py-2 space-y-1">
                <span className="text-xs font-black tracking-widest text-[#0098ea] uppercase block">
                  Simulated USD Boost
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Instant Vault Top-Up
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a simulated USD credit package to instantly boost your vault balance and claim points.
                </p>
              </div>

              {/* Amount Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {[50, 100, 250, 500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setTopUpAmount(amt);
                    }}
                    className={`py-3 rounded-full border text-xs font-black transition-all duration-300 ease-out flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                      topUpAmount === amt
                        ? "bg-[#0098ea] border-[#0098ea] text-white shadow-md shadow-[#0098ea]/20"
                        : "bg-slate-50 hover:bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <span className="text-base font-black">+${amt}</span>
                    <span className={`text-[10px] ${topUpAmount === amt ? "text-sky-100" : "text-slate-400"}`}>
                      +{amt * 100} PTS
                    </span>
                  </button>
                ))}
              </div>

              {topUpSuccess && (
                <div className="p-3 rounded-full bg-emerald-50 border border-emerald-200 text-[#16a34a] text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
                  <Check size={18} className="w-4 h-4" />
                  <span>Successfully added +${topUpAmount}.00 (+{topUpAmount * 100} PTS) to Vault!</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleExecuteTopUp}
                disabled={topUpSuccess}
                className="w-full py-3.5 rounded-full bg-[#0098ea] hover:bg-[#0088cc] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all duration-300 ease-out cursor-pointer disabled:opacity-50"
              >
                <DollarSign size={18} />
                <span>Confirm Top Up (${topUpAmount}.00)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTopUpScreen(false)}
                className="w-full py-2.5 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors duration-300 ease-out cursor-pointer"
              >
                Exit to Home View
              </button>
            </div>
          </div>
        ) : activeGameScreen ? (
          <MiniGameFullView
            game={activeGameScreen}
            score={score}
            onAddScore={handleAddScore}
            onBack={() => setActiveGameScreen(null)}
            user={user}
            tgApp={tgApp}
          />
        ) : activeStatsScreen ? (
          <StatsDetailSpaView
            score={score}
            onBack={() => setActiveStatsScreen(false)}
            user={user}
            tgApp={tgApp}
          />
        ) : activeAdSpaScreen ? (
          <AdDetailSpaView
            partnerId={activeAdPartnerId}
            onBack={() => setActiveAdSpaScreen(false)}
            onSelectPartner={(id) => setActiveAdPartnerId(id)}
            onAddScore={handleAddScore}
            user={user}
            tgApp={tgApp}
          />
        ) : (
          <>
            {activeTab === "wallet" && (
              <TapGameView
                score={score}
                onTap={handleTap}
                energy={energy}
                maxEnergy={maxEnergy}
                spendSeconds={spendSeconds}
                tapPower={tapPower}
                passiveRate={passiveRate}
                showBalances={showBalances}
                onToggleBalances={() => setShowBalances(!showBalances)}
                onAddScore={handleAddScore}
                onSelectCategory={handleCategorySelect}
                onOpenStats={() => {
                  try {
                    tgApp?.HapticFeedback?.impactOccurred("medium");
                  } catch {}
                  setActiveStatsScreen(true);
                }}
                onOpenAdDetail={(partnerId) => {
                  try {
                    tgApp?.HapticFeedback?.impactOccurred("medium");
                  } catch {}
                  setActiveAdPartnerId(partnerId);
                  setActiveAdSpaScreen(true);
                }}
                onSelectGame={(selectedGame) => {
                  try {
                    tgApp?.HapticFeedback?.impactOccurred("medium");
                  } catch {}
                  setActiveGameScreen(selectedGame);
                }}
                onGoToSwap={() => {
                  setProfileSubTab("swap");
                  handleTabChange("profile");
                }}
                onGoToEarn={() => handleTabChange("earn")}
                onGoToSettings={() => {
                  setProfileSubTab("profile");
                  handleTabChange("profile");
                }}
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
                initialSubTab={profileSubTab}
                onSetScore={(newScore) => setScore(newScore)}
                onBack={() => handleTabChange("wallet")}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Dock for Easy Mobile Navigation */}
      <GameDock
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        user={user}
      />
    </div>
  );
}
