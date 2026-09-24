"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ShieldCheck, Send, Sparkles } from "lucide-react";

interface LiquidWelcomeScreenProps {
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
  onComplete: () => void;
}

export const LiquidWelcomeScreen: React.FC<LiquidWelcomeScreenProps> = ({
  user,
  tgApp,
  onComplete,
}) => {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // Stage 1: Handshake
    const t1 = setTimeout(() => {
      setSynced(true);
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
    }, 700);

    // Stage 2: Smooth auto-open
    const t2 = setTimeout(() => {
      onComplete();
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [tgApp, onComplete]);

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "Telegram User";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-[#0c1017] text-slate-100 max-w-md mx-auto w-full select-none overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <span className="font-semibold text-sky-400">@srievibot</span>
        <span className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
          Liquid Glass v2.0
        </span>
      </div>

      {/* Center Welcome Container */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6 text-center">
        {/* Glowing Squircle Avatar / Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl overflow-hidden liquid-glass-card border-2 border-white/20 shadow-2xl flex items-center justify-center animate-soft-pulse">
            {user?.photo_url ? (
              <Image
                src={user.photo_url}
                alt={fullName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white">
                <Send className="w-10 h-10 -rotate-12 translate-x-0.5" />
              </div>
            )}
          </div>

          {/* Sync complete checkmark */}
          {synced && (
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-[#0c1017] animate-bounce">
              <ShieldCheck className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {synced ? `Welcome, ${fullName}` : "Syncing Telegram..."}
          </h1>
          <p className="text-xs text-slate-400">
            {synced
              ? "Telegram Owner verified • Opening Mini App"
              : "Authenticating session with @srievibot..."}
          </p>
        </div>

        {/* Liquid Glass Status Pill */}
        <div className="liquid-glass-card rounded-2xl py-2 px-4 flex items-center gap-2 text-xs text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              synced ? "bg-emerald-400" : "bg-sky-400 animate-ping"
            }`}
          />
          <span className="font-mono text-[11px]">
            {synced ? "SEAMLESS_AUTH_CONFIRMED" : "CONNECTING_WEBAPP_CORE"}
          </span>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pb-4">
        <button
          type="button"
          onClick={onComplete}
          className="w-full py-3.5 px-4 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-sm font-semibold active:scale-98 transition-all"
        >
          {synced ? "Opening App..." : "Open Immediately"}
        </button>
      </div>
    </div>
  );
};
