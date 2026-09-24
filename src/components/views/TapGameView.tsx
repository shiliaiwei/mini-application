"use client";

import React, { useState, useRef } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  Zap,
  Timer,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  Gift,
  Copy,
  Check,
  X,
  QrCode,
  ShieldCheck,
  Coins,
  Eye,
  EyeOff,
  Bell,
  ChevronRight,
  ScanLine,
  Send,
  Gamepad2,
} from "lucide-react";
import { VLogo } from "@/components/brand/VLogo";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";

interface FloatingPoint {
  id: number;
  x: number;
  y: number;
  text: string;
}

interface TapGameViewProps {
  score: number;
  onTap: () => void;
  energy: number;
  maxEnergy: number;
  spendSeconds: number;
  tapPower: number;
  passiveRate: number;
  onGoToSwap?: () => void;
  onGoToEarn?: () => void;
  onGoToGames?: () => void;
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
  onGoToSwap,
  onGoToEarn,
  onGoToGames,
  user,
  tgApp,
}) => {
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [showBalances, setShowBalances] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendCurrency, setSendCurrency] = useState<"USD" | "KHR">("USD");
  const [sendSuccess, setSendSuccess] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const walletAddress = user?.id
    ? `shi_0x${Number(user.id).toString(16).padStart(8, "0")}...${String(user.id).slice(-4)}`
    : "shi_0x78a19bc3...82f1";

  // Conversion rates: 100 PTS = $1.00 USD = 4,100 KHR
  const usdValue = (score / 100).toFixed(2);
  const khrValue = Math.floor(score * 41).toLocaleString();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

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
      setShowSendModal(false);
      setSendRecipient("");
      setSendAmount("");
    }, 1500);
  };

  const energyPercent = Math.round((energy / maxEnergy) * 100);

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100dvh-170px)] pb-24 select-none font-sans text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* 1. Bakong-Style Top Brand Bar with Visibility Toggle */}
      <div className="w-full space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0098ea] flex items-center justify-center text-white shadow-sm shadow-[#0098ea]/25">
              <VLogo size={20} variant="white" />
            </div>
            <div>
              <span className="font-black text-sm tracking-wider uppercase text-slate-900 font-sans block leading-tight">
                SHILIAIWEI
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                VAULT & CURRENCY
              </span>
            </div>
          </div>

          {/* Top Actions: Eye Toggle, Notifications, User Avatar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBalances(!showBalances)}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-xs"
              title={showBalances ? "Hide Balances" : "Show Balances"}
            >
              {showBalances ? (
                <Eye className="w-4 h-4 text-slate-700" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowAddressModal(true)}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-xs"
              title="Vault Address"
            >
              <Bell className="w-4 h-4 text-slate-700" />
            </button>

            <div className="flex items-center gap-1 pl-1">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800">
                {user?.first_name ? user.first_name.slice(0, 2).toUpperCase() : "VS"}
              </div>
              {user && <TelegramVerifiedBadge size={14} />}
            </div>
          </div>
        </div>

        {/* 2. DUAL BANKNOTE CURRENCY CARDS (Bakong Style) */}
        <div className="space-y-2.5">
          {/* Card 1: Cambodian Khmer Riel (គណនីប្រាក់រៀល) */}
          <div
            onClick={onGoToSwap}
            className="banknote-khr-card rounded-2xl p-4 sm:p-5 border border-purple-200/80 shadow-sm relative overflow-hidden transition-all hover:shadow-md active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-normal font-sans">
                  គណនីប្រាក់រៀល
                </span>
                <span className="text-[10px] text-purple-800/80 font-semibold uppercase tracking-wider">
                  (KHR Account)
                </span>
              </div>
              <span className="text-[10px] font-bold text-purple-700/90 bg-purple-50/80 px-2 py-0.5 rounded-full border border-purple-200/60">
                Official Currency
              </span>
            </div>

            <div className="mt-2.5 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 mr-2 font-sans">
                ៛
              </span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
                {showBalances ? khrValue : "••••••"}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-2 border-t border-purple-100/80">
              <span>Backed by 100 PTS = 4,100 KHR</span>
              <span className="text-[#0098ea] font-bold flex items-center gap-0.5">
                <span>Exchange</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 2: US Dollar Account (គណនីប្រាក់ដុល្លារ) */}
          <div
            onClick={onGoToSwap}
            className="banknote-usd-card rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-sm relative overflow-hidden transition-all hover:shadow-md active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-normal font-sans">
                  គណនីប្រាក់ដុល្លារ
                </span>
                <span className="text-[10px] text-emerald-800/80 font-semibold uppercase tracking-wider">
                  (USD Account)
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700/90 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                Official Currency
              </span>
            </div>

            <div className="mt-2.5 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 mr-1.5 font-sans">
                $
              </span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
                {showBalances ? usdValue : "••••••"}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-2 border-t border-emerald-100/80">
              <span>Backed by 100 PTS = $1.00 USD</span>
              <span className="text-[#0098ea] font-bold flex items-center gap-0.5">
                <span>Exchange</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Real Points Standing & Exchange Rate Pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-900">
              {score.toLocaleString()} PTS Available
            </span>
          </div>
          <button
            type="button"
            onClick={onGoToSwap}
            className="text-[11px] font-bold text-[#0098ea] hover:text-[#0088cc] flex items-center gap-0.5"
          >
            <span>ដូរប្រាក់ (Swap)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. 2x2 QUICK ACTION BUTTONS (Exact Replica of Bakong Screenshot) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Button 1: ផ្ទេរប្រាក់ (Transfer / Send) */}
          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs active:scale-[0.98] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight className="w-5 h-5 text-slate-800" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold text-slate-900 truncate font-sans">
                ផ្ទេរប្រាក់
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Transfer
              </span>
            </div>
          </button>

          {/* Button 2: ស្កេន QR (Scan QR) */}
          <button
            type="button"
            onClick={() => setShowScanModal(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs active:scale-[0.98] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <ScanLine className="w-5 h-5 text-slate-800" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold text-slate-900 truncate font-sans">
                ស្កេន QR
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Scan QR
              </span>
            </div>
          </button>

          {/* Button 3: ទទួលប្រាក់ (Receive) */}
          <button
            type="button"
            onClick={() => setShowAddressModal(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs active:scale-[0.98] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <ArrowDownLeft className="w-5 h-5 text-slate-800" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold text-slate-900 truncate font-sans">
                ទទួលប្រាក់
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Receive
              </span>
            </div>
          </button>

          {/* Button 4: ដាក់ប្រាក់ (Deposit / Boost) */}
          <button
            type="button"
            onClick={() => setShowDepositModal(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs active:scale-[0.98] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <Coins className="w-5 h-5 text-slate-800" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold text-slate-900 truncate font-sans">
                ដាក់ប្រាក់
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Deposit
              </span>
            </div>
          </button>
        </div>

        {/* 4. Bakong-Style Services Header (សេវាកម្ម >) */}
        <div className="pt-2 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900 font-sans">
                សេវាកម្ម
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                (Services)
              </span>
            </div>
            <button
              type="button"
              onClick={onGoToGames}
              className="text-xs text-[#0098ea] font-bold flex items-center gap-0.5 hover:underline"
            >
              <span>មើលទាំងអស់</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Services Mini Row */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              type="button"
              onClick={onGoToGames}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shadow-xs transition-all"
            >
              <Gamepad2 className="w-5 h-5 text-[#0098ea] mb-1" />
              <span className="text-[11px] font-bold text-slate-800">3D Game</span>
              <span className="text-[9px] text-slate-400">Play & Earn</span>
            </button>

            <button
              type="button"
              onClick={onGoToEarn}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shadow-xs transition-all"
            >
              <Gift className="w-5 h-5 text-rose-500 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">បេសកកម្ម</span>
              <span className="text-[9px] text-slate-400">Tasks</span>
            </button>

            <button
              type="button"
              onClick={onGoToSwap}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shadow-xs transition-all"
            >
              <Repeat className="w-5 h-5 text-amber-500 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">ដូរប្រាក់</span>
              <span className="text-[9px] text-slate-400">Exchange</span>
            </button>
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="liquid-glass p-3 flex items-center gap-2.5 border border-slate-200/90 shadow-sm">
            <Timer className="w-5 h-5 text-[#0098ea] flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] text-slate-500 uppercase block leading-none font-bold">
                SESSION TIME
              </span>
              <span className="text-xs font-bold text-slate-900 block mt-1">
                {formatTime(spendSeconds)}
              </span>
            </div>
          </div>

          <div className="liquid-glass p-3 flex items-center gap-2.5 border border-slate-200/90 shadow-sm">
            <TrendingUp className="w-5 h-5 text-[#16a34a] flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] text-slate-500 uppercase block leading-none font-bold">
                MINT POWER
              </span>
              <span className="text-xs font-bold text-slate-900 block mt-1">
                +{tapPower} PTS / TAP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Center Luxury Tap Medallion with VLogo */}
      <div className="relative my-auto flex items-center justify-center py-4">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleTap}
          onTouchStart={handleTap}
          className="tap-button-white relative w-60 h-60 rounded-full flex flex-col items-center justify-center cursor-pointer select-none"
        >
          {/* Outer Grooved Rim */}
          <div className="w-52 h-52 rounded-full border-2 border-[#0098ea]/40 flex flex-col items-center justify-center bg-white shadow-xl relative p-1 overflow-hidden">
            {/* Guilloche Radial Sunburst Rosette Watermark */}
            <div className="absolute inset-0 bg-security-sunburst opacity-30 pointer-events-none" />

            {/* Inner Ring with Micro-print border and Centered Geometric V Logo */}
            <div className="w-44 h-44 rounded-full border border-dashed border-[#0098ea]/40 flex flex-col items-center justify-center relative bg-white/70 backdrop-blur-xs">
              <span className="text-[9px] font-bold text-[#0098ea] tracking-widest uppercase mb-0.5">
                SHILIAIWEI
              </span>
              {/* Centered Geometric V Letter Logo */}
              <VLogo size={48} variant="solid-blue" className="my-0.5" />
              <span className="text-[10px] font-black text-[#16a34a] tracking-wider uppercase mt-0.5">
                TAP FOR POINTS
              </span>
              <span className="text-[8px] font-semibold text-slate-400 tracking-widest uppercase mt-0.5">
                +{tapPower} PTS / TAP
              </span>
            </div>
          </div>

          {/* Floating Currency Numbers */}
          {floatingPoints.map((p) => (
            <span
              key={p.id}
              className="absolute pointer-events-none text-sm font-black text-[#16a34a] animate-out fade-out slide-out-to-top duration-700 font-sans"
              style={{ left: p.x, top: p.y }}
            >
              {p.text}
            </span>
          ))}
        </button>
      </div>

      {/* 6. Bottom Vault Energy Gauge */}
      <div className="w-full space-y-1.5 pb-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#0098ea]" />
            <span>VAULT ENERGY</span>
          </span>
          <div className="flex items-center gap-2">
            {passiveRate > 0 && (
              <span className="text-[10px] font-bold text-[#16a34a] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping" />
                <span>+${passiveRate}/s Passive</span>
              </span>
            )}
            <span className="text-[#0098ea] font-bold font-mono">
              {energy} / {maxEnergy}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-[#0098ea] rounded-full transition-all duration-150"
            style={{ width: `${energyPercent}%` }}
          />
        </div>
      </div>

      {/* MODAL 1: Receive / Wallet Address */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="liquid-glass-modal p-5 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#0098ea]" />
                <span className="text-sm font-bold text-slate-900 uppercase font-sans">
                  ទទួលប្រាក់ (Receive Vault)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-36 h-36 bg-white border border-slate-200 rounded-xl mx-auto flex flex-col items-center justify-center text-slate-500 shadow-sm">
              <QrCode className="w-20 h-20 text-[#0098ea]" />
              <span className="text-[10px] font-mono mt-1 text-slate-500">SHILIAIWEI QR</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Simulated Deposit Address (SHILIAIWEI L2)
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-mono text-slate-900 truncate">
                  {walletAddress}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 ml-2"
                >
                  {copiedAddress ? (
                    <Check className="w-4 h-4 text-[#16a34a]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Supports simulated USD assets and Cambodian Khmer Riel backed by earned points.
            </p>

            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#0098ea] hover:bg-[#0088cc] text-white font-bold text-xs uppercase tracking-wider shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Send / Transfer */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="liquid-glass-modal p-5 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-[#0098ea]" />
                <span className="text-sm font-bold text-slate-900 uppercase font-sans">
                  ផ្ទេរប្រាក់ (Send Currency)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sendSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <Check className="w-8 h-8 text-[#16a34a] mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Transfer Successful!</h4>
                <p className="text-xs text-emerald-700">
                  Transaction verified and recorded to player audit ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendTransaction} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Currency Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSendCurrency("USD")}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        sendCurrency === "USD"
                          ? "bg-[#0098ea] text-white border-[#0098ea]"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      USD ($) - Available: ${usdValue}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendCurrency("KHR")}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        sendCurrency === "KHR"
                          ? "bg-[#0098ea] text-white border-[#0098ea]"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      KHR (៛) - Available: ៛{khrValue}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Recipient (@telegram_username or Address)
                  </label>
                  <input
                    type="text"
                    required
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    placeholder="@username or shi_0x..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-[#0098ea]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Amount ({sendCurrency === "USD" ? "$" : "៛"})
                  </label>
                  <input
                    type="number"
                    step={sendCurrency === "USD" ? "0.01" : "100"}
                    required
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder={sendCurrency === "USD" ? "10.00" : "41000"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:border-[#0098ea]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0098ea] hover:bg-[#0088cc] text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Transfer</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Scan QR */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="liquid-glass-modal p-5 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-[#0098ea]" />
                <span className="text-sm font-bold text-slate-900 uppercase font-sans">
                  ស្កេន QR (Scan QR)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowScanModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-56 h-56 bg-slate-900 rounded-2xl mx-auto flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-40 h-40 border-2 border-[#0098ea] rounded-xl flex items-center justify-center relative">
                <div className="w-full h-0.5 bg-[#0098ea] animate-pulse" />
              </div>
              <span className="text-[11px] text-slate-300 font-mono mt-3">
                Align QR Code in frame
              </span>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Scan KHQR, Bakong, or SHILIAIWEI Web3 peer-to-peer addresses.
            </p>

            <button
              type="button"
              onClick={() => setShowScanModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Deposit / PTS Boost */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="liquid-glass-modal p-5 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#0098ea]" />
                <span className="text-sm font-bold text-slate-900 uppercase font-sans">
                  ដាក់ប្រាក់ (Claim & Boost PTS)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Earn Points for Free</h4>
              <p className="text-xs text-slate-500">
                You do not need to pay real money. Tap the medallion, complete daily missions, and win games to earn PTS that you can exchange directly for USD ($) or KHR (៛)!
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowDepositModal(false);
                  onGoToEarn?.();
                }}
                className="w-full py-3 rounded-xl bg-[#0098ea] hover:bg-[#0088cc] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
              >
                <Gift className="w-4 h-4" />
                <span>Go to Missions (+1,000 PTS)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDepositModal(false);
                  onGoToGames?.();
                }}
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4 text-[#0098ea]" />
                <span>Play 3D Games (+500 PTS)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDepositModal(false)}
              className="w-full py-2 rounded-xl text-slate-500 font-semibold text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
