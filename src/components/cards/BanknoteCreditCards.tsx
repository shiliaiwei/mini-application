"use client";

import React from "react";
import { Eye, EyeOff } from "@/components/icons/KeylineIcons";

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
        onClick={onToggleBalance}
        className="relative w-full h-[104px] rounded-2xl overflow-hidden border border-amber-300/40 flex items-center justify-between px-5 sm:px-6 cursor-pointer active:scale-[0.99] transition-all"
        style={{
          background:
            "linear-gradient(135deg, #c28b10 0%, #d9a01c 45%, #b88107 100%)",
          filter: "none",
        }}
        title="Click to toggle balance visibility"
      >
        {/* Left Side: Crisp Currency Icon Badge + Info */}
        <div className="flex items-center gap-3.5 z-10 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black text-white leading-none">
              ៛
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-white tracking-tight leading-tight truncate">
              Khmer Riel
            </span>
            <span className="text-[11px] font-semibold text-amber-100/85 tracking-wider uppercase">
              KHR • Wallet
            </span>
          </div>
        </div>

        {/* Right Side: Eye Toggle + Large Crisp Balance */}
        <div className="flex flex-col items-end justify-center text-right z-10 flex-shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-100/80 mb-0.5">
            <span>{showBalance ? "Hide" : "Show"}</span>
            {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-amber-200">
              ៛
            </span>
            <span>{showBalance ? khrBalance : "••••••"}</span>
          </div>
        </div>
      </div>

      {/* 2. US DOLLAR CARD (BELOW RIEL) */}
      <div
        onClick={onToggleBalance}
        className="relative w-full h-[104px] rounded-2xl overflow-hidden border border-blue-400/40 flex items-center justify-between px-5 sm:px-6 cursor-pointer active:scale-[0.99] transition-all"
        style={{
          background:
            "linear-gradient(135deg, #163d72 0%, #1e529a 45%, #133463 100%)",
          filter: "none",
        }}
        title="Click to toggle balance visibility"
      >
        {/* Left Side: Crisp Currency Icon Badge + Info */}
        <div className="flex items-center gap-3.5 z-10 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black text-white leading-none">
              $
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-white tracking-tight leading-tight truncate">
              US Dollar
            </span>
            <span className="text-[11px] font-semibold text-sky-100/85 tracking-wider uppercase">
              USD • Wallet
            </span>
          </div>
        </div>

        {/* Right Side: Eye Toggle + Large Crisp Balance */}
        <div className="flex flex-col items-end justify-center text-right z-10 flex-shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-medium text-sky-100/80 mb-0.5">
            <span>{showBalance ? "Hide" : "Show"}</span>
            {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-sky-200">
              $
            </span>
            <span>{showBalance ? usdBalance : "••••••"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
