"use client";

import React, { useState } from "react";
import { TelegramWebApp } from "@/types/telegram";
import { StatsGraphCard } from "@/components/promo/StatsGraphCard";
import { InstitutionalAdCard } from "@/components/promo/InstitutionalAdCard";
import { MiniGameType } from "@/components/views/MiniGameFullView";

interface WinGramPromoCardsProps {
  score?: number;
  totalPlayed?: number;
  onAddScore?: (amount: number) => void;
  onOpenDeposit?: () => void;
  onOpenTapVault?: () => void;
  onOpenStats?: () => void;
  onOpenAdDetail?: (partnerId: string) => void;
  onSelectGame?: (game: MiniGameType) => void;
  tgApp: TelegramWebApp | null;
}

/**
 * Scattered / Repeating Watermark Pattern of SHILIAI [WEI] Logo
 * Diagonal repeated pattern across the background of feature cards
 */
const CardWatermarkPattern: React.FC<{ patternId: string }> = ({ patternId }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.09]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id={patternId}
        width="160"
        height="80"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-18)"
      >
        {/* SHILIAI in Bold Text */}
        <text
          x="5"
          y="28"
          fill="white"
          fontSize="16"
          fontWeight="900"
          letterSpacing="-0.02em"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          SHILIAI
        </text>
        {/* [WEI] in Rounded Rectangle Badge */}
        <rect x="76" y="13" width="34" height="20" rx="5" fill="white" />
        <text
          x="93"
          y="28"
          textAnchor="middle"
          fill="#0077b5"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          WEI
        </text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
  </svg>
);

export const WinGramPromoCards: React.FC<WinGramPromoCardsProps> = ({
  score = 0,
  onOpenTapVault,
  onOpenStats,
  onOpenAdDetail,
  onSelectGame,
  tgApp,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleHeroClick = () => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
    } catch {}

    if (onOpenStats) {
      onOpenStats();
    } else if (onOpenTapVault) {
      onOpenTapVault();
    }
  };

  const handleLaunchGame = (game: MiniGameType) => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
    } catch {}
    if (onSelectGame) {
      onSelectGame(game);
    }
  };

  return (
    <div className="relative select-none font-sans w-full">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#0098ea] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold border border-white/40 flex items-center justify-center animate-fadeIn max-w-[90vw] truncate">
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Main Cards Grid (Left Hero Card + Right 2x2 Mini Game Blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* ======================================================== */}
        {/* 1. HERO CARD — Highlight Institutional Ad (Loop in /ads) */}
        {/* ======================================================== */}
        <InstitutionalAdCard
          onOpenDetail={(partnerId) => {
            try {
              tgApp?.HapticFeedback?.impactOccurred("medium");
            } catch {}
            if (onOpenAdDetail) {
              onOpenAdDetail(partnerId);
            }
          }}
          onOpenStats={onOpenStats}
        />

        {/* ======================================================== */}
        {/* 2. 2x2 MINI GAME BLOCKS (Title top, Stats number bottom)  */}
        {/* ======================================================== */}
        <div className="sm:col-span-6 grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* Card 1: Daily Spin */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("wheel")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("wheel")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[115px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group text-left"
          >
            {/* Scattered / Repeating SHILIAI [WEI] Logo Watermark */}
            <CardWatermarkPattern patternId="wm-spin" />

            {/* Top: Title Page (Replaces top logo) */}
            <div className="relative z-10 text-left">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap truncate block">
                Daily Spin
              </h3>
            </div>

            {/* Bottom Left: Stats number without signs */}
            <div className="relative z-10 text-left mt-auto">
              <span className="text-lg sm:text-xl font-black text-yellow-300 font-mono block leading-none">
                500
              </span>
            </div>
          </div>

          {/* Card 2: Word Flash */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("word-flash")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("word-flash")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[115px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group text-left"
          >
            {/* Scattered / Repeating SHILIAI [WEI] Logo Watermark */}
            <CardWatermarkPattern patternId="wm-word" />

            {/* Top: Title Page (Replaces top logo) */}
            <div className="relative z-10 text-left">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap truncate block">
                Word Flash
              </h3>
            </div>

            {/* Bottom Left: Stats number without signs */}
            <div className="relative z-10 text-left mt-auto">
              <span className="text-lg sm:text-xl font-black text-yellow-300 font-mono block leading-none">
                8
              </span>
            </div>
          </div>

          {/* Card 3: Guess Words */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("guess-faster")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("guess-faster")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[115px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group text-left"
          >
            {/* Scattered / Repeating SHILIAI [WEI] Logo Watermark */}
            <CardWatermarkPattern patternId="wm-guess" />

            {/* Top: Title Page (Replaces top logo) */}
            <div className="relative z-10 text-left">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap truncate block">
                Guess Words
              </h3>
            </div>

            {/* Bottom Left: Stats number without signs */}
            <div className="relative z-10 text-left mt-auto">
              <span className="text-lg sm:text-xl font-black text-yellow-300 font-mono block leading-none">
                15
              </span>
            </div>
          </div>

          {/* Card 4: Row 5 */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("row5")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("row5")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[115px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group text-left"
          >
            {/* Scattered / Repeating SHILIAI [WEI] Logo Watermark */}
            <CardWatermarkPattern patternId="wm-row5" />

            {/* Top: Title Page (Replaces top logo) */}
            <div className="relative z-10 text-left">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap truncate block">
                Row 5
              </h3>
            </div>

            {/* Bottom Left: Stats number without signs */}
            <div className="relative z-10 text-left mt-auto">
              <span className="text-lg sm:text-xl font-black text-yellow-300 font-mono block leading-none">
                25
              </span>
            </div>
          </div>
          {/* Card 5: Number Match */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("number-match")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("number-match")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[115px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group text-left"
          >
            <CardWatermarkPattern patternId="wm-nmatch" />
            <div className="relative z-10 text-left">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap truncate block">
                Num Match
              </h3>
            </div>
            <div className="relative z-10 text-left mt-auto">
              <span className="text-lg sm:text-xl font-black text-yellow-300 font-mono block leading-none">
                50
              </span>
            </div>
          </div>

          {/* Card 6: Flip Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("flip-card")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("flip-card")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[115px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group text-left"
          >
            <CardWatermarkPattern patternId="wm-flip" />
            <div className="relative z-10 text-left">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap truncate block">
                Flip Card
              </h3>
            </div>
            <div className="relative z-10 text-left mt-auto">
              <span className="text-lg sm:text-xl font-black text-yellow-300 font-mono block leading-none">
                60
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
