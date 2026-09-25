"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { VERIFIED_ADS_PARTNERS, AdPartnerItem } from "@/data/adsData";

export type AdCardLanguage = "km" | "en";

interface InstitutionalAdCardProps {
  onOpenDetail: (partnerId: string) => void;
  onOpenStats?: () => void;
  lang?: AdCardLanguage;
}

const AD_DURATION_SECONDS = 7;
type AnimationDirection = "left" | "right" | "up" | "down";
const DIRECTIONS: AnimationDirection[] = ["left", "right", "up", "down"];

export const InstitutionalAdCard: React.FC<InstitutionalAdCardProps> = ({
  onOpenDetail,
  lang,
}) => {
  // Random initial selection from verified partners
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * VERIFIED_ADS_PARTNERS.length)
  );
  const [direction, setDirection] = useState<AnimationDirection>("right");
  const [animStage, setAnimStage] = useState<"idle" | "entering" | "exiting">("idle");
  const [flash, setFlash] = useState(false);

  // Active language detection (strictly single language, no bilingual text)
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

  // Listen for language changes from user switch
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

  // Pick a random DIFFERENT partner with fast random direction and flash effect
  const pickNextRandomPartner = () => {
    setAnimStage("exiting");

    setTimeout(() => {
      setCurrentIndex((prev) => {
        let next: number;
        do {
          next = Math.floor(Math.random() * VERIFIED_ADS_PARTNERS.length);
        } while (next === prev && VERIFIED_ADS_PARTNERS.length > 1);
        return next;
      });

      const nextDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      setDirection(nextDir);
      setAnimStage("entering");
      setFlash(true);

      requestAnimationFrame(() => {
        setTimeout(() => {
          setAnimStage("idle");
          setFlash(false);
        }, 25);
      });
    }, 100);
  };

  // Fast 7-Second Auto-rotation interval for rapid style changes
  useEffect(() => {
    const timer = setInterval(() => {
      pickNextRandomPartner();
    }, AD_DURATION_SECONDS * 1000);

    return () => clearInterval(timer);
  }, []);

  const partner: AdPartnerItem = VERIFIED_ADS_PARTNERS[currentIndex] || VERIFIED_ADS_PARTNERS[0];
  const fullName = currentLang === "en" ? partner.nameEn : partner.nameKm;

  // Compute transform classes for snappy, fast animation (crisp deceleration)
  const getTransformClass = () => {
    if (animStage === "exiting") {
      return "opacity-0 scale-95 transition-all duration-100 ease-in";
    }
    if (animStage === "entering") {
      let offset = "";
      if (direction === "left") offset = "-translate-x-12 translate-y-0";
      else if (direction === "right") offset = "translate-x-12 translate-y-0";
      else if (direction === "up") offset = "translate-y-12 translate-x-0";
      else if (direction === "down") offset = "-translate-y-12 translate-x-0";
      return `opacity-0 scale-90 ${offset} duration-0`;
    }
    return "opacity-100 scale-100 translate-x-0 translate-y-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(partner.id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenDetail(partner.id)}
      aria-label={fullName}
      className="sm:col-span-6 relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0088cc] via-[#006fa7] to-[#004f77] min-h-[255px] sm:min-h-[270px] border border-blue-400/25 shadow-sm cursor-pointer select-none group active:scale-[0.98] transition-transform duration-300 ease-out"
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-30 pointer-events-none filter blur-2xl transition-colors duration-500"
        style={{ backgroundColor: partner.officialColor || "#38bdf8" }}
      />

      {/* Momentary Fast Flash Overlay on ad rotation */}
      <div
        className={`absolute inset-0 bg-white/40 pointer-events-none transition-opacity duration-250 ease-out z-30 ${
          flash ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ── BIG CENTERED LOGO SHOWCASE (Transparent background, no box, slow float when center) ── */}
      <div className="absolute inset-0 flex items-center justify-center pb-12 pt-3 px-4 z-10 pointer-events-none">
        <div
          className={`relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center transform ${getTransformClass()} ${
            animStage === "idle" ? "animate-ad-logo-float" : ""
          }`}
        >
          {/* Subtle luminous halo ring behind logo */}
          <div
            className="absolute inset-3 rounded-full opacity-30 filter blur-xl pointer-events-none transition-all duration-700"
            style={{ backgroundColor: partner.officialColor || "#38bdf8" }}
          />

          <Image
            src={`/ads/${partner.filename}`}
            alt={fullName}
            fill
            sizes="(max-width: 640px) 192px, 220px"
            className="object-contain filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.65)] drop-shadow-[0_2px_10px_rgba(255,255,255,0.22)] select-none pointer-events-none relative z-10"
            priority
          />
        </div>
      </div>

      {/* ── CONTRAST GRADIENT OVERLAY (Transparent from center line to bottom black) ── */}
      <div className="absolute inset-x-0 bottom-0 top-[45%] bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none z-15" />

      {/* ── SINGLE FULL NAME IN ACTIVE LANGUAGE (No bilingual text, mobile optimized) ── */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-3.5 pt-3 text-center pointer-events-none">
        <h2
          className={`font-sans font-black text-white text-sm sm:text-base leading-snug drop-shadow-md line-clamp-2 transform ${getTransformClass()}`}
        >
          {fullName}
        </h2>
      </div>
    </div>
  );
};
