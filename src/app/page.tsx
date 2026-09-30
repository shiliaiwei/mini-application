"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { NavCategory } from "@/components/navigation/CategoryBar";
import { GameDock, GameTab } from "@/components/dock/GameDock";
import { TapGameView } from "@/components/views/TapGameView";
import type { ProfileSubTab } from "@/components/views/GameProfileView";
import { TopBrandNavBar } from "@/components/navigation/TopBrandNavBar";
import { isLocalhostEnvironment } from "@/lib/telegramAuth";
import {
  Check,
  Wallet,
  DollarSign,
  ChevronLeft,
} from "@/components/icons/KeylineIcons";
import { AccountAuthView } from "@/components/auth/AccountAuthView";

import { EarnTasksView } from "@/components/views/EarnTasksView";
import { LeaderboardView } from "@/components/views/LeaderboardView";
import { GameProfileView } from "@/components/views/GameProfileView";

// NOTE: LOCAL_DEMO_USER is permanently disabled. Never display demo user per production security standards.
const LOCAL_DEMO_USER: TelegramUser | null = null;

function detectIsTelegramClient(): boolean {
  if (typeof window === "undefined") return false;

  const app = window.Telegram?.WebApp;
  if (!app) return false;

  const isInsideIframe = window.self !== window.top;
  const platform = app.platform;
  const isNativePlatform = Boolean(platform && !["unknown", ""].includes(platform));

  // 1. Direct Telegram WebApp injected with valid user ID
  if (app.initDataUnsafe?.user?.id && app.initDataUnsafe.user.id > 0) {
    return true;
  }

  // 2. Telegram WebApp running in official iframe or native client platform
  if (isInsideIframe || isNativePlatform) {
    return true;
  }

  // 3. Telegram WebApp runtime API functions (unique to Telegram)
  if (
    typeof app.ready === "function" &&
    typeof app.close === "function" &&
    (typeof app.initData === "string" || isInsideIframe)
  ) {
    return true;
  }

  // 4. Telegram client user-agent inside Telegram native apps
  const ua = navigator.userAgent || "";
  if (/TelegramBot|TelegramMessenger|Telegram-Android|tdesktop/i.test(ua)) {
    return true;
  }

  return false;
}

export default function MiniAppPage() {
  const [tgApp, setTgApp] = useState<TelegramWebApp | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isTelegramClient, setIsTelegramClient] = useState<boolean>(false);
  const [isTelegramVerified, setIsTelegramVerified] = useState<boolean>(false);
  const isVerifiedRef = useRef<boolean>(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [activeTab, setActiveTab] = useState<GameTab>("wallet");
  const [activeCategory, setActiveCategory] = useState<NavCategory>("lobby");
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>("profile");
  const [showBalances, setShowBalances] = useState(true);
  const [activeTopUpScreen, setActiveTopUpScreen] = useState(false);

  // Top Up State (Reset to 0)
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Distinct Currency Block Stores with separate default initial amounts
  const [score, setScore] = useState(100); // Store 1: WEI Coin Block Store (100 WEI)
  const [usdBalance, setUsdBalance] = useState(5.0); // Store 2: US Dollar Block Store ($5.00 USD)
  const [khrBalance, setKhrBalance] = useState(20500); // Store 3: Khmer Riel Block Store (20,500 KHR)
  const [spendSeconds, setSpendSeconds] = useState(0);

  // Crypto Upgrades & Mining Power
  const [tapPower, setTapPower] = useState(1);
  const [passiveRate, setPassiveRate] = useState(0);

  const scoreRef = useRef(score);
  const spendRef = useRef(spendSeconds);
  const lastSyncedScoreRef = useRef(-1);
  const lastSyncedSpendRef = useRef(-1);

  // Update refs on state changes rather than render phase
  useEffect(() => {
    scoreRef.current = score;
    spendRef.current = spendSeconds;
  }, [score, spendSeconds]);

  // Persist distinct currency block stores
  useEffect(() => {
    try {
      localStorage.setItem("shi_store_wei", String(score));
    } catch {}
  }, [score]);

  useEffect(() => {
    try {
      localStorage.setItem("shi_store_usd", String(usdBalance));
    } catch {}
  }, [usdBalance]);

  useEffect(() => {
    try {
      localStorage.setItem("shi_store_khr", String(khrBalance));
    } catch {}
  }, [khrBalance]);

  // Dynamic Dock Visibility on Scroll
  const [isDockVisible, setIsDockVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const isLocal = isLocalhostEnvironment(window.location.hostname);

    // 1. Resolve Telegram environment
    const isTg = detectIsTelegramClient();
    setIsTelegramClient(isTg);

    // 2. Resolve user:
    // In Telegram WebApp: auto-sync authentic Telegram user immediately
    const directUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (directUser?.id) {
      const enrichedUser: TelegramUser = {
        ...directUser,
        photo_url:
          directUser.photo_url ||
          `/api/player/avatar?telegram_id=${directUser.id}`,
      };
      setUser(enrichedUser);
      setIsTelegramVerified(true);
      isVerifiedRef.current = true;
      setIsTelegramClient(true);
      try {
        localStorage.setItem("shi_tg_user_cache", JSON.stringify(enrichedUser));
      } catch {}
    } else {
      // In web browser: check for authenticated cached user
      // Strictly NEVER default to demo user: unauthenticated sessions must log in or auto-sync
      try {
        const cachedUserStr = localStorage.getItem("shi_tg_user_cache");
        if (cachedUserStr) {
          const cachedUser = JSON.parse(cachedUserStr);
          const isStaleDemo =
            !cachedUser?.id ||
            typeof cachedUser.id !== "number" ||
            cachedUser.id <= 0 ||
            String(cachedUser.username || "").toLowerCase().includes("demo") ||
            String(cachedUser.first_name || "").toLowerCase().includes("demo") ||
            cachedUser.username === "shiliaiwei_holder" ||
            cachedUser.username === "demo_tester";

          if (!isStaleDemo) {
            setUser(cachedUser);
            setIsTelegramVerified(true);
            isVerifiedRef.current = true;
          } else {
            // Purge stale demo user from storage
            localStorage.removeItem("shi_tg_user_cache");
          }
        }
      } catch {}
    }

    // 3. Load independent currency block store balances
    try {
      const savedWei = localStorage.getItem("shi_store_wei");
      const savedUsd = localStorage.getItem("shi_store_usd");
      const savedKhr = localStorage.getItem("shi_store_khr");
      if (savedWei !== null) {
        setScore(Math.max(0, parseInt(savedWei, 10) || 0));
      } else {
        setScore(100);
      }
      if (savedUsd !== null) {
        setUsdBalance(Math.max(0, parseFloat(savedUsd) || 0));
      } else {
        setUsdBalance(5.0);
      }
      if (savedKhr !== null) {
        setKhrBalance(Math.max(0, parseInt(savedKhr, 10) || 0));
      } else {
        setKhrBalance(20500);
      }
    } catch {}

    // 4. Resolve tab parameter from search params or Telegram Settings hash
    const params = new URLSearchParams(window.location.search);
    const rawTab = (params.get("tab") || "").toLowerCase();
    if (rawTab === "tasks" || rawTab === "earn" || rawTab === "missions") {
      setActiveTab("earn");
    } else if (rawTab === "rank" || rawTab === "leaderboard") {
      setActiveTab("leaderboard");
    } else if (rawTab === "wallet" || rawTab === "home") {
      setActiveTab("wallet");
    } else if (rawTab === "profile") {
      setActiveTab("profile");
    }
    if (
      params.get("subtab") === "settings" ||
      rawTab === "settings" ||
      window.location.hash.includes("tgWebAppShowSettings=1")
    ) {
      setProfileSubTab("settings");
      setActiveTab("profile");
    }
  }, []);

  // Track scroll direction for dock hide/show
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastScrollYRef.current;

          // When scrolling down, hide dock to maximize content view
          if (delta > 8 && currentY > 50) {
            setIsDockVisible(false);
          }
          // When scrolling up, show dock
          else if (delta < -8 || currentY <= 30) {
            setIsDockVisible(true);
          }

          // If reached near page bottom, reveal dock
          const windowHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;
          if (currentY + windowHeight >= docHeight - 70) {
            setIsDockVisible(true);
          }

          lastScrollYRef.current = currentY;

          // Gently restore dock 1.2s after scroll stops
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          scrollTimeoutRef.current = setTimeout(() => {
            setIsDockVisible(true);
          }, 1200);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Track active time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setSpendSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);



  // Passive Auto-Miner Yield: Auto-increase is disabled to prevent dollar and Khmer currency from auto-ticking in Telegram.
  // WEI Coin must be explicitly claimed through playing games or tapping.

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
      // Instant User Hydration from synced Telegram cache (Web & Mini App)
      try {
        const cachedUserStr = localStorage.getItem("shi_tg_user_cache");
        if (cachedUserStr) {
          const cachedUser = JSON.parse(cachedUserStr);
          if (cachedUser?.id && typeof cachedUser.id === "number" && cachedUser.id > 0) {
            setUser(cachedUser);
            setIsTelegramVerified(true);
            isVerifiedRef.current = true;
          }
        }
      } catch {}
    }
  }, []);

  // Sync to Neon Database with smart change detection
  const syncWithDatabase = useCallback(async (currentScore: number, currentTime: number, force = false) => {
    if (!user?.id) return;
    if (!isVerifiedRef.current) return;
    // Skip redundant network requests if score hasn't changed and time delta < 30s
    if (!force && currentScore === lastSyncedScoreRef.current && Math.abs(currentTime - lastSyncedSpendRef.current) < 30) {
      return;
    }
    lastSyncedScoreRef.current = currentScore;
    lastSyncedSpendRef.current = currentTime;

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
      if (data?.player?.score && data.player.score > currentScore) {
        setScore(data.player.score);
        lastSyncedScoreRef.current = data.player.score;
      }
      if (data?.player?.photo_url) {
        setUser((prev) => {
          if (!prev) return prev;
          if (prev.photo_url === data.player.photo_url) return prev;
          const updated = { ...prev, photo_url: data.player.photo_url };
          try {
            localStorage.setItem("shi_tg_user_cache", JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch {}
  }, [user]);

  // Immediate full profile and wallet ledger sync when user enters
  useEffect(() => {
    if (!user?.id) return;
    if (!isTelegramVerified) return;

    // 1. Force sync user profile with Neon database
    syncWithDatabase(scoreRef.current, spendRef.current, true);

    // 2. Sync wallet ledger balance
    const syncWalletBalance = async () => {
      try {
        const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
          ? window.Telegram.WebApp.initData
          : "";
        const res = await fetch(`/api/wallet/balance?initData=${encodeURIComponent(initData)}&telegram_id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data.balance === "number") {
            setScore(data.balance);
            lastSyncedScoreRef.current = data.balance;
            try {
              localStorage.setItem("shi_game_score", String(data.balance));
            } catch {}
          }
        }
      } catch {}
    };

    syncWalletBalance();
  }, [user?.id, isTelegramVerified, syncWithDatabase]);

  // Periodic database sync every 8 seconds (skips if unverified or no score change)
  useEffect(() => {
    if (!user?.id) return;
    if (!isTelegramVerified) return;
    const interval = setInterval(() => {
      syncWithDatabase(scoreRef.current, spendRef.current, false);
    }, 8000);
    return () => clearInterval(interval);
  }, [user, syncWithDatabase, isTelegramVerified]);

  // Audit Log: Record login event into Neon PostgreSQL (strictly verified sessions only)
  useEffect(() => {
    if (!user?.id) return;
    if (!isTelegramVerified) return;
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
      setIsTelegramClient(true);
      setIsTelegramVerified(true);
      isVerifiedRef.current = true;

      const tgUser = app.initDataUnsafe?.user;
      const isTgClient = detectIsTelegramClient();

      if (tgUser && tgUser.id) {
        const enrichedTgUser: TelegramUser = {
          ...tgUser,
          photo_url:
            tgUser.photo_url ||
            `/api/player/avatar?telegram_id=${tgUser.id}`,
        };
        setUser(enrichedTgUser);
        setIsTelegramVerified(true);
        isVerifiedRef.current = true;
        setIsTelegramClient(true);
        try {
          localStorage.setItem("shi_tg_user_cache", JSON.stringify(enrichedTgUser));
        } catch {}
        syncWithDatabase(scoreRef.current, spendRef.current, true);
      }

      if (isLocalhostEnvironment(window.location.hostname)) {
        // Local test: skip remote HMAC validation on localhost
        return;
      }

      // Background cryptographic validation if hash signature is present
      const rawInitData =
        (typeof app.initData === "string" && app.initData.trim()) ||
        (typeof window !== "undefined" && window.location.hash.includes("tgWebAppData=")
          ? window.location.hash.split("tgWebAppData=")[1]?.split("&")[0] || ""
          : "");

      const decodedInitData = decodeURIComponent(rawInitData);

      if (decodedInitData.includes("hash=")) {
        fetch("/api/auth/validate-telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: decodedInitData }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.valid && data.user) {
              const enrichedValidatedUser: TelegramUser = {
                ...data.user,
                photo_url:
                  data.user.photo_url ||
                  `/api/player/avatar?telegram_id=${data.user.id}`,
              };
              setUser(enrichedValidatedUser);
              setIsTelegramVerified(true);
              isVerifiedRef.current = true;
              setIsTelegramClient(true);
              try {
                localStorage.setItem("shi_tg_user_cache", JSON.stringify(enrichedValidatedUser));
              } catch {}
              syncWithDatabase(scoreRef.current, spendRef.current, true);
            } else if (!tgUser?.id) {
              // Only reject if there is NO legitimate Telegram user
              setUser(null);
              setIsTelegramVerified(false);
              isVerifiedRef.current = false;
              setIsTelegramClient(false);
            }
          })
          .catch(() => {});
      } else if (!tgUser?.id) {
        // External browser: check if valid Telegram account was previously synced
        try {
          const cachedUserStr = localStorage.getItem("shi_tg_user_cache");
          if (cachedUserStr) {
            const cachedUser = JSON.parse(cachedUserStr);
            if (cachedUser?.id && typeof cachedUser.id === "number" && cachedUser.id > 0) {
              setUser(cachedUser);
              setIsTelegramVerified(true);
              isVerifiedRef.current = true;
              return;
            }
          }
        } catch {}

        // Not synced yet: gate session until Telegram account is linked
        setUser(null);
        setIsTelegramVerified(false);
        isVerifiedRef.current = false;
        setIsTelegramClient(false);
      }
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
      }
    }, 20);

    return () => clearInterval(interval);
  }, [syncWithDatabase]);





  const handleAddScore = useCallback((amount: number) => {
    setScore((prev) => prev + amount);
  }, []);

  const handleAddUsd = useCallback((amount: number) => {
    setUsdBalance((prev) => Number((prev + amount).toFixed(2)));
  }, []);

  const handleAddKhr = useCallback((amount: number) => {
    setKhrBalance((prev) => Math.max(0, Math.floor(prev + amount)));
  }, []);

  const handleTabChange = (tab: GameTab) => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}
    syncWithDatabase(scoreRef.current, spendRef.current, true);
    setActiveTab(tab);
  };

  const handleCategorySelect = (cat: NavCategory) => {
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
    setActiveCategory(cat);
  };

  const handleExecuteTopUp = () => {
    setUsdBalance((prev) => Number((prev + topUpAmount).toFixed(2)));
    setTopUpSuccess(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setTimeout(() => {
      setTopUpSuccess(false);
      setActiveTopUpScreen(false);
    }, 1500);
  };

  // Prevent hydration mismatch: render clean blank frame until mounted
  if (!isMounted) {
    return <main className="min-h-screen bg-white" />;
  }

  // Account / Login Gate: User must have an account or log in first to access the UI
  if (!user) {
    return (
      <AccountAuthView
        onLogin={(authenticatedUser) => {
          setUser(authenticatedUser);
          setIsTelegramVerified(true);
          isVerifiedRef.current = true;
          try {
            localStorage.setItem("shi_tg_user_cache", JSON.stringify(authenticatedUser));
          } catch {}
          syncWithDatabase(scoreRef.current, spendRef.current, true);
        }}
        tgApp={tgApp}
      />
    );
  }



  return (
    <div className="min-h-dvh flex flex-col justify-between app-bg-white text-slate-900 select-none overflow-x-hidden font-body relative">
      {/* App Background on mobile: strictly background.svg, zero banknote background behind app */}
      <div className="fixed inset-0 bg-app-background opacity-[0.08] pointer-events-none z-0" />

      {/* Sticky Global Top Navigation Bar with pt-[60px] - ALWAYS displayed anywhere */}
      <TopBrandNavBar
        showBalances={showBalances}
        onToggleBalances={() => setShowBalances(!showBalances)}
        onOpenProfile={() => {
          setProfileSubTab("profile");
          handleTabChange("profile");
        }}
        onOpenNotifications={() => {
          try {
            tgApp?.HapticFeedback?.notificationOccurred("warning");
          } catch {}
        }}
        user={user}
        tgApp={tgApp}
      />

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
                  Select a simulated USD credit package to instantly boost your vault balance and mint WEI Coin.
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
                      +{amt * 100} WEI COIN
                    </span>
                  </button>
                ))}
              </div>

              {topUpSuccess && (
                <div className="p-3 rounded-full bg-emerald-50 border border-emerald-200 text-[#16a34a] text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
                  <Check size={18} className="w-4 h-4" />
                  <span>Successfully added +${topUpAmount}.00 (+{topUpAmount * 100} WEI COIN) to Vault!</span>
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
            </div>
          </div>
        ) : (
          <>
            {(activeTab === "wallet" || !["earn", "tasks", "leaderboard", "rank", "profile"].includes(activeTab)) && (
              <TapGameView
                score={score}
                usdBalance={usdBalance}
                khrBalance={khrBalance}
                spendSeconds={spendSeconds}
                tapPower={tapPower}
                showBalances={showBalances}
                onToggleBalances={() => setShowBalances(!showBalances)}
                onAddScore={handleAddScore}
                onAddUsd={handleAddUsd}
                onAddKhr={handleAddKhr}
                onSelectCategory={handleCategorySelect}
                onGoToSwap={() => {
                  setProfileSubTab("swap");
                  handleTabChange("profile");
                }}
                onGoToEarn={() => handleTabChange("earn")}
                onGoToSettings={() => {
                  setProfileSubTab("settings");
                  handleTabChange("profile");
                }}
                user={user}
                tgApp={tgApp}
              />
            )}

            {(activeTab === "earn" || (activeTab as string) === "tasks") && (
              <EarnTasksView
                score={score}
                user={user}
                tgApp={tgApp}
                onAddScore={handleAddScore}
                tapPower={tapPower}
                passiveRate={passiveRate}
              />
            )}

            {(activeTab === "leaderboard" || (activeTab as string) === "rank") && (
              <LeaderboardView
                userScore={score}
                userSpendSeconds={spendSeconds}
                user={user}
              />
            )}

            {activeTab === "profile" && (
              <GameProfileView
                user={user}
                tgApp={tgApp}
                score={score}
                usdBalance={usdBalance}
                khrBalance={khrBalance}
                spendSeconds={spendSeconds}
                tapPower={tapPower}
                passiveRate={passiveRate}
                initialSubTab={profileSubTab}
                onSetScore={(newScore) => setScore(newScore)}
                onUpdateBalances={(newWei, newUsd, newKhr) => {
                  setScore(newWei);
                  setUsdBalance(newUsd);
                  setKhrBalance(newKhr);
                }}
                onBack={() => handleTabChange("wallet")}
                onLogout={() => {
                  setUser(null);
                  setIsTelegramVerified(false);
                  isVerifiedRef.current = false;
                  try {
                    localStorage.removeItem("shi_tg_user_cache");
                  } catch {}
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Dock with dynamic hide/show on scroll */}
      <GameDock
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        user={user}
        isVisible={isDockVisible}
      />
    </div>
  );
}
