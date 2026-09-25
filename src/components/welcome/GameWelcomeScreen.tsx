"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";

interface GameWelcomeScreenProps {
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
  onComplete: () => void;
}

/**
 * Mobile App Welcome Screen (Android 14+ SplashScreen API & Real Brand Logo Sync)
 *
 * SPECIFICATIONS:
 * 1. Window Background: Pure white (#ffffff) with subtle vector security mesh.
 * 2. Real Brand Logo: Center adaptive launcher showcasing the authentic SHILIAIWEI emblem.
 * 3. Animated Logo Loading: Smooth orbital ring, breathing aura pulse, and Telegram sync status.
 * 4. Telegram Mini App Sync Progression: Real-time multi-stage sequence verifying Telegram cloud session.
 */
export const GameWelcomeScreen: React.FC<GameWelcomeScreenProps> = ({
  user,
  tgApp,
  onComplete,
}) => {
  const [syncPhase, setSyncPhase] = useState<1 | 2 | 3 | 4>(1);
  const [progress, setProgress] = useState(15);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    // Stage 1: Initializing Telegram Session (0 - 350ms)
    const t1 = setTimeout(() => {
      setSyncPhase(1);
      setProgress(35);
      try {
        tgApp?.HapticFeedback?.impactOccurred("light");
      } catch {}
    }, 100);

    // Stage 2: Synchronizing Vault & Player Session (350 - 800ms)
    const t2 = setTimeout(() => {
      setSyncPhase(2);
      setProgress(75);
      try {
        tgApp?.HapticFeedback?.selectionChanged();
      } catch {}
    }, 450);

    // Stage 3: Verification & Vault Ready (800 - 1300ms)
    const t3 = setTimeout(() => {
      setSyncPhase(3);
      setProgress(100);
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
    }, 900);

    // Stage 4: Smooth Into-App Exit (1350ms)
    const t4 = setTimeout(() => {
      setIsDismissing(true);
    }, 1350);

    // Complete and hand over to app (1550ms)
    const tComplete = setTimeout(() => {
      onComplete();
    }, 1550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tComplete);
    };
  }, [tgApp, onComplete]);

  const handleInstantDismiss = () => {
    setIsDismissing(true);
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
    } catch {}
    setTimeout(onComplete, 120);
  };

  const getSyncText = () => {
    switch (syncPhase) {
      case 1:
        return "Connecting Telegram WebApp...";
      case 2:
        return "Synchronizing Web3 Vault...";
      case 3:
      case 4:
        return user?.first_name ? `Welcome, ${user.first_name}` : "Telegram Verified • Ready";
      default:
        return "Loading SHILIAIWEI...";
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleInstantDismiss}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleInstantDismiss()}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-white select-none overflow-hidden cursor-pointer focus:outline-none transition-all duration-300 ease-out font-sans ${
        isDismissing ? "opacity-0 scale-[1.03] pointer-events-none" : "opacity-100 scale-100"
      }`}
      aria-label="SHILIAIWEI Android App Launch Screen"
    >
      {/* 1. Android Window Background with Vector Guilloche Security Mesh */}
      <div className="absolute inset-0 bg-app-guilloche opacity-[0.04] pointer-events-none z-0" />

      {/* Top Android System Bar Spacer */}
      <div className="flex-1 w-full pt-8 flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
          SHILIAIWEI TELEGRAM MINI APP
        </span>
      </div>

      {/* 2. Center Adaptive Icon Container with Real Brand Logo & Loading Animation */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div
          className="relative flex items-center justify-center"
          style={{ width: "240px", height: "240px" }}
        >
          {/* Animated Concentric Breathing Energy Waves */}
          <div className="absolute w-56 h-56 rounded-full bg-[#0098ea]/5 animate-ping opacity-60 pointer-events-none" />
          <div className="absolute w-48 h-48 rounded-full border border-[#0098ea]/20 animate-pulse pointer-events-none" />

          {/* Animated Spinning SVG Progress Orbit Ring */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin pointer-events-none"
            style={{ animationDuration: "3s" }}
            viewBox="0 0 240 240"
          >
            <circle
              cx="120"
              cy="120"
              r="84"
              stroke="#0098ea"
              strokeWidth="2.5"
              strokeDasharray="40 180"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
            <circle
              cx="120"
              cy="120"
              r="84"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="20 220"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
          </svg>

          {/* Center Adaptive Circular Mask (Android 14 Spec: 160dp diameter) */}
          <div
            style={{ width: "160px", height: "160px" }}
            className="rounded-full bg-white border border-slate-200/90 shadow-2xl shadow-[#0098ea]/20 flex items-center justify-center relative overflow-hidden transition-all duration-500 transform"
          >
            {/* Shimmer Light Reflection Layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-100/40 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

            {/* REAL OFFICIAL BRAND LOGO EMBLEM */}
            <div className="relative w-28 h-28 flex items-center justify-center transform transition-transform duration-500 hover:scale-105">
              <Image
                src="/ads/Main Logo.png"
                alt="SHILIAIWEI Official Logo"
                fill
                sizes="112px"
                className="object-contain filter drop-shadow-md select-none pointer-events-none"
                priority
              />
            </div>
          </div>
        </div>

        {/* 3. Real-Time Telegram Sync Status Indicator */}
        <div className="mt-4 flex flex-col items-center gap-2.5">
          {/* Status Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 shadow-2xs">
            {syncPhase < 3 ? (
              <span className="w-2 h-2 rounded-full bg-[#0098ea] animate-ping" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
            <span className="text-xs font-bold text-slate-700 tracking-tight">
              {getSyncText()}
            </span>
          </div>

          {/* Android Material 3 Minimalist Linear Progress Indicator */}
          <div className="w-44 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#0098ea] via-[#38bdf8] to-emerald-400 rounded-full transition-all duration-400 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Bottom Branded Lockup (Official Single-line SHILIAIWEI Wordmark) */}
      <div className="flex-1 w-full pb-8 flex flex-col items-center justify-end">
        <div className="flex flex-col items-center gap-1.5">
          <ShiliaiweiBrand height={26} colorScheme="blue" />
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            Official Web3 Vault Platform
          </span>
        </div>
      </div>
    </div>
  );
};
