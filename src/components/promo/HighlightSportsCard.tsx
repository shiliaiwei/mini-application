"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AdItem, ADS_REGISTRY, getRandomNonRepeatingAd } from "@/data/adsRegistry";

interface HighlightSportsCardProps {
  onOpenAdDetail?: (ad: AdItem) => void;
  className?: string;
}

/**
 * Highlight Sports Trading Card Advertisement Component
 * Styled after the user's provided collectible sports card frame:
 * - Deep navy blue perimeter (#0b1728 / #060e18)
 * - Angled top header with Institution Name (EN & KH full names)
 * - 5-Star golden/black rating ribbon (★★★★★)
 * - Large center white showcase displaying the full logo uncropped
 * - Angled bottom tab with number badge & Category/Team tag
 * - 31-second active countdown loop with auto-rotation (never repeats consecutively)
 */
export const HighlightSportsCard: React.FC<HighlightSportsCardProps> = ({
  onOpenAdDetail,
  className = "",
}) => {
  const [currentAd, setCurrentAd] = useState<AdItem>(() => getRandomNonRepeatingAd());
  const [timeLeft, setTimeLeft] = useState<number>(31);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const adRef = useRef(currentAd);
  adRef.current = currentAd;

  // 31-second countdown rotation loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused) return;

      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired: rotate to a different randomized ad (never repeat current)
          try {
            const nextAd = getRandomNonRepeatingAd(adRef.current.id);
            setCurrentAd(nextAd);
            setImgError(false);
          } catch {}
          return 31;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextAd = getRandomNonRepeatingAd(currentAd.id);
    setCurrentAd(nextAd);
    setTimeLeft(31);
    setImgError(false);
  };

  const handleCardClick = () => {
    if (onOpenAdDetail) {
      onOpenAdDetail(currentAd);
    }
  };

  // Encoded image source path
  const imageSrc = `/ads/${encodeURIComponent(currentAd.file)}`;
  const progressPercent = Math.round((timeLeft / 31) * 100);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick()}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label={`Featured Institution: ${currentAd.name_en}. Tap for SPA details.`}
      className={`sm:col-span-6 relative overflow-hidden rounded-3xl bg-[#091524] border-2 border-[#1a3352] text-white shadow-xl cursor-pointer active:scale-[0.985] transition-all hover:shadow-2xl hover:border-amber-400/50 flex flex-col justify-between min-h-[260px] p-2.5 sm:p-3 select-none text-left group ${className}`}
    >
      {/* ── 1. TOP HEADER: Angled Brand Ribbon & Player Name ── */}
      <div className="relative z-10 w-full mb-2">
        <div className="flex items-center justify-between gap-1.5">
          {/* Angled Tab with Title / Player Name */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                Official
              </span>
              <span className="text-[10px] font-bold text-slate-300 truncate">
                {currentAd.name_en}
              </span>
            </div>
            {/* Primary Khmer Full Name */}
            <h3 className="text-xs sm:text-sm font-black text-white truncate font-display tracking-tight leading-tight mt-0.5">
              {currentAd.name_km}
            </h3>
          </div>

          {/* 31s Countdown Timer Pill */}
          <button
            type="button"
            onClick={handleNext}
            title="Next Highlight"
            className="flex-shrink-0 flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-1 rounded-full text-[10px] font-black shadow-xs transition-transform active:scale-95"
          >
            <span>{timeLeft}s</span>
            <span className="text-[9px]">↻</span>
          </button>
        </div>

        {/* 5-STAR RATING RIBBON (Matching template: orange banner with 5 stars) */}
        <div className="mt-1.5 flex items-center justify-between bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-2.5 py-0.5 rounded-md text-slate-950 shadow-xs">
          <div className="flex items-center gap-1 text-[11px] font-black tracking-widest text-slate-950">
            <span>★★★★★</span>
            <span className="text-[9px] font-black uppercase ml-1 tracking-wider text-slate-900">
              NATIONAL PARTNER
            </span>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-900 tracking-wider">
            {currentAd.code}
          </span>
        </div>
      </div>

      {/* ── 2. CENTER WHITE SHOWCASE: Full Logo (Uncropped & Centered) ── */}
      <div className="relative z-10 w-full flex-1 bg-white rounded-2xl p-3 flex items-center justify-center shadow-inner overflow-hidden my-1 min-h-[135px]">
        {/* Subtle Watermark Mesh */}
        <div className="absolute inset-0 bg-app-guilloche opacity-[0.05] pointer-events-none" />

        {/* Highlight Glow Aura on Hover */}
        <div className="absolute w-32 h-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

        {!imgError ? (
          <div className="relative w-full h-[115px] flex items-center justify-center">
            <Image
              src={imageSrc}
              alt={currentAd.name_en}
              fill
              sizes="(max-width: 640px) 100vw, 360px"
              className="object-contain p-1 filter drop-shadow-sm select-none transition-transform duration-300 group-hover:scale-105"
              priority
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="text-center p-3">
            <div className="text-sm font-black text-slate-800">{currentAd.name_km}</div>
            <div className="text-xs text-slate-500">{currentAd.name_en}</div>
          </div>
        )}
      </div>

      {/* ── 3. BOTTOM BAR: Angled Number Badge + Team Name + SPA Callout ── */}
      <div className="relative z-10 w-full mt-1.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          {/* Angled Orange Number Badge (Matching template: e.g. "10") */}
          <div className="flex items-center bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg px-2.5 py-1 text-slate-950 font-black shadow-xs flex-shrink-0">
            <span className="text-xs font-mono font-black">{currentAd.badgeNumber}</span>
          </div>

          {/* Team / Category Name */}
          <div className="flex-1 min-w-0 text-left pl-1">
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block truncate">
              {currentAd.category_en}
            </span>
            <span className="text-[9px] text-slate-400 block truncate">
              {currentAd.category_km}
            </span>
          </div>

          {/* Open SPA Callout */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-950 text-white text-[10px] font-black tracking-wider transition-all flex-shrink-0">
            <span>DETAIL SPA</span>
            <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
          </div>
        </div>

        {/* 31-Second Depleting Progress Bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
