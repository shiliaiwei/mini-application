"use client";

import React, { useState } from "react";
import { TelegramWebApp } from "@/types/telegram";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { gameAudio } from "@/lib/audio/gameAudio";
import { MiniGameType } from "@/components/views/MiniGameFullView";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "@/components/icons/KeylineIcons";

interface WinGramPromoCardsProps {
  onAddScore: (amount: number) => void;
  onOpenDeposit?: () => void;
  onOpenTapVault?: () => void;
  onSelectGame?: (game: MiniGameType) => void;
  tgApp: TelegramWebApp | null;
}

export const WinGramPromoCards: React.FC<WinGramPromoCardsProps> = ({
  onAddScore,
  onOpenDeposit,
  onOpenTapVault,
  onSelectGame,
  tgApp,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [claimedHero, setClaimedHero] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleHeroClick = () => {
    gameAudio.playTap();
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
    } catch {}

    if (claimedHero) {
      if (onOpenTapVault) {
        onOpenTapVault();
      } else {
        showToast("Vault active!");
      }
      return;
    }

    onAddScore(1000);
    setClaimedHero(true);
    gameAudio.playVictory();
    showToast("Bonus Claimed! +1,000 PTS!");
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
  };

  const handleLaunchGame = (game: MiniGameType) => {
    gameAudio.playTap();
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

      {/* Main Promo & Mini Game Cards Grid (Left Hero Card + Right 2x2 Mini Game Blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* ======================================================== */}
        {/* 1. LARGE HERO PROMO CARD (Zero Icons, Zero Guide Text)   */}
        {/* ======================================================== */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleHeroClick}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleHeroClick()}
          className="sm:col-span-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-4 text-white shadow-xs flex flex-col justify-between min-h-[175px] sm:min-h-[238px] border border-blue-400/30 cursor-pointer active:scale-98 transition-all hover:shadow-md group"
        >
          {/* Logo Watermark Mesh Background */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
            style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
          />

          {/* Top: Brand Wordmark (Zero icon per mutual exclusivity rule) */}
          <div className="relative z-10">
            <ShiliaiweiBrand variant="wordmark" height={16} colorScheme="white" />
          </div>

          {/* Ordered Content: Short Title -> VAULT -> Range Points Score */}
          <div className="relative z-10 space-y-1 mt-auto">
            <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight text-white drop-shadow-xs whitespace-nowrap truncate block">
              Sports Bet
            </h2>
            <span className="text-[11px] font-black tracking-widest text-sky-200 uppercase block">
              VAULT
            </span>
            <span className="text-base sm:text-lg font-black text-yellow-300 tracking-tight block">
              500 - 1,000 PTS
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. 2x2 MINI GAME BLOCKS (Ordered Text-Only, Zero Icons)   */}
        {/* ======================================================== */}
        <div className="sm:col-span-6 grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* Card 1: Daily Spin */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("wheel")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("wheel")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[115px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Top: Brand Wordmark */}
            <div className="relative z-10">
              <ShiliaiweiBrand variant="wordmark" height={13} colorScheme="white" />
            </div>

            {/* Ordered Content: Short Title -> GAME -> Range Points Score */}
            <div className="relative z-10 space-y-0.5 mt-auto">
              <h3 className="text-xs sm:text-sm font-black tracking-tight text-white drop-shadow-xs whitespace-nowrap truncate block">
                Daily Spin
              </h3>
              <span className="text-[10px] font-black tracking-widest text-sky-200 uppercase block">
                GAME
              </span>
              <span className="text-xs sm:text-sm font-black text-yellow-300 tracking-tight block">
                50 - 500 PTS
              </span>
            </div>
          </div>

          {/* Card 2: Word Flash */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("word-flash")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("word-flash")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[115px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Top: Brand Wordmark */}
            <div className="relative z-10">
              <ShiliaiweiBrand variant="wordmark" height={13} colorScheme="white" />
            </div>

            {/* Ordered Content: Short Title -> GAME -> Range Points Score */}
            <div className="relative z-10 space-y-0.5 mt-auto">
              <h3 className="text-xs sm:text-sm font-black tracking-tight text-white drop-shadow-xs whitespace-nowrap truncate block">
                Word Flash
              </h3>
              <span className="text-[10px] font-black tracking-widest text-sky-200 uppercase block">
                GAME
              </span>
              <span className="text-xs sm:text-sm font-black text-yellow-300 tracking-tight block">
                2 - 8 PTS
              </span>
            </div>
          </div>

          {/* Card 3: Guess Words */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("guess-faster")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("guess-faster")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[115px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Top: Brand Wordmark */}
            <div className="relative z-10">
              <ShiliaiweiBrand variant="wordmark" height={13} colorScheme="white" />
            </div>

            {/* Ordered Content: Short Title -> GAME -> Range Points Score */}
            <div className="relative z-10 space-y-0.5 mt-auto">
              <h3 className="text-xs sm:text-sm font-black tracking-tight text-white drop-shadow-xs whitespace-nowrap truncate block">
                Guess Words
              </h3>
              <span className="text-[10px] font-black tracking-widest text-sky-200 uppercase block">
                GAME
              </span>
              <span className="text-xs sm:text-sm font-black text-yellow-300 tracking-tight block">
                5 - 15 PTS
              </span>
            </div>
          </div>

          {/* Card 4: Row 5 */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("row5")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("row5")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[115px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Top: Brand Wordmark */}
            <div className="relative z-10">
              <ShiliaiweiBrand variant="wordmark" height={13} colorScheme="white" />
            </div>

            {/* Ordered Content: Short Title -> GAME -> Range Points Score */}
            <div className="relative z-10 space-y-0.5 mt-auto">
              <h3 className="text-xs sm:text-sm font-black tracking-tight text-white drop-shadow-xs whitespace-nowrap truncate block">
                Row 5
              </h3>
              <span className="text-[10px] font-black tracking-widest text-sky-200 uppercase block">
                GAME
              </span>
              <span className="text-xs sm:text-sm font-black text-yellow-300 tracking-tight block">
                15 - 25 PTS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
