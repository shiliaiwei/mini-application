"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AdItem } from "@/data/adsRegistry";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ChevronLeft, Check, Gift, Send, ShieldCheck, Sparkles } from "@/components/icons/KeylineIcons";
import { BrandFooter } from "@/components/brand/BrandFooter";

interface AdDetailSpaViewProps {
  ad: AdItem;
  onBack: () => void;
  onClaimPoints?: (amount: number) => void;
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
}

export const AdDetailSpaView: React.FC<AdDetailSpaViewProps> = ({
  ad,
  onBack,
  onClaimPoints,
  user,
  tgApp,
}) => {
  const [claimed, setClaimed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleClaim = () => {
    if (claimed) return;
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setClaimed(true);
    if (onClaimPoints) {
      onClaimPoints(100);
    }
  };

  const handleShare = () => {
    try {
      tgApp?.HapticFeedback?.selectionChanged();
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(
          `Explore ${ad.name_en} (${ad.name_km}) on SHILIAIWEI Official Web3 Platform!`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const imageSrc = `/ads/${encodeURIComponent(ad.file)}`;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pt-1 pb-28 animate-fadeIn select-none font-sans text-slate-900">
      {/* ── TOP NAVIGATION BAR (WITH BACK BUTTON) ── */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={16} className="text-[#0098ea]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-amber-500" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
            Official Institution SPA
          </span>
        </div>

        <div className="w-14" />
      </div>

      {/* ── MAIN COLLECTIBLE CARD SHOWCASE ── */}
      <div className="bg-[#091524] rounded-3xl p-5 border-2 border-[#1a3352] text-white shadow-xl space-y-5 relative overflow-hidden">
        {/* Subtle Watermark Mesh */}
        <div className="absolute inset-0 bg-app-guilloche opacity-[0.04] pointer-events-none" />

        {/* 5-Star Header Ribbon */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-3 py-1 rounded-xl text-slate-950 shadow-xs font-black">
          <div className="flex items-center gap-1.5 text-xs">
            <span>★★★★★</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-900">
              {ad.tag} • OFFICIAL PARTNER
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md">
            #{ad.badgeNumber}
          </span>
        </div>

        {/* High-Resolution Full Logo Showcase */}
        <div className="w-full bg-white rounded-2xl p-6 flex items-center justify-center min-h-[220px] shadow-inner relative overflow-hidden">
          <div className="relative w-full h-[180px] flex items-center justify-center">
            <Image
              src={imageSrc}
              alt={ad.name_en}
              fill
              sizes="(max-width: 640px) 100vw, 420px"
              className="object-contain p-2 select-none filter drop-shadow-md"
              priority
            />
          </div>
        </div>

        {/* Full Titles (EN & KH) */}
        <div className="space-y-1.5 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 block">
            {ad.category_en} ({ad.category_km})
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display leading-tight">
            {ad.name_km}
          </h2>
          <h3 className="text-sm font-bold text-slate-300">
            {ad.name_en}
          </h3>
        </div>

        {/* Official Description Card */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              សេចក្តីសង្ខេបផ្លូវការ (Official Summary)
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {ad.description_km}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 block">
              English Overview
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {ad.description_en}
            </p>
          </div>
        </div>

        {/* Interactive Action Controls */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleClaim}
            disabled={claimed}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              claimed
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-98"
            }`}
          >
            {claimed ? (
              <>
                <Check size={18} />
                <span>Claimed +100 Sponsor PTS!</span>
              </>
            ) : (
              <>
                <Gift size={18} />
                <span>Claim Official Sponsor Bonus (+100 PTS)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Send size={16} />
            <span>{copied ? "Link Copied to Clipboard!" : "Share Official Partner Card"}</span>
          </button>
        </div>
      </div>

      {/* Brand Footer */}
      <BrandFooter height={16} className="mt-6" />
    </div>
  );
};
