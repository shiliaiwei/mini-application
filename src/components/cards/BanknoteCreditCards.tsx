"use client";

import React, { useState } from "react";
import {
  Repeat,
  Send,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "@/components/icons/KeylineIcons";

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
  user,
  tgApp,
  onOpenSend,
  onOpenSwap,
  onOpenAddress,
}) => {
  const [copied, setCopied] = useState(false);

  // Conversion calculations: 100 PTS = $1.00 USD = 4,100 KHR
  const khrBalance = Math.floor(score * 41).toLocaleString();
  const usdBalance = (score / 100).toFixed(2);

  const walletAddress = user?.id
    ? `wei_0x${Number(user.id).toString(16).padStart(8, "0")}...${String(user.id).slice(-4)}`
    : "wei_0x78a19bc3...82f1";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full select-none">
      {/* 1. OUTER ROUNDED CONTAINER */}
      <div className="w-full rounded-[32px] p-2 sm:p-2.5 bg-gradient-to-b from-slate-100/90 via-white/80 to-slate-200/70 border border-slate-200/90 shadow-md shadow-slate-900/5">
        {/* 2. INNER GLASSMORPHISM FINANCIAL CARD */}
        <div className="relative w-full rounded-[26px] p-5 sm:p-6 overflow-hidden border border-white/80 bg-gradient-to-br from-white/95 via-sky-50/60 to-blue-50/40 backdrop-blur-xl shadow-inner flex flex-col justify-between">
          {/* Banknote Guilloche Mesh: Top 20% opacity, fading symmetrically to bottom for white contrast */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20"
            style={{
              backgroundImage: "url('/backgrounds/cardbanknote.svg')",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
            }}
          />

          {/* Bottom Symmetrical Premium White Contrast Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none" />

          {/* TOP BAR: Wallet Address */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            {/* Wallet Address Chip */}
            <div
              onClick={onOpenAddress || handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-2xs hover:bg-white active:scale-95 transition-all cursor-pointer group"
              title="Click to view/copy address"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-xs font-mono font-semibold text-slate-700 truncate max-w-[140px] sm:max-w-[180px]">
                {walletAddress}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy wallet address"
                className="text-slate-400 group-hover:text-slate-700 transition-colors ml-0.5 flex-shrink-0 cursor-pointer"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>

          {/* CENTER: Large Currency Balance */}
          <div className="relative z-10 my-4 sm:my-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span>Total Balance</span>
              <button
                type="button"
                onClick={onToggleBalance}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title={showBalance ? "Hide Balance" : "Show Balance"}
                aria-label={showBalance ? "Hide Balance" : "Show Balance"}
              >
                {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans">
                {showBalance ? `$${usdBalance}` : "••••••••"}
              </span>
              <span className="text-xs font-black text-slate-400 uppercase">
                USD
              </span>
            </div>

            {/* Secondary Dual Currency (Khmer Riel) */}
            <div className="text-xs font-bold text-amber-700 font-mono mt-1.5 flex items-center gap-1">
              <span className="font-extrabold text-sm text-amber-600">៛</span>
              <span>{showBalance ? `${khrBalance} KHR` : "••••••"}</span>
            </div>
          </div>



          {/* DUAL BOTTOM ACTION BUTTONS: SWAP & SEND */}
          <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-200/70 mt-1">
            <button
              type="button"
              onClick={onOpenSwap}
              className="py-3 px-4 rounded-2xl bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 shadow-2xs hover:shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider cursor-pointer group"
            >
              <Repeat
                size={16}
                className="text-emerald-600 group-hover:rotate-180 transition-transform duration-300"
              />
              <span>Swap</span>
            </button>

            <button
              type="button"
              onClick={onOpenSend}
              className="py-3 px-4 rounded-2xl bg-[#0098ea] hover:bg-[#0088cc] text-white shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              <Send size={16} className="text-white" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
