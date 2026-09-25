"use client";

import React from "react";

interface BanknoteCreditCardsProps {
  score: number;
  showBalance?: boolean;
  onToggleBalance?: () => void;
  user?: any;
  tgApp?: any;
  onOpenDeposit?: () => void;
  onOpenSend?: () => void;
  onOpenSwap?: () => void;
  onOpenAddress?: () => void;
}

export const BanknoteCreditCards: React.FC<BanknoteCreditCardsProps> = ({
  score,
  showBalance = true,
  onToggleBalance,
}) => {
  // Exchange calculations: 100 PTS = $1.00 USD = 4,100 KHR
  const khrBalance = Math.floor(score * 41).toLocaleString();
  const usdBalance = (score / 100).toFixed(2);

  return (
    <div className="w-full flex flex-col space-y-2.5 select-none">
      {/* 1. KHMER RIEL CARD (FIRST) */}
      <div
        className="relative w-full h-[120px] rounded-2xl overflow-hidden border border-[#b88a22]/30 shadow-md shadow-amber-950/15 flex items-center justify-between px-5 sm:px-6"
        style={{
          background:
            "linear-gradient(135deg, #6b4a0c 0%, #7d5711 35%, #885f14 50%, #7d5711 65%, #5c3e07 100%)",
        }}
      >
        {/* Banknote Guilloche Mesh fitted across entire card */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: "url('/backgrounds/cardbanknote.svg')",
          }}
        />

        {/* CENTER: Currency Sign for Khmer Riel (Significantly enlarged, crisp vector gray, zero blur) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none select-none">
          <span
            className="text-[128px] font-black leading-none text-slate-300/25 select-none"
            style={{
              fontFamily: "var(--font-faculty-glyphic), serif",
              filter: "none",
            }}
          >
            ៛
          </span>
        </div>

        {/* Left Side: Empty spacer */}
        <div className="relative z-20" />

        {/* Right Side: Riel Balance with prominent large Khmer sign */}
        <div
          onClick={onToggleBalance}
          className="relative z-20 flex flex-col items-end justify-center text-right cursor-pointer group/bal"
          title="Click to toggle balance visibility"
        >
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono drop-shadow-sm group-hover/bal:opacity-90 transition-opacity flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-200/95 leading-none">
              ៛
            </span>
            <span>{showBalance ? khrBalance : "••••••"}</span>
          </span>
        </div>
      </div>

      {/* 2. US DOLLAR CARD (BELOW RIEL) */}
      <div
        className="relative w-full h-[120px] rounded-2xl overflow-hidden border border-blue-900/40 shadow-md shadow-blue-950/20 flex items-center justify-between px-5 sm:px-6"
        style={{
          background:
            "linear-gradient(135deg, #051323 0%, #091e36 35%, #0d2847 50%, #091e36 65%, #040e1b 100%)",
        }}
      >
        {/* Banknote Guilloche Mesh fitted across entire card */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-35 mix-blend-screen"
          style={{
            backgroundImage: "url('/backgrounds/cardbanknote.svg')",
          }}
        />

        {/* CENTER: Currency Sign for US Dollar (Crisp vector gray, zero blur) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none select-none">
          <span
            className="text-[104px] font-black leading-none text-slate-300/25 select-none"
            style={{
              fontFamily: "var(--font-faculty-glyphic), serif",
              filter: "none",
            }}
          >
            $
          </span>
        </div>

        {/* Left Side: Empty spacer */}
        <div className="relative z-20" />

        {/* Right Side: Dollar Balance */}
        <div
          onClick={onToggleBalance}
          className="relative z-20 flex flex-col items-end justify-center text-right cursor-pointer group/bal"
          title="Click to toggle balance visibility"
        >
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono drop-shadow-sm group-hover/bal:opacity-90 transition-opacity flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-200/95 leading-none">
              $
            </span>
            <span>{showBalance ? usdBalance : "••••••"}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
