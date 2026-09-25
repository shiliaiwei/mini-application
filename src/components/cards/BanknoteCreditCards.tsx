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
        className="relative w-full h-[120px] rounded-2xl overflow-hidden border border-[#d4a017]/40 shadow-md shadow-amber-800/20 flex items-center justify-between px-5 sm:px-6"
        style={{
          background:
            "linear-gradient(135deg, #b8860b 0%, #c9960e 30%, #d4a832 50%, #c9960e 70%, #a87809 100%)",
        }}
      >
        {/* Banknote Guilloche Mesh — no blend mode, pure opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: "url('/backgrounds/cardbanknote.svg')",
            opacity: 0.18,
          }}
        />

        {/* CENTER: Currency Sign — warm amber-gold, no gray/white */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none select-none">
          <span
            className="text-[128px] font-black leading-none select-none"
            style={{
              fontFamily: "var(--font-faculty-glyphic), serif",
              color: "rgba(255, 220, 80, 0.28)",
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
        className="relative w-full h-[120px] rounded-2xl overflow-hidden border border-blue-500/30 shadow-md shadow-blue-900/20 flex items-center justify-between px-5 sm:px-6"
        style={{
          background:
            "linear-gradient(135deg, #1a3a6c 0%, #1e4d8c 30%, #2460a8 50%, #1e4d8c 70%, #163264 100%)",
        }}
      >
        {/* Banknote Guilloche Mesh — no blend mode, pure opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: "url('/backgrounds/cardbanknote.svg')",
            opacity: 0.15,
          }}
        />

        {/* CENTER: Currency Sign — steel-blue native tone, no gray/white */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none select-none">
          <span
            className="text-[104px] font-black leading-none select-none"
            style={{
              fontFamily: "var(--font-faculty-glyphic), serif",
              color: "rgba(147, 210, 255, 0.28)",
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
