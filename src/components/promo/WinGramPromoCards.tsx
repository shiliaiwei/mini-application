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
  const [heroSlide, setHeroSlide] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [claimedHero, setClaimedHero] = useState(false);

  const heroSlides = [
    {
      title: "Sports Free Bet $1,000",
      reward: 1000,
      badge: "HOT PROMO",
    },
    {
      title: "Vault Bonus up to $2,500",
      reward: 2500,
      badge: "VIP VAULT",
    },
    {
      title: "Daily Yield up to 15%",
      reward: 1500,
      badge: "EXCLUSIVE",
    },
  ];

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
        showToast("Vault is already active!");
      }
      return;
    }

    const currentReward = heroSlides[heroSlide].reward;
    onAddScore(currentReward);
    setClaimedHero(true);
    gameAudio.playVictory();
    showToast(`Bonus Claimed! +${currentReward} PTS added to vault!`);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    gameAudio.playClick();
    setHeroSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    gameAudio.playClick();
    setHeroSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
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
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#0098ea] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold border border-white/40 flex items-center gap-2 animate-fadeIn max-w-[90vw] truncate">
          <Sparkles size={16} className="text-yellow-300 flex-shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Main Promo & Mini Game Cards Grid (Left Hero Banner + Right 2x2 Mini Game Blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* ======================================================== */}
        {/* 1. LARGE HERO PROMO BANNER (Sports Free Bet / Vault Bonus) */}
        {/* ======================================================== */}
        <div
          onClick={handleHeroClick}
          className="sm:col-span-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-4 text-white shadow-xs flex flex-col justify-between min-h-[175px] sm:min-h-[195px] border border-blue-400/30 cursor-pointer active:scale-98 transition-all hover:shadow-md group"
        >
          {/* Logo Watermark Mesh Background */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
            style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
          />

          {/* Top Left: Brand Wordmark + Short Single-Line Title */}
          <div className="relative z-10 space-y-1 max-w-[210px] sm:max-w-[250px]">
            <ShiliaiweiBrand variant="wordmark" height={15} colorScheme="white" />
            <h2 className="text-lg sm:text-xl font-black leading-tight tracking-tight text-white drop-shadow-xs whitespace-nowrap truncate block">
              {heroSlides[heroSlide].title}
            </h2>
            <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider block whitespace-nowrap truncate">
              Vault Feature
            </span>
          </div>

          {/* 3D Mascot Character */}
          <div className="absolute right-0 sm:right-2 bottom-0 top-1 pointer-events-none flex items-center justify-end z-10">
            <svg
              viewBox="0 0 160 170"
              className="w-32 h-32 sm:w-38 sm:h-38 filter drop-shadow-xl"
            >
              <ellipse cx="80" cy="155" rx="55" ry="12" fill="#005580" opacity="0.6" />
              <ellipse cx="80" cy="154" rx="45" ry="8" fill="#00e5ff" opacity="0.3" />
              <rect x="58" y="115" width="8" height="28" rx="4" fill="#00334d" />
              <rect x="94" y="115" width="8" height="28" rx="4" fill="#00334d" />
              <path d="M48 138 Q56 136 68 140 L70 148 Q55 150 46 146 Z" fill="#ffffff" stroke="#0088cc" strokeWidth="2" />
              <path d="M46 142 Q52 140 64 142 L65 146 Q50 148 45 145 Z" fill="#0098ea" />
              <path d="M92 140 Q104 136 114 138 L116 146 Q106 150 90 148 Z" fill="#ffffff" stroke="#0088cc" strokeWidth="2" />
              <path d="M96 142 Q108 140 114 142 L115 145 Q106 148 94 146 Z" fill="#0098ea" />
              <polygon points="80,18 128,45 80,125 32,45" fill="url(#diamondGradBento)" stroke="#66d9ff" strokeWidth="2" />
              <polygon points="80,18 128,45 80,42" fill="#80e5ff" opacity="0.8" />
              <polygon points="80,18 32,45 80,42" fill="#33ccff" opacity="0.9" />
              <polygon points="80,42 128,45 80,125" fill="#0077b5" opacity="0.6" />
              <polygon points="80,42 32,45 80,125" fill="#0099e6" opacity="0.75" />
              <ellipse cx="68" cy="56" rx="9" ry="12" fill="#ffffff" />
              <ellipse cx="92" cy="56" rx="9" ry="12" fill="#ffffff" />
              <ellipse cx="70" cy="57" rx="5" ry="7" fill="#003366" />
              <ellipse cx="94" cy="57" rx="5" ry="7" fill="#003366" />
              <circle cx="72" cy="54" r="2.5" fill="#ffffff" />
              <circle cx="96" cy="54" r="2.5" fill="#ffffff" />
              <path d="M72 74 Q80 84 88 74" fill="#ff4081" stroke="#002233" strokeWidth="2" />
              <path d="M45 68 Q34 82 52 96" fill="none" stroke="#00334d" strokeWidth="7" strokeLinecap="round" />
              <circle cx="54" cy="98" r="9" fill="#ffffff" stroke="#00334d" strokeWidth="2" />
              <path d="M115 68 Q126 82 108 96" fill="none" stroke="#00334d" strokeWidth="7" strokeLinecap="round" />
              <circle cx="106" cy="98" r="9" fill="#ffffff" stroke="#00334d" strokeWidth="2" />
              <circle cx="80" cy="100" r="18" fill="#ffffff" stroke="#00334d" strokeWidth="2" />
              <path d="M68 94 Q80 100 80 118" fill="none" stroke="#e11d48" strokeWidth="3" />
              <path d="M92 94 Q80 100 80 118" fill="none" stroke="#2563eb" strokeWidth="3" />
              <circle cx="80" cy="100" r="6" fill="#16a34a" />
              <defs>
                <linearGradient id="diamondGradBento" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#66d9ff" />
                  <stop offset="50%" stopColor="#0098ea" />
                  <stop offset="100%" stopColor="#005580" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Bottom Bar: Clean Status Tag + Carousel Pagination */}
          <div className="relative z-20 flex items-center justify-between pt-3 mt-auto">
            <span className="text-[11px] font-bold text-sky-100/90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{claimedHero ? "Vault Active" : "Tap to Claim"}</span>
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Previous promo slide"
                className="w-7 h-7 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Next promo slide"
                className="w-7 h-7 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. 2x2 MINI GAME BLOCKS (Buttonless Tap to Full Page SPA) */}
        {/* ======================================================== */}
        <div className="sm:col-span-6 grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* Card 1: Daily Spin (Fortune Wheel) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("wheel")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("wheel")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[105px] sm:h-[110px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Brand + Mini Game Title: Short & Single Line */}
            <div className="relative z-10 space-y-0.5 max-w-[62%]">
              <div className="flex items-center gap-1 opacity-90">
                <ShiliaiweiBrand variant="mark" height={10} colorScheme="white" />
                <span className="text-[8px] font-black tracking-widest text-sky-200 uppercase">SHILIAIWEI</span>
              </div>
              <span className="text-[13px] sm:text-sm font-black tracking-tight block text-white drop-shadow-xs whitespace-nowrap truncate">
                Daily Spin
              </span>
              <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider block whitespace-nowrap truncate">
                Mini Game
              </span>
            </div>

            {/* 3D Wheel of Fortune Graphic */}
            <div className="absolute right-0 top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 filter drop-shadow-md">
                <circle cx="50" cy="50" r="44" fill="#ffd166" stroke="#f4a261" strokeWidth="3" />
                <path d="M50 50 L50 8 A42 42 0 0 1 80 20 Z" fill="#4361ee" />
                <path d="M50 50 L80 20 A42 42 0 0 1 92 50 Z" fill="#7209b7" />
                <path d="M50 50 L92 50 A42 42 0 0 1 80 80 Z" fill="#4cc9f0" />
                <path d="M50 50 L80 80 A42 42 0 0 1 50 92 Z" fill="#f72585" />
                <path d="M50 50 L50 92 A42 42 0 0 1 20 80 Z" fill="#4361ee" />
                <path d="M50 50 L20 80 A42 42 0 0 1 8 50 Z" fill="#7209b7" />
                <path d="M50 50 L8 50 A42 42 0 0 1 20 20 Z" fill="#4cc9f0" />
                <path d="M50 50 L20 20 A42 42 0 0 1 50 8 Z" fill="#f72585" />
                <circle cx="50" cy="50" r="14" fill="#ffffff" stroke="#f4a261" strokeWidth="2" />
                <circle cx="50" cy="50" r="8" fill="#ffd166" />
                <polygon points="50,4 45,14 55,14" fill="#e63946" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </div>

            {/* Bottom Status (No Button!) */}
            <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold text-sky-200/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="whitespace-nowrap">Tap to Play</span>
            </div>
          </div>

          {/* Card 2: Word Flash (Game 1) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("word-flash")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("word-flash")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[105px] sm:h-[110px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Brand + Mini Game Title: Short & Single Line */}
            <div className="relative z-10 space-y-0.5 max-w-[62%]">
              <div className="flex items-center gap-1 opacity-90">
                <ShiliaiweiBrand variant="mark" height={10} colorScheme="white" />
                <span className="text-[8px] font-black tracking-widest text-sky-200 uppercase">SHILIAIWEI</span>
              </div>
              <span className="text-[13px] sm:text-sm font-black tracking-tight block text-white drop-shadow-xs whitespace-nowrap truncate">
                Word Flash
              </span>
              <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider block whitespace-nowrap truncate">
                Mini Game
              </span>
            </div>

            {/* 3D Word Tile Blocks Graphic */}
            <div className="absolute right-1 top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 filter drop-shadow-md">
                <rect x="18" y="24" width="64" height="60" rx="8" fill="#ffffff" stroke="#005f99" strokeWidth="2" />
                <rect x="18" y="24" width="64" height="18" rx="6" fill="#0088cc" />
                <rect x="30" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                <rect x="64" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                <path d="M38 50 L64 50 L48 76 L40 76 L54 56 L38 56 Z" fill="#7c3aed" stroke="#5b21b6" strokeWidth="2" />
              </svg>
            </div>

            {/* Bottom Status (No Button!) */}
            <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold text-sky-200/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="whitespace-nowrap">Tap to Play</span>
            </div>
          </div>

          {/* Card 3: Guess Faster (Game 2) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("guess-faster")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("guess-faster")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[105px] sm:h-[110px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Brand + Mini Game Title: Short & Single Line */}
            <div className="relative z-10 space-y-0.5 max-w-[62%]">
              <div className="flex items-center gap-1 opacity-90">
                <ShiliaiweiBrand variant="mark" height={10} colorScheme="white" />
                <span className="text-[8px] font-black tracking-widest text-sky-200 uppercase">SHILIAIWEI</span>
              </div>
              <span className="text-[13px] sm:text-sm font-black tracking-tight block text-white drop-shadow-xs whitespace-nowrap truncate">
                Guess Faster
              </span>
              <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider block whitespace-nowrap truncate">
                Mini Game
              </span>
            </div>

            {/* 3D Clue Safe Vault Graphic */}
            <div className="absolute right-1 top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 filter drop-shadow-md">
                <rect x="18" y="24" width="64" height="60" rx="8" fill="#ffffff" stroke="#005f99" strokeWidth="2" />
                <rect x="18" y="24" width="64" height="18" rx="6" fill="#0088cc" />
                <rect x="30" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                <rect x="64" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                <circle cx="50" cy="58" r="16" fill="#ffd166" stroke="#d97706" strokeWidth="2" />
                <circle cx="50" cy="58" r="10" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
                <circle cx="50" cy="58" r="3" fill="#b45309" />
                <line x1="50" y1="52" x2="50" y2="48" stroke="#b45309" strokeWidth="2" />
                <line x1="50" y1="64" x2="50" y2="68" stroke="#b45309" strokeWidth="2" />
                <line x1="44" y1="58" x2="40" y2="58" stroke="#b45309" strokeWidth="2" />
                <line x1="56" y1="58" x2="60" y2="58" stroke="#b45309" strokeWidth="2" />
              </svg>
            </div>

            {/* Bottom Status (No Button!) */}
            <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold text-sky-200/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="whitespace-nowrap">Tap to Play</span>
            </div>
          </div>

          {/* Card 4: Row 5 Winner (Game 3) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleLaunchGame("row5")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLaunchGame("row5")}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between h-[105px] sm:h-[110px] border border-blue-400/30 cursor-pointer active:scale-95 transition-all hover:shadow-md group"
          >
            {/* Logo Watermark Background */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/backgrounds/cardbanknote.svg')" }}
            />

            {/* Brand + Mini Game Title: Short & Single Line */}
            <div className="relative z-10 space-y-0.5 max-w-[62%]">
              <div className="flex items-center gap-1 opacity-90">
                <ShiliaiweiBrand variant="mark" height={10} colorScheme="white" />
                <span className="text-[8px] font-black tracking-widest text-sky-200 uppercase">SHILIAIWEI</span>
              </div>
              <span className="text-[13px] sm:text-sm font-black tracking-tight block text-white drop-shadow-xs whitespace-nowrap truncate">
                Row 5 Winner
              </span>
              <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider block whitespace-nowrap truncate">
                Mini Game
              </span>
            </div>

            {/* 3D Magnet with Diamond Crystals Graphic */}
            <div className="absolute right-1 top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 filter drop-shadow-md">
                <path d="M40 30 C40 15, 75 15, 75 30 L75 60 C75 75, 40 75, 40 60 Z" fill="none" stroke="#f43f5e" strokeWidth="14" strokeLinecap="round" />
                <rect x="33" y="24" width="14" height="12" fill="#cbd5e1" rx="2" />
                <rect x="68" y="24" width="14" height="12" fill="#cbd5e1" rx="2" />
                <polygon points="58,22 64,28 58,40 52,28" fill="#0098ea" stroke="#ffffff" strokeWidth="1.5" />
                <polygon points="46,14 50,18 46,26 42,18" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                <polygon points="70,16 74,20 70,28 66,20" fill="#00e5ff" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </div>

            {/* Bottom Status (No Button!) */}
            <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold text-sky-200/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="whitespace-nowrap">Tap to Play</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
