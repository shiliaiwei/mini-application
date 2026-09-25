"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { VERIFIED_ADS_PARTNERS, AdPartnerItem } from "@/data/adsData";


export type AdCardLanguage = "km" | "en";

interface InstitutionalAdCardProps {
  onOpenDetail: (partnerId: string) => void;
  onOpenStats?: () => void;
  lang?: AdCardLanguage;
}

const AD_ROTATION_INTERVAL_MS = 3800; // Fast rotation like dynamic ads

export const InstitutionalAdCard: React.FC<InstitutionalAdCardProps> = ({
  onOpenDetail,
  lang,
}) => {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * VERIFIED_ADS_PARTNERS.length)
  );
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [animStage, setAnimStage] = useState<"idle" | "exiting" | "entering">("idle");

  // Active language detection
  const [currentLang, setCurrentLang] = useState<AdCardLanguage>(() => {
    if (lang) return lang;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shi_app_lang");
      if (saved === "en" || saved === "km") return saved;
      const navLang = navigator.language?.toLowerCase() || "";
      if (navLang.startsWith("en")) return "en";
    }
    return "km";
  });

  useEffect(() => {
    if (lang) {
      setCurrentLang(lang);
      return;
    }
    const handleLangChange = () => {
      const saved = localStorage.getItem("shi_app_lang");
      if (saved === "en" || saved === "km") {
        setCurrentLang(saved);
      }
    };
    window.addEventListener("storage", handleLangChange);
    window.addEventListener("shi_lang_change", handleLangChange);
    return () => {
      window.removeEventListener("storage", handleLangChange);
      window.removeEventListener("shi_lang_change", handleLangChange);
    };
  }, [lang]);

  // Fast snappy left-to-right popup transition
  const triggerNextAd = useCallback(() => {
    setAnimStage("exiting");

    setTimeout(() => {
      setCurrentIndex((prev) => {
        let next: number;
        do {
          next = Math.floor(Math.random() * VERIFIED_ADS_PARTNERS.length);
        } while (next === prev && VERIFIED_ADS_PARTNERS.length > 1);
        return next;
      });

      // Alternate left and right slide popup
      setDirection((prev) => (prev === "right" ? "left" : "right"));
      setAnimStage("entering");

      requestAnimationFrame(() => {
        setTimeout(() => {
          setAnimStage("idle");
        }, 30);
      });
    }, 120);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      triggerNextAd();
    }, AD_ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [triggerNextAd]);

  const partner: AdPartnerItem = VERIFIED_ADS_PARTNERS[currentIndex] || VERIFIED_ADS_PARTNERS[0];
  const fullName = currentLang === "en" ? partner.nameEn : partner.nameKm;

  // Snappy fast left/right popup animation classes
  const getAnimationClass = () => {
    if (animStage === "exiting") {
      const exitTranslate = direction === "right" ? "-translate-x-10" : "translate-x-10";
      return `opacity-0 scale-95 ${exitTranslate} transition-all duration-120 ease-in`;
    }
    if (animStage === "entering") {
      const enterTranslate = direction === "right" ? "translate-x-12" : "-translate-x-12";
      return `opacity-0 scale-90 ${enterTranslate} duration-0`;
    }
    return "opacity-100 scale-100 translate-x-0 transition-all duration-200 ease-out";
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(partner.id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenDetail(partner.id)}
      aria-label={fullName}
      className="sm:col-span-6 relative overflow-hidden rounded-3xl bg-white min-h-[255px] sm:min-h-[270px] border border-slate-200/90 shadow-sm cursor-pointer select-none group active:scale-[0.98] transition-all duration-200 ease-out flex flex-col justify-between p-4"
    >
      {/* ── TOP: Minimal "Ad" label ── */}
      <div className="w-full flex items-center relative z-20">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200/80 leading-none">
          Ad
        </span>
      </div>

      {/* ── CENTER: Clean Logo Showcase (Zero color behind logo, pure white canvas) ── */}

      <div className="my-auto py-2 flex items-center justify-center relative z-10">
        <div className={`relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center transform ${getAnimationClass()}`}>
          <Image
            src={`/ads/${partner.filename}`}
            alt={fullName}
            fill
            sizes="(max-width: 640px) 160px, 180px"
            className="object-contain select-none pointer-events-none drop-shadow-xs"
            priority
          />
        </div>
      </div>

      {/* ── BOTTOM: High-contrast typography & subtitle ── */}
      <div className={`w-full pt-1 text-center relative z-20 transform ${getAnimationClass()}`}>
        <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
          {fullName}
        </h2>
        <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
          {currentLang === "en" ? partner.sectorEn : partner.sectorKm}
        </p>
      </div>
    </div>
  );
};
