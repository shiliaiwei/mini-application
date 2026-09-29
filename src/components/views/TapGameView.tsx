"use client";

import React, { useState, useMemo } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  ChevronLeft,
  Copy,
  ScanLine,
} from "@/components/icons/KeylineIcons";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { BanknoteCreditCards } from "@/components/cards/BanknoteCreditCards";
import { BrandStatsQuadGrid } from "@/components/cards/BrandStatsQuadGrid";
import { SecureTransferLedgerProduct } from "@/components/cards/SecureTransferLedgerProduct";
import { BinanceWalletQrCard } from "@/components/cards/BinanceWalletQrCard";
import { NavCategory } from "@/components/navigation/CategoryBar";

type TapSubView = "none" | "scan" | "receive" | "withdraw";

interface TapGameViewProps {
  score: number;
  spendSeconds?: number;
  tapPower?: number;
  showBalances?: boolean;
  onToggleBalances?: () => void;
  onAddScore?: (amount: number) => void;
  onGoToSwap?: () => void;
  onGoToEarn?: () => void;
  onGoToSettings?: () => void;
  onSelectCategory?: (cat: NavCategory) => void;
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
}

export const TapGameView: React.FC<TapGameViewProps> = React.memo(({
  score,
  spendSeconds = 0,
  tapPower = 1,
  onAddScore,
  onGoToSwap,
  onGoToEarn,
  showBalances,
  onToggleBalances,
  user,
  tgApp,
}) => {
  const [subView, setSubView] = useState<TapSubView>("none");
  const [showLocalBalances, setShowLocalBalances] = useState(true);
  const userVaultAddress = useMemo(() => {
    if (!user?.id) return "WC8bcd8e5fad2846e593206977e38aedbaafd4ef16";
    const hex = Math.abs(user.id).toString(16).padStart(8, "0");
    return `WC${hex}5fad2846e593206977e38aedbaafd4ef16`.slice(0, 42);
  }, [user?.id]);

  // ==============================================================
  // FULL PAGE SPA SUBVIEW: SCAN | RECEIVE (ONLY QRCODE) | WITHDRAW
  // ==============================================================
  if (subView !== "none") {
    return (
      <div className="w-full max-w-xl mx-auto space-y-4 pt-1 pb-28 animate-fadeIn select-none font-sans text-white px-1">
        {/* TOP NAVIGATION & 3-WAY SEGMENTED CONTROL: SCAN | RECEIVE | WITHDRAW */}
        <div className="flex items-center justify-between py-2 border-b border-white/10 mb-3 gap-2">
          <button
            type="button"
            onClick={() => {
              tgApp?.HapticFeedback?.selectionChanged?.();
              setSubView("none");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <ChevronLeft size={16} className="text-cyan-300" />
            <span>Back</span>
          </button>

          {/* 3-Tab Segment */}
          <div className="flex items-center p-1 rounded-full bg-slate-900/90 border border-white/15 shadow-inner">
            <button
              type="button"
              onClick={() => {
                tgApp?.HapticFeedback?.selectionChanged?.();
                setSubView("scan");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                subView === "scan"
                  ? "bg-[#0098ea] text-white shadow-[0_0_12px_rgba(0,152,234,0.5)] border border-cyan-300/40"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <ScanLine size={14} />
              <span>SCAN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                tgApp?.HapticFeedback?.selectionChanged?.();
                setSubView("receive");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                subView === "receive"
                  ? "bg-[#10b981] text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-300/40"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <ArrowDownLeft size={14} />
              <span>RECEIVE</span>
            </button>
            <button
              type="button"
              onClick={() => {
                tgApp?.HapticFeedback?.selectionChanged?.();
                setSubView("withdraw");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                subView === "withdraw"
                  ? "bg-[#a855f7] text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] border border-purple-300/40"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <ArrowUpRight size={14} />
              <span>WITHDRAW</span>
            </button>
          </div>
        </div>

        {/* 1. SCAN TAB */}
        {subView === "scan" && (
          <div className="rounded-[32px] p-6 text-white border border-white/15 shadow-xl space-y-4 text-center bg-radial from-[#1e1136] via-[#120722] to-[#0a0314] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-200">
                Camera QR Scanner
              </span>
              <span className="text-xs text-white/60 font-mono">
                Auto-Detection Active
              </span>
            </div>

            <div className="w-64 h-64 bg-slate-950/90 rounded-3xl mx-auto flex flex-col items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_4px_16px_rgba(0,0,0,0.8)]">
              <div className="w-48 h-48 border-2 border-dashed border-[#0098ea] rounded-[28px] flex items-center justify-center relative">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#0098ea] to-transparent animate-pulse shadow-[0_0_10px_#0098ea]" />
              </div>
              <span className="text-[11px] text-cyan-200/80 font-mono mt-3">
                Align QR Code in frame
              </span>
            </div>

            <p className="text-xs text-white/70 max-w-xs mx-auto">
              Scan KHQR, Bakong, or SHILIAIWEI Web3 peer-to-peer wallet addresses for instant transfer.
            </p>

            <button
              type="button"
              onClick={() => {
                tgApp?.HapticFeedback?.selectionChanged?.();
                setSubView("withdraw");
              }}
              className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-98 transition-all"
            >
              Or Enter Address Manually in Withdraw
            </button>
          </div>
        )}

        {/* 2. RECEIVE TAB - REAL BINANCE-STYLE FRAMELESS CRYPTO QR DEPOSIT */}
        {subView === "receive" && (
          <BinanceWalletQrCard
            address={userVaultAddress}
            currency="WEI"
            tgApp={tgApp}
            onOpenWithdraw={() => {
              tgApp?.HapticFeedback?.selectionChanged?.();
              setSubView("withdraw");
            }}
          />
        )}

        {/* 3. WITHDRAW TAB - SECURE TRANSFER PRODUCT */}
        {subView === "withdraw" && (
          <div className="animate-fadeIn">
            <SecureTransferLedgerProduct
              score={score}
              user={user}
              tgApp={tgApp}
              onTransferSuccess={(amount) => {
                onAddScore?.(-amount);
              }}
              onOpenScan={() => setSubView("scan")}
            />
          </div>
        )}

        {/* Footer */}
        <BrandFooter height={16} className="mt-4 pb-2" />
      </div>
    );
  }

  // ==============================================================
  // MAIN HOME VIEW (DEFAULT)
  // ==============================================================
  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100dvh-150px)] pb-28 select-none font-sans text-slate-900 max-w-xl mx-auto w-full px-1">
      <div className="w-full space-y-3.5 pt-1">
        {/* 1. DUAL KHMER & DOLLAR BANKNOTE CREDIT CARDS */}
        <BanknoteCreditCards
          score={score}
          showBalance={showBalances !== undefined ? showBalances : showLocalBalances}
          onToggleBalance={onToggleBalances || (() => {
            setShowLocalBalances(!showLocalBalances);
            tgApp?.HapticFeedback?.selectionChanged?.();
          })}
          user={user}
          tgApp={tgApp}
          onOpenDeposit={onGoToEarn}
          onOpenSend={() => setSubView("withdraw")}
          onOpenSwap={onGoToSwap}
          onOpenScan={() => setSubView("scan")}
          onOpenReceive={() => setSubView("receive")}
        />

        {/* 2. STATS 4-BLOCK BRAND CARDS (WEI COIN, US DOLLAR, TAP POWER, PLAY TIME) */}
        <BrandStatsQuadGrid
          score={score}
          spendSeconds={spendSeconds}
          tapPower={tapPower}
          showBalance={showBalances !== undefined ? showBalances : showLocalBalances}
        />

        {/* 3. Brand Footer for screen consistency */}
        <BrandFooter height={16} className="mt-4 pb-2" />
      </div>
    </div>
  );
});

TapGameView.displayName = "TapGameView";
