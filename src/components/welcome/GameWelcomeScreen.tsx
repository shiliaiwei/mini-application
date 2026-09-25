"use client";

import React, { useEffect, useState, useCallback } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  Send,
  ShieldCheck,
  Coins,
  Zap,
  Check,
  ChevronRight,
} from "@/components/icons/KeylineIcons";

interface GameWelcomeScreenProps {
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
  onComplete: () => void;
}

/**
 * Standard Telegram Mini App Welcome Screen
 *
 * Designed according to official Telegram Mini App guidelines:
 * - Solid Telegram blue (#0098ea) accent and clean white canvas (no gradients)
 * - Telegram user verification summary
 * - Key feature overview cells in standard Telegram list format
 * - Native Telegram MainButton and prominent in-screen Start button
 */
export const GameWelcomeScreen: React.FC<GameWelcomeScreenProps> = ({
  user,
  tgApp,
  onComplete,
}) => {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleStart = useCallback(() => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
    } catch {}
    setIsDismissing(true);
    setTimeout(() => {
      onComplete();
    }, 150);
  }, [tgApp, onComplete]);

  // Integrate with Telegram WebApp native MainButton
  useEffect(() => {
    if (tgApp?.MainButton) {
      try {
        if (typeof (tgApp.MainButton as unknown as { setText?: (t: string) => void }).setText === "function") {
          (tgApp.MainButton as unknown as { setText: (t: string) => void }).setText("START MINI APP");
        } else {
          tgApp.MainButton.text = "START MINI APP";
        }
        tgApp.MainButton.color = "#0098ea";
        tgApp.MainButton.textColor = "#ffffff";
        tgApp.MainButton.show();
        tgApp.MainButton.onClick(handleStart);
      } catch {}

      return () => {
        try {
          tgApp.MainButton.offClick(handleStart);
          tgApp.MainButton.hide();
        } catch {}
      };
    }
  }, [tgApp, handleStart]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between bg-white text-slate-900 max-w-md mx-auto w-full select-none font-sans overflow-y-auto px-6 py-8 transition-opacity duration-200 ease-out ${
        isDismissing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Top Telegram Header Bar */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span className="text-[#0098ea] font-bold">@srievibot</span>
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#0098ea] text-white">
            <Check size={10} className="w-2.5 h-2.5" />
          </span>
        </div>
        <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          Mini App
        </span>
      </div>

      {/* Center Welcome Hero */}
      <div className="my-auto py-6 flex flex-col items-center text-center">
        {/* Telegram Paper Plane Icon */}
        <div className="w-20 h-20 rounded-full bg-[#0098ea] text-white flex items-center justify-center shadow-sm mb-5">
          <Send size={38} className="w-10 h-10 translate-x-[-1px] translate-y-[1px]" />
        </div>

        {/* Welcome Title */}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5">
          Welcome to SHILIAIWEI
        </h1>

        {/* Subtitle / User Welcome */}
        <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
          {user?.first_name
            ? `Hello, ${user.first_name}. Your Telegram session is ready.`
            : "Official Telegram Mini App for @srievibot."}
        </p>

        {/* Standard Telegram Feature Highlights */}
        <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-100 overflow-hidden text-left shadow-2xs">
          {/* Item 1: Telegram Identity */}
          <div className="p-3.5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0098ea] shrink-0">
              <ShieldCheck size={20} className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800">
                Telegram Verified
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {user?.username ? `@${user.username}` : "Connected via @srievibot"}
              </div>
            </div>
          </div>

          {/* Item 2: Play & Earn */}
          <div className="p-3.5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#16a34a] shrink-0">
              <Coins size={20} className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800">
                Play & Earn PTS
              </div>
              <div className="text-[11px] text-slate-500">
                Tap, complete tasks, and climb the leaderboard
              </div>
            </div>
          </div>

          {/* Item 3: Real-Time Sync */}
          <div className="p-3.5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0098ea] shrink-0">
              <Zap size={20} className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800">
                Instant Cloud Sync
              </div>
              <div className="text-[11px] text-slate-500">
                Scores and rewards update directly in Telegram
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="w-full pt-4 space-y-3">
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#0098ea] hover:bg-[#0088cc] active:scale-[0.99] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <span>Start Mini App</span>
          <ChevronRight size={18} className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-[11px] text-slate-400 font-medium">
            @srievibot • Official Telegram Mini App
          </span>
        </div>
      </div>
    </div>
  );
};
