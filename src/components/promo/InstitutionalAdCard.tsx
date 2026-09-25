"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { VERIFIED_ADS_PARTNERS, AdPartnerItem } from "@/data/adsData";
import { Sparkles, ShieldCheck, ChevronLeft, ChevronRight, TrendingUp } from "@/components/icons/KeylineIcons";

interface InstitutionalAdCardProps {
  onOpenDetail: (partnerId: string) => void;
  onOpenStats?: () => void;
}

const AD_DURATION_SECONDS = 31;

export const InstitutionalAdCard: React.FC<InstitutionalAdCardProps> = ({
  onOpenDetail,
  onOpenStats,
}) => {
  // Random initial selection from verified partners
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * VERIFIED_ADS_PARTNERS.length)
  );
  const [secondsRemaining, setSecondsRemaining] = useState(AD_DURATION_SECONDS);
  const [fadeAnim, setFadeAnim] = useState(true);

  const prevIndexRef = useRef(currentIndex);
  prevIndexRef.current = currentIndex;

  // Pick a random DIFFERENT partner (never the same logo consecutively)
  const pickNextRandomPartner = () => {
    setFadeAnim(false);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        let next: number;
        do {
          next = Math.floor(Math.random() * VERIFIED_ADS_PARTNERS.length);
        } while (next === prev && VERIFIED_ADS_PARTNERS.length > 1);
        return next;
      });
      setSecondsRemaining(AD_DURATION_SECONDS);
      setFadeAnim(true);
    }, 200);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFadeAnim(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + VERIFIED_ADS_PARTNERS.length) % VERIFIED_ADS_PARTNERS.length);
      setSecondsRemaining(AD_DURATION_SECONDS);
      setFadeAnim(true);
    }, 150);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    pickNextRandomPartner();
  };

  // 31-Second Countdown Timer and Auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          pickNextRandomPartner();
          return AD_DURATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const partner: AdPartnerItem = VERIFIED_ADS_PARTNERS[currentIndex] || VERIFIED_ADS_PARTNERS[0];
  const progressPercent = (secondsRemaining / AD_DURATION_SECONDS) * 100;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(partner.id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenDetail(partner.id)}
      aria-label={`Open details for ${partner.nameEn}`}
      className="sm:col-span-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-4 text-white shadow-xs flex flex-col justify-between min-h-[235px] border border-blue-400/30 cursor-pointer active:scale-[0.98] transition-all hover:shadow-lg group text-left select-none"
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-20 pointer-events-none filter blur-2xl transition-all duration-700"
        style={{ backgroundColor: partner.officialColor || "#38bdf8" }}
      />

      {/* ── TOP HEADER ROW: Sponsored Badge + 31s Countdown + Feature Detail Callout ── */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-black/25 border border-white/20 text-yellow-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck size={12} className="text-yellow-300" />
            <span>ដៃគូផ្លូវការ (Partner)</span>
          </span>
          {/* 31-Second Active Ad Timer Pill */}
          <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white font-mono text-[9px] font-bold">
            ⏱ {secondsRemaining}s
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white text-[10px] font-black uppercase tracking-wider transition-all group-hover:bg-white group-hover:text-[#0077b5]">
          <span>Feature Detail</span>
          <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      </div>

      {/* ── CENTER LOGO SHOWCASE (Highlight style) ── */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center my-auto text-center transition-all duration-300 transform ${
          fadeAnim ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Centered Logo Badge */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-white/95 border-2 border-white/60 shadow-lg flex items-center justify-center p-2 mb-2 relative group-hover:scale-105 transition-transform duration-300">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={`/ads/${partner.filename}`}
              alt={partner.nameEn}
              fill
              sizes="88px"
              className="object-contain filter drop-shadow-sm select-none pointer-events-none"
              priority
            />
          </div>
        </div>

        {/* Institution Full Names (Khmer & English - Capture fullname only per rule) */}
        <div className="space-y-0.5 max-w-[280px] sm:max-w-xs">
          <h2 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-sm truncate">
            {partner.nameKm}
          </h2>
          <h3 className="text-[10px] sm:text-[11px] font-bold text-sky-100 tracking-wide truncate">
            {partner.nameEn}
          </h3>
        </div>

        {/* Sector Tag */}
        <span className="mt-1 text-[8.5px] font-bold text-sky-200 tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full border border-white/10 truncate max-w-[240px]">
          {partner.sectorKm}
        </span>
      </div>

      {/* ── BOTTOM PROGRESS & STATS CONTROLS ── */}
      <div className="relative z-10 pt-2 space-y-2">
        {/* 31-Second Depleting Linear Progress Bar */}
        <div className="w-full h-1 bg-black/25 rounded-full overflow-hidden p-[0.5px]">
          <div
            className="h-full bg-yellow-300 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Footer Row: Prev/Next Quick Navigation + Alternate Analytics Link */}
        <div className="flex items-center justify-between text-[9px] text-sky-100 font-medium">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer active:scale-90 transition-transform"
              title="Previous Partner"
              aria-label="Previous Partner"
            >
              <ChevronLeft size={12} />
            </button>
            <span className="font-mono text-[9px]">
              {currentIndex + 1}/{VERIFIED_ADS_PARTNERS.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer active:scale-90 transition-transform"
              title="Next Random Partner"
              aria-label="Next Random Partner"
            >
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Quick link to Stats SPA */}
          {onOpenStats && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenStats();
              }}
              className="flex items-center gap-1 text-yellow-300 hover:text-white font-bold transition-colors cursor-pointer"
            >
              <TrendingUp size={12} />
              <span>Open Stats Graph →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
