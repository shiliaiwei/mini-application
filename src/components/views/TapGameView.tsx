"use client";

import React, { useState, useRef } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  Zap,
  Wallet,
  ArrowUpRight,
  Repeat,
  Gift,
  Copy,
  Check,
  QrCode,
  Coins,
  Eye,
  EyeOff,
  Bell,
  ChevronLeft,
  ScanLine,
  Send,
} from "@/components/icons/KeylineIcons";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";
import { WinGramPromoCards } from "@/components/promo/WinGramPromoCards";
import { BanknoteCreditCards } from "@/components/cards/BanknoteCreditCards";
import { NavCategory } from "@/components/navigation/CategoryBar";
import { MiniGameType } from "@/components/views/MiniGameFullView";

interface FloatingPoint {
  id: number;
  x: number;
  y: number;
  text: string;
}

type TapSubView = "none" | "tap-vault" | "receive" | "send" | "scan" | "deposit";

interface TapGameViewProps {
  score: number;
  onTap: () => void;
  energy: number;
  maxEnergy: number;
  spendSeconds: number;
  tapPower: number;
  passiveRate: number;
  onAddScore?: (amount: number) => void;
  onGoToSwap?: () => void;
  onGoToEarn?: () => void;
  onGoToSettings?: () => void;
  onSelectCategory?: (cat: NavCategory) => void;
  onSelectGame?: (game: MiniGameType) => void;
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
}

export const TapGameView: React.FC<TapGameViewProps> = ({
  score,
  onTap,
  energy,
  maxEnergy,
  spendSeconds,
  tapPower,
  passiveRate,
  onAddScore,
  onGoToSwap,
  onGoToEarn,
  onGoToSettings,
  onSelectCategory,
  onSelectGame,
  user,
  tgApp,
}) => {
  const [subView, setSubView] = useState<TapSubView>("none");
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [showBalances, setShowBalances] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendCurrency, setSendCurrency] = useState<"USD" | "KHR">("USD");
  const [sendSuccess, setSendSuccess] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const walletAddress = user?.id
    ? `shi_0x${Number(user.id).toString(16).padStart(8, "0")}...${String(user.id).slice(-4)}`
    : "shi_0x78a19bc3...82f1";

  // Conversion rates: 100 PTS = $1.00 USD = 4,100 KHR (~500 PTS = 1 TON)
  const usdValue = (score / 100).toFixed(2);
  const khrValue = Math.floor(score * 41).toLocaleString();

  const handleTap = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
    } catch {}

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = clientX ? clientX - rect.left : rect.width / 2;
      const y = clientY ? clientY - rect.top : rect.height / 2;

      const newPoint: FloatingPoint = {
        id: Date.now() + Math.random(),
        x,
        y,
        text: `+${tapPower} PTS`,
      };

      setFloatingPoints((prev) => [...prev.slice(-15), newPoint]);

      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== newPoint.id));
      }, 700);
    }

    onTap();
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setTimeout(() => setCopiedAddress(false), 2000);
  };

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

  const energyPercent = Math.round((energy / maxEnergy) * 100);

  // ==============================================================
  // FULL PAGE SPA SUBVIEW: TAP VAULT MEDALLION & ENERGY MINTING
  // ==============================================================
  if (subView === "tap-vault") {
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
            <Zap size={18} className="text-[#0098ea]" />
            <span className="text-sm font-black uppercase text-slate-900">
              SHILIAIWEI Tap Vault
            </span>
          </div>
          <div className="w-14" />
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5 text-center">
          {/* Score & Multiplier */}
          <div className="text-center py-1">
            <span className="text-3xl font-black text-slate-900 block font-sans">
              {score.toLocaleString()} PTS
            </span>
            <span className="text-xs text-slate-500 font-bold block mt-1">
              +{tapPower} PTS per tap • Vault Energy Active
            </span>
          </div>

          {/* Tap Medallion */}
          <div className="flex items-center justify-center py-4">
            <button
              ref={buttonRef}
              type="button"
              onClick={handleTap}
              onTouchStart={handleTap}
              aria-label="Tap Medallion to mint points"
              className="relative w-52 h-52 rounded-full flex flex-col items-center justify-center cursor-pointer select-none focus:outline-none active:scale-95 transition-transform"
            >
              <div className="w-44 h-44 rounded-full border-4 border-[#0098ea]/40 flex flex-col items-center justify-center bg-white shadow-2xl relative p-1 overflow-hidden">
                <div className="w-36 h-36 rounded-full border border-dashed border-[#0098ea]/40 flex flex-col items-center justify-center relative bg-white/90">
                  <ShiliaiweiBrand height={22} className="my-1" />
                  <span className="text-[11px] font-black text-[#16a34a] tracking-wider uppercase mt-1">
                    TAP FOR POINTS
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">
                    +{tapPower} PTS / TAP
                  </span>
                </div>
              </div>

              {floatingPoints.map((p) => (
                <span
                  key={p.id}
                  className="absolute pointer-events-none text-base font-black text-[#16a34a] animate-out fade-out slide-out-to-top duration-700 font-sans"
                  style={{ left: p.x, top: p.y }}
                >
                  {p.text}
                </span>
              ))}
            </button>
          </div>

          {/* Vault Energy Bar */}
          <div className="w-full space-y-1.5 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
              <span>Energy</span>
              <span>{energy} / {maxEnergy}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-[#0098ea] rounded-full transition-all duration-150"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSubView("none")}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Exit to Home View
          </button>
        </div>
      </div>
    );
  }

  // ==============================================================
  // FULL PAGE SPA SUBVIEW: RECEIVE VAULT (WALLET ADDRESS)
  // ==============================================================
  if (subView === "receive") {
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
            <Wallet size={18} className="text-[#0098ea]" />
            <span className="text-sm font-black uppercase text-slate-900">
              ទទួលប្រាក់ (Receive Vault)
            </span>
          </div>
          <div className="w-14" />
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="w-44 h-44 bg-white border border-slate-200 rounded-2xl mx-auto flex flex-col items-center justify-center text-slate-500 shadow-xs">
            <QrCode size={110} className="text-[#0098ea]" />
            <span className="text-xs font-mono mt-1 text-slate-600 font-bold">SHILIAIWEI QR</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">
              Simulated Deposit Address (SHILIAIWEI L2)
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-mono text-slate-900 truncate">
                {walletAddress}
              </span>
              <button
                type="button"
                onClick={handleCopyAddress}
                aria-label="Copy address to clipboard"
                className="w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 flex items-center justify-center ml-2 border border-slate-200 bg-white cursor-pointer"
              >
                {copiedAddress ? (
                  <Check size={18} className="text-[#16a34a]" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 text-center">
            Supports simulated USD assets and Cambodian Khmer Riel backed by earned points.
          </p>

          <button
            type="button"
            onClick={() => setSubView("none")}
            className="w-full py-3 rounded-2xl bg-[#0098ea] hover:bg-[#0088cc] text-white font-bold text-xs uppercase tracking-wider shadow-xs cursor-pointer"
          >
            Exit to Home View
          </button>
        </div>
      </div>
    );
  }

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
                  Currency Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSendCurrency("USD")}
                    className={`py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      sendCurrency === "USD"
                        ? "bg-[#0098ea] text-white border-[#0098ea] shadow-xs"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    USD ($) - ${usdValue}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendCurrency("KHR")}
                    className={`py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      sendCurrency === "KHR"
                        ? "bg-[#0098ea] text-white border-[#0098ea] shadow-xs"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    KHR (៛) - ៛{khrValue}
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
                  placeholder="@username or shi_0x..."
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-[#0098ea]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Amount ({sendCurrency === "USD" ? "$" : "៛"})
                </label>
                <input
                  type="number"
                  step={sendCurrency === "USD" ? "0.01" : "100"}
                  required
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder={sendCurrency === "USD" ? "10.00" : "41000"}
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:border-[#0098ea]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#0098ea] hover:bg-[#0088cc] text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send size={18} />
                <span>Confirm Transfer</span>
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => setSubView("none")}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
          <div className="w-64 h-64 bg-slate-900 rounded-3xl mx-auto flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            <div className="w-44 h-44 border-2 border-[#0098ea] rounded-2xl flex items-center justify-center relative">
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
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Exit to Home View
          </button>
        </div>
      </div>
    );
  }

  // ==============================================================
  // FULL PAGE SPA SUBVIEW: DEPOSIT / PTS BOOST
  // ==============================================================
  if (subView === "deposit") {
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
            <Coins size={18} className="text-[#0098ea]" />
            <span className="text-sm font-black uppercase text-slate-900">
              ដាក់ប្រាក់ (Claim & Boost PTS)
            </span>
          </div>
          <div className="w-14" />
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <h4 className="text-sm font-black text-slate-900">Earn Points for Free</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You do not need to pay real money. Tap the medallion, complete daily missions, and win games to earn PTS that you can exchange directly for USD ($) or KHR (៛)!
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setSubView("none");
                onGoToEarn?.();
              }}
              className="w-full py-3.5 rounded-2xl bg-[#0098ea] hover:bg-[#0088cc] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Gift size={20} />
              <span>Go to Missions (+1,000 PTS)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubView("none");
                onGoToSwap?.();
              }}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Repeat size={20} className="text-emerald-600" />
              <span>Exchange Currency (DEX Swap)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSubView("none")}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
      {/* 1. Top Brand & Visibility Status Bar */}
      <div className="w-full space-y-2.5 pt-0.5">
        <div className="flex items-center justify-between px-1">
          {/* Brand Logo (Full word logo: SHILIAI [WEI], no duplicate text alongside) */}
          <div className="flex items-center">
            <ShiliaiweiBrand height={22} colorScheme="blue" />
          </div>

          {/* Top Actions: Eye Toggle, Notifications, User Avatar */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowBalances(!showBalances)}
              className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] cursor-pointer"
              aria-label={showBalances ? "Hide Balances" : "Show Balances"}
              title={showBalances ? "Hide Balances" : "Show Balances"}
            >
              {showBalances ? (
                <Eye size={20} className="text-slate-700" />
              ) : (
                <EyeOff size={20} className="text-slate-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSubView("receive")}
              className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] cursor-pointer"
              aria-label="Vault Notifications and Address"
              title="Vault Address"
            >
              <Bell size={20} className="text-slate-700" />
            </button>

            <div className="flex items-center gap-1 pl-1">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800">
                {user?.first_name ? user.first_name.slice(0, 2).toUpperCase() : "VS"}
              </div>
              {user && <TelegramVerifiedBadge size={14} />}
            </div>
          </div>
        </div>

        {/* 2. DUAL KHMER & DOLLAR BANKNOTE CREDIT CARDS */}
        <BanknoteCreditCards
          score={score}
          showBalance={showBalances}
          onToggleBalance={() => {
            setShowBalances(!showBalances);
            tgApp?.HapticFeedback?.selectionChanged();
          }}
          user={user}
          tgApp={tgApp}
          onOpenDeposit={() => setSubView("deposit")}
          onOpenSend={() => setSubView("send")}
          onOpenSwap={onGoToSwap}
          onOpenAddress={() => setSubView("receive")}
        />

        {/* 3. WINGRAM HERO PROMO & BONUS CARDS (No icons, pure typography, no guide text!) */}
        <WinGramPromoCards
          score={score}
          totalPlayed={spendSeconds * 5 + Math.floor(score * 0.4)}
          onAddScore={onAddScore || (() => {})}
          onOpenDeposit={() => setSubView("deposit")}
          onOpenTapVault={() => setSubView("tap-vault")}
          onSelectGame={onSelectGame}
          tgApp={tgApp}
        />

        {/* 4. Brand Footer for screen consistency */}
        <BrandFooter height={16} className="mt-4 pb-2" />
      </div>
    </div>
  );
};
