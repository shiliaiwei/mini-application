"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { GameDock, GameTab } from "@/components/dock/GameDock";
import { TapGameView } from "@/components/views/TapGameView";
import { LeaderboardView } from "@/components/views/LeaderboardView";
import { GameProfileView } from "@/components/views/GameProfileView";
import { GameWelcomeScreen } from "@/components/welcome/GameWelcomeScreen";
import { TelegramGateScreen } from "@/components/common/TelegramGateScreen";
import { RefreshCw, X, Gamepad2 } from "lucide-react";

export default function MiniAppPage() {
  const [tgApp, setTgApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTelegramMobile, setIsTelegramMobile] = useState(true);
  const [bypassGate, setBypassGate] = useState(false);
  const [activeTab, setActiveTab] = useState<GameTab>("game");

  // Game Mechanics State
  const [score, setScore] = useState(0);
  const [spendSeconds, setSpendSeconds] = useState(0);
  const [energy, setEnergy] = useState(1000);
  const maxEnergy = 1000;

  // Track active time spent tapping
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

  // Load saved score from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScore = localStorage.getItem("lime_game_score");
      if (savedScore) {
        setScore(parseInt(savedScore, 10) || 0);
      }
      const savedTime = localStorage.getItem("lime_game_time");
      if (savedTime) {
        setSpendSeconds(parseInt(savedTime, 10) || 0);
      }
    }
  }, []);

  // Save score periodically
  useEffect(() => {
    if (typeof window !== "undefined" && score > 0) {
      localStorage.setItem("lime_game_score", String(score));
      localStorage.setItem("lime_game_time", String(spendSeconds));
    }
  }, [score, spendSeconds]);

  // Initialize Telegram WebApp & Auto-Sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      const app = window.Telegram?.WebApp;
      if (app && app.initData) {
        try {
          app.ready();
          app.expand();
          if (app.enableClosingConfirmation) {
            app.enableClosingConfirmation();
          }
        } catch (e) {
          console.warn("Telegram WebApp init error:", e);
        }

        setTgApp(app);
        setIsTelegramMobile(true);

        const tgUser = app.initDataUnsafe?.user;
        if (tgUser) {
          setUser(tgUser);
        }
      } else {
        // Outside Telegram
        setIsTelegramMobile(false);
      }

      setIsReady(true);
    }
  }, []);

  const handleTap = useCallback(() => {
    setScore((prev) => prev + 1);
    setEnergy((prev) => Math.max(0, prev - 1));
  }, []);

  const handleTabChange = (tab: GameTab) => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}
    setActiveTab(tab);
  };

  const handleClose = () => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
      tgApp?.close();
    } catch {}
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#080c0a] flex items-center justify-center text-lime-400 font-mono text-xs">
        <span className="animate-game-pulse uppercase">LAUNCHING GAME...</span>
      </div>
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
    <main className="min-h-dvh max-w-md mx-auto w-full flex flex-col justify-between p-4 bg-[#080c0a] text-white select-none overflow-x-hidden relative font-mono">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-2.5 pt-1 border-b border-[#233827]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#16211b] border border-lime-400 flex items-center justify-center text-lime-400">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block uppercase tracking-wide">
              {activeTab === "game" && "LIME TAP GAME"}
              {activeTab === "leaderboard" && "GLOBAL RANKINGS"}
              {activeTab === "profile" && "PLAYER PROFILE"}
            </span>
            <span className="text-[10px] text-lime-400 block uppercase">
              1 TAP = 1 POINT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowWelcome(true)}
            className="p-1.5 rounded-lg bg-[#111914] border border-[#233827] text-neutral-400 hover:text-white"
            title="Restart Session"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-[#111914] border border-[#233827] text-neutral-400 hover:text-white"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main SPA View Switcher */}
      <div className="flex-1 mt-2">
        {activeTab === "game" && (
          <TapGameView
            score={score}
            onTap={handleTap}
            energy={energy}
            maxEnergy={maxEnergy}
            spendSeconds={spendSeconds}
            user={user}
            tgApp={tgApp}
          />
        )}

        {activeTab === "leaderboard" && (
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
            spendSeconds={spendSeconds}
          />
        )}
      </div>

      {/* Floating Bottom Dock Menu */}
      <GameDock
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        user={user}
      />
    </main>
  );
}
