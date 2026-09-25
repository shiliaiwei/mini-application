"use client";

import React, { useState } from "react";
import { TelegramWebApp } from "@/types/telegram";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  X,
  Repeat,
  Gift,
} from "@/components/icons/KeylineIcons";

interface WinGramPromoCardsProps {
  onAddScore: (amount: number) => void;
  onOpenDeposit?: () => void;
  onOpenTapVault?: () => void;
  tgApp: TelegramWebApp | null;
}

export const WinGramPromoCards: React.FC<WinGramPromoCardsProps> = ({
  onAddScore,
  onOpenDeposit,
  onOpenTapVault,
  tgApp,
}) => {
  const [heroSlide, setHeroSlide] = useState(0);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<number | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  const [claimedHero, setClaimedHero] = useState(false);
  const [claimedWeekly, setClaimedWeekly] = useState(false);
  const [claimedMonthly, setClaimedMonthly] = useState(false);
  const [claimedDeposit, setClaimedDeposit] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const heroSlides = [
    {
      title: "Sports Free Bet up to $1,000",
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

  const handleHeroGet = () => {
    if (claimedHero) {
      if (heroSlide === 1 && onOpenTapVault) {
        onOpenTapVault();
      } else {
        showToast("Hero bonus already claimed for today!");
      }
      return;
    }
    const amount = heroSlides[heroSlide].reward;
    onAddScore(amount);
    setClaimedHero(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    showToast(`Bonus Claimed! +${amount.toLocaleString()} PTS added to Vault!`);
    if (heroSlide === 1 && onOpenTapVault) {
      setTimeout(() => onOpenTapVault(), 800);
    }
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
    setHeroSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
    setHeroSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const handleWeeklyActivate = () => {
    if (claimedWeekly) {
      showToast("Weekly bonus already activated!");
      return;
    }
    onAddScore(500);
    setClaimedWeekly(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    showToast("Weekly Bonus Activated! +500 PTS added to your balance!");
  };

  const handleMonthlyActivate = () => {
    if (claimedMonthly) {
      showToast("Monthly bonus already activated!");
      return;
    }
    onAddScore(2000);
    setClaimedMonthly(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    showToast("Monthly Bonus Activated! +2,000 PTS added to your balance!");
  };

  const handleDepositActivate = () => {
    if (claimedDeposit) {
      onOpenDeposit?.();
      return;
    }
    setClaimedDeposit(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    showToast("Daily +5% Deposit Bonus Boost Activated!");
    if (onOpenDeposit) {
      setTimeout(() => onOpenDeposit(), 1000);
    }
  };

  // Wheel of Fortune Spin Handler
  const handleSpinWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWheelResult(null);

    const prizeValues = [100, 250, 50, 500, 150, 1000, 200, 300];
    const randomIndex = Math.floor(Math.random() * prizeValues.length);
    const wonPrize = prizeValues[randomIndex];

    // Calculate rotation: 5 full spins (1800 deg) + sector alignment
    const sectorAngle = 360 / prizeValues.length;
    const targetDeg = 1800 + randomIndex * sectorAngle + sectorAngle / 2;

    setWheelRotation((prev) => prev + targetDeg);

    try {
      tgApp?.HapticFeedback?.impactOccurred("heavy");
    } catch {}

    setTimeout(() => {
      setWheelSpinning(false);
      setWheelResult(wonPrize);
      onAddScore(wonPrize);
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
    }, 3200);
  };

  return (
    <div className="relative select-none font-body">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#0088cc] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold border border-white/40 flex items-center gap-2 animate-fadeIn max-w-[90vw] truncate">
          <Sparkles size={16} className="text-yellow-300 flex-shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Main Promo Grid: Left Big Banner + Right 2x2 Bonus Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* ======================================================== */}
        {/* 1. LARGE HERO PROMO BANNER (Sports Free Bet up to $1,000) */}
        {/* ======================================================== */}
        <div className="sm:col-span-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3.5 sm:p-4 text-white shadow-xs flex flex-col justify-between min-h-[175px] sm:min-h-[195px] border border-blue-400/30">
          {/* Subtle Telegram Paper Plane Watermark Pattern in Background */}
          <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-wrap gap-6 p-2 overflow-hidden select-none">
            {[...Array(12)].map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className="w-10 h-10 fill-white -rotate-35 flex-shrink-0"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            ))}
          </div>

          {/* Top Left: Title & Headline */}
          <div className="relative z-10 max-w-[170px] sm:max-w-[210px]">
            <h2 className="text-xl sm:text-2xl font-black leading-tight tracking-tight text-white drop-shadow-xs">
              {heroSlides[heroSlide].title}
            </h2>
          </div>

          {/* 3D Mascot Character (Diamond Mascot with Shoes & Sports Ball) */}
          <div className="absolute right-0 sm:right-2 bottom-0 top-1 pointer-events-none flex items-center justify-end z-10">
            <svg
              viewBox="0 0 160 170"
              className="w-32 h-32 sm:w-38 sm:h-38 filter drop-shadow-xl"
            >
              {/* Circular blue glowing platform */}
              <ellipse
                cx="80"
                cy="155"
                rx="55"
                ry="12"
                fill="#005580"
                opacity="0.6"
              />
              <ellipse
                cx="80"
                cy="154"
                rx="45"
                ry="8"
                fill="#00e5ff"
                opacity="0.3"
              />

              {/* Legs */}
              <rect x="58" y="115" width="8" height="28" rx="4" fill="#00334d" />
              <rect x="94" y="115" width="8" height="28" rx="4" fill="#00334d" />

              {/* Sneakers */}
              <path
                d="M48 138 Q56 136 68 140 L70 148 Q55 150 46 146 Z"
                fill="#ffffff"
                stroke="#0088cc"
                strokeWidth="2"
              />
              <path
                d="M46 142 Q52 140 64 142 L65 146 Q50 148 45 145 Z"
                fill="#0098ea"
              />

              <path
                d="M92 140 Q104 136 114 138 L116 146 Q106 150 90 148 Z"
                fill="#ffffff"
                stroke="#0088cc"
                strokeWidth="2"
              />
              <path
                d="M96 142 Q108 140 114 142 L115 145 Q106 148 94 146 Z"
                fill="#0098ea"
              />

              {/* Diamond Body Facets (3D Blue Gem) */}
              <polygon
                points="80,18 128,45 80,125 32,45"
                fill="url(#diamondGradientMain)"
                stroke="#66d9ff"
                strokeWidth="2"
              />
              <polygon points="80,18 128,45 80,42" fill="#80e5ff" opacity="0.8" />
              <polygon points="80,18 32,45 80,42" fill="#33ccff" opacity="0.9" />
              <polygon points="80,42 128,45 80,125" fill="#0077b5" opacity="0.6" />
              <polygon points="80,42 32,45 80,125" fill="#0099e6" opacity="0.75" />

              {/* Cartoon Eyes */}
              <ellipse cx="68" cy="56" rx="9" ry="12" fill="#ffffff" />
              <ellipse cx="92" cy="56" rx="9" ry="12" fill="#ffffff" />
              <ellipse cx="70" cy="57" rx="5" ry="7" fill="#003366" />
              <ellipse cx="94" cy="57" rx="5" ry="7" fill="#003366" />
              <circle cx="72" cy="54" r="2.5" fill="#ffffff" />
              <circle cx="96" cy="54" r="2.5" fill="#ffffff" />

              {/* Smiling Mouth */}
              <path
                d="M72 74 Q80 84 88 74"
                fill="#ff4081"
                stroke="#002233"
                strokeWidth="2"
              />

              {/* Left Arm & White Glove holding Sports Ball */}
              <path
                d="M45 68 Q34 82 52 96"
                fill="none"
                stroke="#00334d"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="54" cy="98" r="9" fill="#ffffff" stroke="#00334d" strokeWidth="2" />

              {/* Right Arm holding Sports Ball */}
              <path
                d="M115 68 Q126 82 108 96"
                fill="none"
                stroke="#00334d"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="106" cy="98" r="9" fill="#ffffff" stroke="#00334d" strokeWidth="2" />

              {/* Branded Sports Ball */}
              <circle cx="80" cy="100" r="18" fill="#ffffff" stroke="#00334d" strokeWidth="2" />
              <path d="M68 94 Q80 100 80 118" fill="none" stroke="#e11d48" strokeWidth="3" />
              <path d="M92 94 Q80 100 80 118" fill="none" stroke="#2563eb" strokeWidth="3" />
              <circle cx="80" cy="100" r="6" fill="#16a34a" />

              <defs>
                <linearGradient
                  id="diamondGradientMain"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#66d9ff" />
                  <stop offset="50%" stopColor="#0098ea" />
                  <stop offset="100%" stopColor="#005580" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Bottom Bar: Action Button + Slider Arrows */}
          <div className="relative z-20 flex items-center justify-between pt-4 mt-auto">
            <button
              type="button"
              onClick={handleHeroGet}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-5 py-2 rounded-full shadow-md active:scale-95 transition-all min-h-[36px] flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {claimedHero ? "Claimed" : "Get"}
            </button>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
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
        {/* 2. 2x2 BONUS CARDS GRID (Fortune, Weekly, Monthly, Deposit) */}
        {/* ======================================================== */}
        <div className="sm:col-span-6 grid grid-cols-2 gap-2 sm:gap-2.5">
          {/* Card 1: Daily Spin */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowWheelModal(true)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setShowWheelModal(true)}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between min-h-[92px] sm:min-h-[96px] border border-blue-400/30 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
          >
            {/* Watermark Planes */}
            <div className="absolute inset-0 pointer-events-none opacity-10 flex gap-4 p-1 overflow-hidden select-none">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white -rotate-35">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>

            {/* Short Title on Left */}
            <div className="relative z-10 max-w-[78px] sm:max-w-[95px]">
              <span className="text-xs sm:text-[13px] font-bold leading-tight block text-white drop-shadow-xs">
                Daily Spin
              </span>
            </div>

            {/* 3D Wheel of Fortune Graphic on Right */}
            <div className="absolute -right-0.5 -top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 filter drop-shadow-md">
                <circle cx="50" cy="50" r="44" fill="#ffd166" stroke="#f4a261" strokeWidth="3" />
                <path d="M50 50 L50 8 A42 42 0 0 1 80 20 Z" fill="#4361ee" />
                <path d="M50 50 L80 20 A42 42 0 0 1 92 50 Z" fill="#7209b7" />
                <path d="M50 50 L92 50 A42 42 0 0 1 80 80 Z" fill="#4cc9f0" />
                <path d="M50 50 L80 80 A42 42 0 0 1 50 92 Z" fill="#f72585" />
                <path d="M50 50 L50 92 A42 42 0 0 1 20 80 Z" fill="#4361ee" />
                <path d="M50 50 L20 80 A42 42 0 0 1 8 50 Z" fill="#7209b7" />
                <path d="M50 50 L8 50 A42 42 0 0 1 20 20 Z" fill="#4cc9f0" />
                <path d="M50 50 L20 20 A42 42 0 0 1 50 8 Z" fill="#f72585" />
                {/* Center Hub */}
                <circle cx="50" cy="50" r="14" fill="#ffffff" stroke="#f4a261" strokeWidth="2" />
                <circle cx="50" cy="50" r="8" fill="#ffd166" />
                {/* Pointer */}
                <polygon points="50,4 45,14 55,14" fill="#e63946" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </div>

            {/* Pill Button: [1] Spin */}
            <div className="relative z-20 pt-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowWheelModal(true);
                }}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="w-4 h-4 rounded-full bg-[#ff5500] text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <span>Spin</span>
              </button>
            </div>
          </div>

          {/* Card 2: Weekly Bonus */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleWeeklyActivate}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleWeeklyActivate()}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between min-h-[92px] sm:min-h-[96px] border border-blue-400/30 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
          >
            {/* Watermark Planes */}
            <div className="absolute inset-0 pointer-events-none opacity-10 flex gap-4 p-1 overflow-hidden select-none">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white -rotate-35">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>

            {/* Short Title on Left */}
            <div className="relative z-10 max-w-[78px] sm:max-w-[95px]">
              <span className="text-xs sm:text-[13px] font-bold leading-tight block text-white drop-shadow-xs">
                Weekly Bonus
              </span>
            </div>

            {/* 3D Calendar with "7" Graphic on Right */}
            <div className="absolute -right-0.5 -top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 filter drop-shadow-md">
                {/* 3D Calendar Body */}
                <rect x="18" y="24" width="64" height="60" rx="8" fill="#ffffff" stroke="#005f99" strokeWidth="2" />
                <rect x="18" y="24" width="64" height="18" rx="6" fill="#0088cc" />
                {/* Rings */}
                <rect x="30" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                <rect x="64" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                {/* 3D Purple Number 7 */}
                <path
                  d="M38 50 L64 50 L48 76 L40 76 L54 56 L38 56 Z"
                  fill="#7c3aed"
                  stroke="#5b21b6"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 4px rgba(124,58,237,0.4))"
                />
              </svg>
            </div>

            {/* Pill Button: [1] Activate */}
            <div className="relative z-20 pt-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWeeklyActivate();
                }}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="w-4 h-4 rounded-full bg-[#ff5500] text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                  {claimedWeekly ? "✓" : "1"}
                </span>
                <span>{claimedWeekly ? "Active" : "Activate"}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Monthly Bonus */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleMonthlyActivate}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleMonthlyActivate()}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between min-h-[92px] sm:min-h-[96px] border border-blue-400/30 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
          >
            {/* Watermark Planes */}
            <div className="absolute inset-0 pointer-events-none opacity-10 flex gap-4 p-1 overflow-hidden select-none">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white -rotate-35">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>

            {/* Short Title on Left */}
            <div className="relative z-10 max-w-[78px] sm:max-w-[95px]">
              <span className="text-xs sm:text-[13px] font-bold leading-tight block text-white drop-shadow-xs">
                Monthly Bonus
              </span>
            </div>

            {/* 3D Calendar with Gold Vault Graphic on Right */}
            <div className="absolute -right-0.5 -top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 filter drop-shadow-md">
                <rect x="18" y="24" width="64" height="60" rx="8" fill="#ffffff" stroke="#005f99" strokeWidth="2" />
                <rect x="18" y="24" width="64" height="18" rx="6" fill="#0088cc" />
                <rect x="30" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                <rect x="64" y="16" width="6" height="14" rx="3" fill="#ffd166" />
                {/* Gold Safe Vault in Center */}
                <circle cx="50" cy="58" r="16" fill="#ffd166" stroke="#d97706" strokeWidth="2" />
                <circle cx="50" cy="58" r="10" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
                <circle cx="50" cy="58" r="3" fill="#b45309" />
                <line x1="50" y1="52" x2="50" y2="48" stroke="#b45309" strokeWidth="2" />
                <line x1="50" y1="64" x2="50" y2="68" stroke="#b45309" strokeWidth="2" />
                <line x1="44" y1="58" x2="40" y2="58" stroke="#b45309" strokeWidth="2" />
                <line x1="56" y1="58" x2="60" y2="58" stroke="#b45309" strokeWidth="2" />
              </svg>
            </div>

            {/* Pill Button: [1] Activate */}
            <div className="relative z-20 pt-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMonthlyActivate();
                }}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="w-4 h-4 rounded-full bg-[#ff5500] text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                  {claimedMonthly ? "✓" : "1"}
                </span>
                <span>{claimedMonthly ? "Active" : "Activate"}</span>
              </button>
            </div>
          </div>

          {/* Card 4: +5% Deposit */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleDepositActivate}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleDepositActivate()}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between min-h-[92px] sm:min-h-[96px] border border-blue-400/30 cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
          >
            {/* Watermark Planes */}
            <div className="absolute inset-0 pointer-events-none opacity-10 flex gap-4 p-1 overflow-hidden select-none">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white -rotate-35">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>

            {/* Short Title on Left */}
            <div className="relative z-10 max-w-[78px] sm:max-w-[95px]">
              <span className="text-xs sm:text-[13px] font-bold leading-tight block text-white drop-shadow-xs">
                +5% Deposit
              </span>
            </div>

            {/* 3D Horseshoe Magnet with TON Coins on Right */}
            <div className="absolute -right-0.5 -top-1 pointer-events-none flex items-center z-10">
              <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 filter drop-shadow-md">
                {/* Horseshoe Magnet */}
                <path
                  d="M40 30 C40 15, 75 15, 75 30 L75 60 C75 75, 40 75, 40 60 Z"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <rect x="33" y="24" width="14" height="12" fill="#cbd5e1" rx="2" />
                <rect x="68" y="24" width="14" height="12" fill="#cbd5e1" rx="2" />
                {/* Magnetic field lines */}
                <path d="M42 20 Q57 14 73 20" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
                {/* Attracted TON Diamond Crystal Coins */}
                <polygon points="58,22 64,28 58,40 52,28" fill="#0098ea" stroke="#ffffff" strokeWidth="1.5" />
                <polygon points="46,14 50,18 46,26 42,18" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                <polygon points="70,16 74,20 70,28 66,20" fill="#00e5ff" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </div>

            {/* Pill Button: [1] Activate */}
            <div className="relative z-20 pt-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDepositActivate();
                }}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="w-4 h-4 rounded-full bg-[#ff5500] text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                  {claimedDeposit ? "✓" : "1"}
                </span>
                <span>{claimedDeposit ? "Active" : "Activate"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TURBINE OF FORTUNE (INTERACTIVE LUCKY WHEEL MODAL)   */}
      {/* ======================================================== */}
      {showWheelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl border border-slate-200 relative text-slate-900 text-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowWheelModal(false)}
              className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#0088cc] uppercase block">
                DAILY BONUS WHEEL
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Daily Turbine of Fortune
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Spin the lucky wheel to win real Vault PTS!
              </p>
            </div>

            {/* Wheel Canvas & Arrow */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Pointer Arrow at Top */}
              <div className="absolute -top-3 z-30 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-red-600 filter drop-shadow-md" />

              {/* The Spinning Wheel */}
              <div
                className="w-56 h-56 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden relative"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: wheelSpinning
                    ? "transform 3.2s cubic-bezier(0.15, 0.9, 0.25, 1)"
                    : "none",
                }}
              >
                {/* 8 Segments */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path d="M100 100 L100 0 A100 100 0 0 1 170.7 29.3 Z" fill="#4361ee" />
                  <path d="M100 100 L170.7 29.3 A100 100 0 0 1 200 100 Z" fill="#7209b7" />
                  <path d="M100 100 L200 100 A100 100 0 0 1 170.7 170.7 Z" fill="#4cc9f0" />
                  <path d="M100 100 L170.7 170.7 A100 100 0 0 1 100 200 Z" fill="#f72585" />
                  <path d="M100 100 L100 200 A100 100 0 0 1 29.3 170.7 Z" fill="#4361ee" />
                  <path d="M100 100 L29.3 170.7 A100 100 0 0 1 0 100 Z" fill="#7209b7" />
                  <path d="M100 100 L0 100 A100 100 0 0 1 29.3 29.3 Z" fill="#4cc9f0" />
                  <path d="M100 100 L29.3 29.3 A100 100 0 0 1 100 0 Z" fill="#f72585" />
                  {/* Wheel Labels */}
                  <text x="110" y="35" fill="#fff" fontSize="12" fontWeight="bold">100</text>
                  <text x="150" y="75" fill="#fff" fontSize="12" fontWeight="bold">250</text>
                  <text x="150" y="125" fill="#fff" fontSize="12" fontWeight="bold">50</text>
                  <text x="110" y="165" fill="#fff" fontSize="12" fontWeight="bold">500</text>
                  <text x="60" y="165" fill="#fff" fontSize="12" fontWeight="bold">150</text>
                  <text x="25" y="125" fill="#fff" fontSize="12" fontWeight="bold">1000</text>
                  <text x="25" y="75" fill="#fff" fontSize="12" fontWeight="bold">200</text>
                  <text x="60" y="35" fill="#fff" fontSize="12" fontWeight="bold">300</text>
                </svg>

                {/* Center Core */}
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white border-4 border-amber-400 flex items-center justify-center font-black text-xs text-amber-600 shadow-md">
                  ★
                </div>
              </div>
            </div>

            {/* Result Message */}
            {wheelResult !== null && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-sm animate-fadeIn">
                Congratulations! You won +{wheelResult} PTS!
              </div>
            )}

            {/* Spin Action Button */}
            <button
              type="button"
              disabled={wheelSpinning}
              onClick={handleSpinWheel}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-md min-h-[48px] ${
                wheelSpinning
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-[#0088cc] hover:bg-[#0077b5] text-white active:scale-98 cursor-pointer"
              }`}
            >
              {wheelSpinning ? "Spinning Turbine..." : "Spin Now!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
