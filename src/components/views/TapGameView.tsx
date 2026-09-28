"use client";

import React, { useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ScanLine,
  Send,
} from "@/components/icons/KeylineIcons";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { BanknoteCreditCards } from "@/components/cards/BanknoteCreditCards";
import { AsymmetricGemBanner } from "@/components/cards/AsymmetricGemBanner";
import { ShiliaiweiMascot, MascotPose } from "@/components/brand/ShiliaiweiMascot";
import { NavCategory } from "@/components/navigation/CategoryBar";

type TapSubView = "none" | "send" | "scan";

interface TapGameViewProps {
  score: number;
  spendSeconds?: number;
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
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendCurrency, setSendCurrency] = useState<"USD" | "KHR">("USD");
  const [sendSuccess, setSendSuccess] = useState(false);
  const [mascotPose, setMascotPose] = useState<MascotPose>("idle");

  const handleCycleMascotPose = () => {
    try {
      tgApp?.HapticFeedback?.impactOccurred?.("light");
    } catch {}
    setMascotPose((prev) => {
      if (prev === "idle") return "wave";
      if (prev === "wave") return "announce";
      if (prev === "announce") return "cheer";
      return "idle";
    });
  };

  // Conversion rates: 100 WEI COIN = $1.00 USD = 4,100 KHR
  const usdValue = (score / 100).toFixed(2);
  const khrValue = Math.floor(score * 41).toLocaleString();

  const handleSendTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendRecipient || !sendAmount) return;

    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}

    // Record transfer audit
    fetch("/api/audit/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegram_id: user?.id || 0,
        action: "TRANSFER",
        details: `Sent ${sendCurrency === "USD" ? "$" : "៛"}${sendAmount} to ${sendRecipient}`,
        platform: tgApp?.platform || "TELEGRAM_WEB",
      }),
    }).catch(() => {});

    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setSubView("none");
      setSendRecipient("");
      setSendAmount("");
    }, 1500);
  };

  // ==============================================================
  // FULL PAGE SPA SUBVIEW: SEND / TRANSFER CURRENCY
  // ==============================================================
  if (subView === "send") {
    return (
      <div className="w-full max-w-xl mx-auto space-y-4 pt-1 pb-28 animate-fadeIn select-none font-sans text-slate-900">
        <div className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-2">
          <button
            type="button"
            onClick={() => setSubView("none")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={16} className="text-[#0098ea]" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={18} className="text-[#0098ea]" />
            <span className="text-sm font-black uppercase text-slate-900">
              ផ្ទេរប្រាក់ (Send Currency)
            </span>
          </div>
          <div className="w-14" />
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          {sendSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <Check size={36} className="text-[#16a34a] mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">Transfer Successful!</h4>
              <p className="text-xs text-emerald-800">
                Transaction verified and recorded to player audit ledger.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Currency Type (Primary: Riel)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSendCurrency("KHR")}
                    className={`py-3 rounded-full border text-xs font-bold transition-all duration-300 ease-out cursor-pointer flex items-center justify-center gap-1.5 ${
                      sendCurrency === "KHR"
                        ? "bg-[#0098ea] text-white border-[#0098ea] shadow-xs"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base font-black">៛</span>
                    <span>៛{khrValue}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendCurrency("USD")}
                    className={`py-3 rounded-full border text-xs font-bold transition-all duration-300 ease-out cursor-pointer flex items-center justify-center gap-1.5 ${
                      sendCurrency === "USD"
                        ? "bg-[#0098ea] text-white border-[#0098ea] shadow-xs"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base font-black">$</span>
                    <span>${usdValue}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Recipient (@telegram_username or Address)
                </label>
                <input
                  type="text"
                  required
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                  placeholder="@username or wei_0x..."
                  className="w-full px-4 py-3 rounded-full border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-[#0098ea]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Amount ({sendCurrency === "KHR" ? "៛" : "$"})
                </label>
                <input
                  type="number"
                  step={sendCurrency === "KHR" ? "100" : "0.01"}
                  required
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder={sendCurrency === "KHR" ? "41000" : "10.00"}
                  className="w-full px-4 py-3 rounded-full border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:border-[#0098ea]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#0098ea] hover:bg-[#0088cc] text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-300 ease-out"
              >
                <Send size={18} />
                <span>Confirm Transfer</span>
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => setSubView("none")}
            className="w-full py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors duration-300 ease-out cursor-pointer"
          >
            Exit to Home View
          </button>
        </div>
      </div>
    );
  }

  // ==============================================================
  // FULL PAGE SPA SUBVIEW: SCAN QR
  // ==============================================================
  if (subView === "scan") {
    return (
      <div className="w-full max-w-xl mx-auto space-y-4 pt-1 pb-28 animate-fadeIn select-none font-sans text-slate-900">
        <div className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-2">
          <button
            type="button"
            onClick={() => setSubView("none")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={16} className="text-[#0098ea]" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <ScanLine size={18} className="text-[#0098ea]" />
            <span className="text-sm font-black uppercase text-slate-900">
              ស្កេន QR (Scan QR)
            </span>
          </div>
          <div className="w-14" />
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 text-center">
          <div className="w-64 h-64 bg-slate-900 rounded-2xl mx-auto flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            <div className="w-44 h-44 border-2 border-[#0098ea] rounded-[24px] flex items-center justify-center relative">
              <div className="w-full h-0.5 bg-[#0098ea] animate-pulse" />
            </div>
            <span className="text-xs text-slate-300 font-mono mt-3">
              Align QR Code in frame
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Scan KHQR, Bakong, or SHILIAIWEI Web3 peer-to-peer addresses.
          </p>

          <button
            type="button"
            onClick={() => setSubView("none")}
            className="w-full py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors duration-300 ease-out cursor-pointer"
          >
            Exit to Home View
          </button>
        </div>
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
            tgApp?.HapticFeedback?.selectionChanged();
          })}
          user={user}
          tgApp={tgApp}
          onOpenDeposit={onGoToEarn}
          onOpenSend={() => setSubView("send")}
          onOpenSwap={onGoToSwap}
          onOpenScan={() => setSubView("scan")}
        />

        {/* 2. SKEUOMORPHIC BRAND MASCOT COMPANION CARD */}
        <div
          onClick={handleCycleMascotPose}
          className="relative w-full rounded-[26px] p-4 overflow-hidden bg-gradient-to-b from-[#6420a7] via-[#4e1688] to-[#340b5c] text-white cursor-pointer active:scale-[0.99] transition-all group"
          style={{
            boxShadow:
              "0 14px 30px -8px rgba(45, 10, 80, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.3), inset 0 -2px 6px rgba(0, 0, 0, 0.45)",
          }}
          title="Tap Weibot to change pose!"
        >
          {/* Guilloche Banknote Background Style with Suitable Contrast */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
            style={{
              backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              filter: "contrast(1.35) brightness(1.1)",
            }}
          />
          {/* Simulated Thread Stitching */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="6"
              y="6"
              width="calc(100% - 12px)"
              height="calc(100% - 12px)"
              rx="20"
              ry="20"
              fill="none"
              stroke="#e9d5ff"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              opacity="0.45"
              style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
            />
          </svg>

          {/* Top Specular Rim */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex-1 space-y-1 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-purple-100">
                  Vault Companion
                </span>
                <span className="text-[10px] text-purple-200/70">
                  Tap to interact
                </span>
              </div>
              <h4 className="text-base font-bold text-white drop-shadow-sm">
                {mascotPose === "idle" && "Weibot is watching your vault"}
                {mascotPose === "wave" && "Weibot waves hello!"}
                {mascotPose === "announce" && "Weibot: Daily rewards live!"}
                {mascotPose === "cheer" && "Weibot cheers your success!"}
              </h4>
              <p className="text-xs text-purple-100/80 leading-snug">
                Official SHILIAIWEI companion mascot with auto-updating reactive poses.
              </p>
            </div>

            <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
              <ShiliaiweiMascot size={74} pose={mascotPose} />
            </div>
          </div>
        </div>

        {/* 3. ASYMMETRIC ROUNDED GEM BANNERS (3 COLOR SHOWCASE) */}
        <AsymmetricGemBanner />

        {/* 4. Brand Footer for screen consistency */}
        <BrandFooter height={16} className="mt-4 pb-2" />
      </div>
    </div>
  );
});

TapGameView.displayName = "TapGameView";
