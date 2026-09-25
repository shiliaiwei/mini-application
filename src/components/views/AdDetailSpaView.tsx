"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ChevronLeft, ChevronRight, Check, Sparkles, ArrowUpRight, ShieldCheck, Award } from "@/components/icons/KeylineIcons";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { AdPartnerItem, VERIFIED_ADS_PARTNERS } from "@/data/adsData";

interface AdDetailSpaViewProps {
  partnerId: string;
  onBack: () => void;
  onSelectPartner?: (id: string) => void;
  onAddScore?: (amount: number) => void;
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
}

export const AdDetailSpaView: React.FC<AdDetailSpaViewProps> = ({
  partnerId,
  onBack,
  onSelectPartner,
  onAddScore,
  user,
  tgApp,
}) => {
  const currentIndex = VERIFIED_ADS_PARTNERS.findIndex((p) => p.id === partnerId);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const partner = VERIFIED_ADS_PARTNERS[activeIndex];

  const [claimedServices, setClaimedServices] = useState<Record<string, boolean>>({});
  const [claimToast, setClaimToast] = useState<string | null>(null);

  const handleClaimService = (idx: number, pts: number, title: string) => {
    const key = `${partner.id}-${idx}`;
    if (claimedServices[key]) return;

    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}

    setClaimedServices((prev) => ({ ...prev, [key]: true }));
    if (onAddScore) {
      onAddScore(pts);
    }
    setClaimToast(`+${pts} PTS Claimed for exploring ${title}!`);
    setTimeout(() => setClaimToast(null), 3000);
  };

  const handleNext = () => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}
    const nextIdx = (activeIndex + 1) % VERIFIED_ADS_PARTNERS.length;
    const nextId = VERIFIED_ADS_PARTNERS[nextIdx].id;
    if (onSelectPartner) {
      onSelectPartner(nextId);
    }
  };

  const handlePrev = () => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}
    const prevIdx = (activeIndex - 1 + VERIFIED_ADS_PARTNERS.length) % VERIFIED_ADS_PARTNERS.length;
    const prevId = VERIFIED_ADS_PARTNERS[prevIdx].id;
    if (onSelectPartner) {
      onSelectPartner(prevId);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pt-1 pb-28 animate-fadeIn select-none font-sans text-slate-900">
      {/* Toast Alert Banner */}
      {claimToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#16a34a] text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold border border-white/40 flex items-center justify-center gap-2 animate-fadeIn max-w-[90vw] truncate">
          <Sparkles size={16} />
          <span className="truncate">{claimToast}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={16} className="text-[#0098ea]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0098ea] font-black text-[10px] uppercase tracking-wider">
            {partner.acronym}
          </span>
          <span className="text-xs font-black uppercase text-slate-900 truncate max-w-[180px]">
            Partner Detail
          </span>
        </div>

        {/* Index counter */}
        <span className="text-[11px] font-mono font-bold text-slate-500">
          {activeIndex + 1} / {VERIFIED_ADS_PARTNERS.length}
        </span>
      </div>

      {/* Main Hero Card with Centered Logo */}
      <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm relative overflow-hidden space-y-5 text-center">

        {/* Official Verified Institution Badge */}
        <div className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold tracking-wide">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>ស្ថាប័នផ្លូវការដែលបានផ្ទៀងផ្ទាត់ (Official Verified Partner)</span>
        </div>

        {/* Centered Logo Container */}
        <div className="flex items-center justify-center py-2">
          <div className="w-36 h-36 rounded-[32px] bg-slate-50 border-2 border-slate-100 shadow-md flex items-center justify-center p-3 relative group transition-transform duration-300 ease-out hover:scale-105">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={`/ads/${partner.filename}`}
                alt={partner.nameEn}
                fill
                sizes="144px"
                className="object-contain filter drop-shadow-sm p-1 select-none pointer-events-none"
                priority
              />
            </div>
          </div>
        </div>

        {/* Institution Full Names (Khmer & English) */}
        <div className="space-y-1.5 max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {partner.nameKm}
          </h1>
          <h2 className="text-xs sm:text-sm font-bold text-slate-500 tracking-wide">
            {partner.nameEn}
          </h2>
          <span className="inline-block mt-1 text-[11px] font-black text-[#0098ea] uppercase tracking-wider bg-sky-50 border border-sky-200 px-4 py-1 rounded-full">
            {partner.sectorKm} • {partner.sectorEn}
          </span>
        </div>

        {/* Authentic Institutional Overview */}
        <div className="bg-slate-50 rounded-[32px] p-5 border border-slate-200 text-left space-y-3">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
              អំពីស្ថាប័ន (Overview & Mandate)
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {partner.descriptionKm}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/80">
            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              {partner.descriptionEn}
            </p>
          </div>
        </div>

        {/* Key Digital Services & Community Missions (+PTS Rewards) */}
        <div className="space-y-2.5 text-left">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              សេវាសាធារណៈ & កិច្ចសហការ (+PTS)
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Claim to Vault</span>
          </div>

          <div className="space-y-2">
            {partner.keyServices.map((svc, idx) => {
              const isClaimed = claimedServices[`${partner.id}-${idx}`];
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-[28px] bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs flex items-center justify-between gap-2 transition-all duration-300 ease-out"
                >
                  <div className="min-w-0 flex-1 ml-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {svc.titleKm}
                    </h4>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {svc.titleEn}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleClaimService(idx, svc.ptsReward, svc.titleKm)}
                    disabled={isClaimed}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1 transition-all duration-300 ease-out cursor-pointer active:scale-95 ${
                      isClaimed
                        ? "bg-emerald-100 text-emerald-700 cursor-default"
                        : "bg-[#0098ea] hover:bg-[#0088cc] text-white shadow-2xs"
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <Check size={14} />
                        <span>Claimed</span>
                      </>
                    ) : (
                      <>
                        <span>+{svc.ptsReward} PTS</span>
                        <ArrowUpRight size={12} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Partner Navigation Switcher: [ Previous | Next ] */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={handlePrev}
            className="py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ease-out cursor-pointer active:scale-95"
          >
            <ChevronLeft size={16} />
            <span>ដៃគូមុន (Previous)</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ease-out cursor-pointer active:scale-95"
          >
            <span>ដៃគូបន្ទាប់ (Next)</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Exit Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors duration-300 ease-out cursor-pointer active:scale-98"
        >
          Exit to Home View
        </button>
      </div>

      {/* Brand Footer */}
      <BrandFooter height={16} className="mt-4 pb-2" />
    </div>
  );
};
