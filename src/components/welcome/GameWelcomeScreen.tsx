"use client";

import React, { useEffect, useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";

interface GameWelcomeScreenProps {
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
  onComplete: () => void;
}

export const GameWelcomeScreen: React.FC<GameWelcomeScreenProps> = ({
  tgApp,
  onComplete,
}) => {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 380; // Instant high-speed opening

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round(20 + (elapsed / duration) * 80));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(onComplete, 40);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [tgApp, onComplete]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onComplete}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onComplete()}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 app-bg-white select-none overflow-hidden cursor-pointer focus:outline-none"
      aria-label="Loading SHILIAIWEI application"
    >
      {/* Vector Guilloche Banknote Security Mesh */}
      <div className="absolute inset-0 bg-app-guilloche opacity-[0.06] pointer-events-none z-0" />

      {/* Center Brand Showcase & Loading Animation - ONLY CENTER */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 relative z-10 max-w-xs w-full">
        {/* Animated Brand Logo Container with Concentric Pulse Aura */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-44 h-24 rounded-3xl border border-[#0098ea]/20 animate-ping pointer-events-none" />
          <div className="px-6 py-4 rounded-3xl bg-white border-2 border-[#0098ea] flex items-center justify-center shadow-lg relative overflow-hidden transition-transform duration-500 hover:scale-105">
            <ShiliaiweiBrand height={28} colorScheme="blue" />
          </div>
        </div>

        {/* Minimalist Center Loading Bar */}
        <div className="w-44 h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-[#0098ea] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
