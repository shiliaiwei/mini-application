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

const AD_ROTATION_INTERVAL_MS = 3800;

/**
 * InstitutionalAdCard — Ticket/Stub Monochrome Premium Style
 * - No "AD" label, no acronym short label
 * - Ornate ticket shape with notched semicircles on both sides
 * - Black background, white inner content area
 * - Perforated dashed divider line
 */
export const InstitutionalAdCard: React.FC<InstitutionalAdCardProps> = ({
  onOpenDetail,
  lang,
}) => {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * VERIFIED_ADS_PARTNERS.length)
  );
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [animStage, setAnimStage] = useState<"idle" | "exiting" | "entering">("idle");

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
    if (lang) { setCurrentLang(lang); return; }
    const handleLangChange = () => {
      const saved = localStorage.getItem("shi_app_lang");
      if (saved === "en" || saved === "km") setCurrentLang(saved);
    };
    window.addEventListener("storage", handleLangChange);
    window.addEventListener("shi_lang_change", handleLangChange);
    return () => {
      window.removeEventListener("storage", handleLangChange);
      window.removeEventListener("shi_lang_change", handleLangChange);
    };
  }, [lang]);

  const triggerNextAd = useCallback(() => {
    setAnimStage("exiting");
    setTimeout(() => {
      setCurrentIndex((prev) => {
        let next: number;
        do { next = Math.floor(Math.random() * VERIFIED_ADS_PARTNERS.length); }
        while (next === prev && VERIFIED_ADS_PARTNERS.length > 1);
        return next;
      });
      setDirection((prev) => (prev === "right" ? "left" : "right"));
      setAnimStage("entering");
      requestAnimationFrame(() => setTimeout(() => setAnimStage("idle"), 30));
    }, 120);
  }, []);

  useEffect(() => {
    const timer = setInterval(triggerNextAd, AD_ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [triggerNextAd]);

  const partner: AdPartnerItem = VERIFIED_ADS_PARTNERS[currentIndex] || VERIFIED_ADS_PARTNERS[0];
  const fullName = currentLang === "en" ? partner.nameEn : partner.nameKm;
  const sector = currentLang === "en" ? partner.sectorEn : partner.sectorKm;

  const getAnimStyle = (): React.CSSProperties => {
    if (animStage === "exiting") return { opacity: 0, transform: `scale(0.94) translateX(${direction === "right" ? "-24px" : "24px"})`, transition: "all 0.12s ease-in" };
    if (animStage === "entering") return { opacity: 0, transform: `scale(0.88) translateX(${direction === "right" ? "28px" : "-28px"})`, transition: "none" };
    return { opacity: 1, transform: "scale(1) translateX(0)", transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)" };
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(partner.id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenDetail(partner.id)}
      aria-label={fullName}
      className="w-full cursor-pointer select-none active:scale-[0.98] transition-transform duration-150 outline-none"
    >
      {/*
        ── TICKET SHAPE ──
        Outer black shell, inner white area cut with notches on left/right sides.
        Uses CSS clip with a radial-gradient trick for the semicircle punch-outs.
      */}
      <div
        className="relative w-full overflow-visible"
        style={{ minHeight: "240px" }}
      >
        {/* Black outer shell */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            background: "#0F172A",
            borderRadius: "8px",
            minHeight: "240px",
          }}
        >
          {/* Subtle decorative corner ornaments — top-left */}
          <svg className="absolute top-3 left-3 pointer-events-none" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M2 14 Q2 2 14 2" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" fill="none"/>
            <path d="M2 14 Q2 2 14 2" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" fill="none" strokeDasharray="2 2"/>
            <circle cx="2" cy="2" r="1.5" fill="white" fillOpacity="0.3"/>
            <circle cx="14" cy="2" r="1" fill="white" fillOpacity="0.2"/>
            <circle cx="2" cy="14" r="1" fill="white" fillOpacity="0.2"/>
          </svg>
          {/* Corner ornament — top-right */}
          <svg className="absolute top-3 right-3 pointer-events-none" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M26 14 Q26 2 14 2" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" fill="none"/>
            <path d="M26 14 Q26 2 14 2" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" fill="none" strokeDasharray="2 2"/>
            <circle cx="26" cy="2" r="1.5" fill="white" fillOpacity="0.3"/>
            <circle cx="14" cy="2" r="1" fill="white" fillOpacity="0.2"/>
            <circle cx="26" cy="14" r="1" fill="white" fillOpacity="0.2"/>
          </svg>
          {/* Corner ornament — bottom-left */}
          <svg className="absolute bottom-3 left-3 pointer-events-none" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M2 14 Q2 26 14 26" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" fill="none"/>
            <circle cx="2" cy="26" r="1.5" fill="white" fillOpacity="0.3"/>
          </svg>
          {/* Corner ornament — bottom-right */}
          <svg className="absolute bottom-3 right-3 pointer-events-none" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M26 14 Q26 26 14 26" stroke="white" strokeWidth="1.2" strokeOpacity="0.25" fill="none"/>
            <circle cx="26" cy="26" r="1.5" fill="white" fillOpacity="0.3"/>
          </svg>

          {/* Inner white content zone */}
          <div
            className="relative mx-4 my-4"
            style={{
              background: "white",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {/* Punch-out notches on left & right at ~65% from top (divider row) */}
            {/* Left notch */}
            <div
              className="absolute z-10"
              style={{
                left: "-12px",
                top: "68%",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#0F172A",
                transform: "translateY(-50%)",
              }}
            />
            {/* Right notch */}
            <div
              className="absolute z-10"
              style={{
                right: "-12px",
                top: "68%",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#0F172A",
                transform: "translateY(-50%)",
              }}
            />

            {/* Logo zone (top 65%) */}
            <div
              className="flex items-center justify-center"
              style={{ height: "160px" }}
            >
              <div style={getAnimStyle()} className="flex items-center justify-center w-36 h-36">
                <Image
                  src={`/ads/${partner.filename}`}
                  alt={fullName}
                  fill
                  sizes="144px"
                  className="object-contain select-none pointer-events-none"
                  priority
                />
              </div>
            </div>

            {/* Dashed perforated divider line */}
            <div className="w-full px-3">
              <div
                style={{
                  borderTop: "1.5px dashed #CBD5E1",
                  marginLeft: "8px",
                  marginRight: "8px",
                }}
              />
            </div>

            {/* Stub zone — name & sector */}
            <div style={getAnimStyle()} className="px-5 py-3 text-center">
              <h2 className="font-black text-slate-900 text-base leading-tight line-clamp-1">
                {fullName}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                {sector}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
