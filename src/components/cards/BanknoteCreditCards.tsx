"use client";

import React from "react";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";

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
        className="relative w-full h-[120px] rounded-2xl overflow-hidden border border-[#d4af37]/40 shadow-md shadow-amber-950/15 flex items-center justify-between px-5 sm:px-6"
        style={{
          background:
            "linear-gradient(135deg, #7c5810 0%, #b88a22 25%, #dfb743 50%, #af821a 75%, #6e4905 100%)",
        }}
      >
        {/* Banknote Guilloche Mesh fitted across entire card */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-45 mix-blend-overlay"
          style={{
            backgroundImage: "url('/backgrounds/cardbanknote.svg')",
          }}
        />

        {/* CENTER: Currency Sign for Khmer Riel */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none select-none">
          <span
            className="text-[88px] font-black leading-none text-white/30 select-none"
            style={{ fontFamily: "var(--font-faculty-glyphic), serif" }}
          >
            ៛
          </span>
        </div>

        {/* Left Side: Brand Wordmark */}
        <div className="relative z-20 flex items-center justify-center">
          <ShiliaiweiBrand variant="wordmark" height={20} colorScheme="white" />
        </div>

        {/* Right Side: Riel Balance */}
        <div
          onClick={onToggleBalance}
          className="relative z-20 flex flex-col items-end justify-center text-right cursor-pointer group/bal"
          title="Click to toggle balance visibility"
        >
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono drop-shadow-sm group-hover/bal:opacity-90 transition-opacity">
            {showBalance ? `៛ ${khrBalance}` : "៛ ••••••"}
          </span>
        </div>
      </div>

      {/* 2. US DOLLAR CARD (BELOW RIEL) */}
      <div
        className="relative w-full h-[120px] rounded-2xl overflow-hidden border border-cyan-400/30 shadow-md shadow-blue-950/30 flex items-center justify-between px-5 sm:px-6"
        style={{
          background:
            "linear-gradient(135deg, #071526 0%, #0d2644 30%, #153c66 55%, #0a1b30 85%, #050d18 100%)",
        }}
      >
        {/* Banknote Guilloche Mesh fitted across entire card */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 mix-blend-screen"
          style={{
            backgroundImage: "url('/backgrounds/cardbanknote.svg')",
          }}
        />

        {/* CENTER: Currency Sign for US Dollar */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none select-none">
          <span
            className="text-[88px] font-black leading-none text-white/25 select-none"
            style={{ fontFamily: "var(--font-faculty-glyphic), serif" }}
          >
            $
          </span>
        </div>

        {/* Left Side: Brand Wordmark */}
        <div className="relative z-20 flex items-center justify-center">
          <ShiliaiweiBrand variant="wordmark" height={20} colorScheme="white" />
        </div>

        {/* Right Side: Dollar Balance */}
        <div
          onClick={onToggleBalance}
          className="relative z-20 flex flex-col items-end justify-center text-right cursor-pointer group/bal"
          title="Click to toggle balance visibility"
        >
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono drop-shadow-sm group-hover/bal:opacity-90 transition-opacity">
            {showBalance ? `$ ${usdBalance}` : "$ ••••••"}
          </span>
        </div>
      </div>
    </div>
  );
};
