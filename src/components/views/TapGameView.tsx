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
} from "lucide-react";

interface FloatingPoint {
  id: number;
  x: number;
  y: number;
  text: string;
}

export type DisplayCurrency = "USD" | "KHR" | "SHI";

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
  user,
  tgApp,
}) => {
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [activeCurrency, setActiveCurrency] = useState<DisplayCurrency>("USD");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Conversion calculations
  const khrBalance = score * 4100;
  const shiBalance = score * 10;

  const walletAddress = user?.id
    ? `shi_0x${Number(user.id).toString(16).padStart(8, "0")}...${String(user.id).slice(-4)}`
    : "shi_0x78a19bc3...82f1";

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

      let floatingText = `+$${tapPower}.00`;
      if (activeCurrency === "KHR") {
        floatingText = `+${(tapPower * 4100).toLocaleString()} KHR`;
      } else if (activeCurrency === "SHI") {
        floatingText = `+${tapPower * 10} SHI`;
      }

      const newPoint: FloatingPoint = {
        id: Date.now() + Math.random(),
        x,
        y,
        text: floatingText,
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

  const energyPercent = Math.round((energy / maxEnergy) * 100);

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100dvh-170px)] pb-24 select-none font-body text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* SHILIAIWEI Wallet Header & Currency Switcher */}
      <div className="w-full space-y-3 pt-1">
        {/* User Identity & Security Pill */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span className="font-bold text-xs tracking-wider uppercase text-slate-900 font-display">
              SHILIAIWEI VAULT
            </span>
            <span className="text-[10px] text-slate-400">•</span>
            <span className="text-slate-600 font-medium truncate max-w-[130px]">
              {user?.username ? `@${user.username}` : user?.first_name || "WEB3 HOLDER"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddressModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0098ea]" />
            <span>{walletAddress.slice(0, 10)}</span>
          </button>
        </div>

        {/* Currency Switcher Tabs (USD, KHR, SHI) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveCurrency("USD")}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeCurrency === "USD"
                ? "bg-[#0098ea] text-white shadow-sm shadow-[#0098ea]/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>USD ($)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCurrency("KHR")}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeCurrency === "KHR"
                ? "bg-[#0098ea] text-white shadow-sm shadow-[#0098ea]/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>KHR (Riel)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCurrency("SHI")}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeCurrency === "SHI"
                ? "bg-[#0098ea] text-white shadow-sm shadow-[#0098ea]/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>$SHI COIN</span>
          </button>
        </div>

        {/* Main Vault Balance Card */}
        <div className="liquid-glass p-4 sm:p-5 text-center relative overflow-hidden border border-slate-200/90 shadow-sm">
          {/* Banknote Security Waves Strip (10350112346.webp) */}
          <div className="w-full h-3 border-strip-waves opacity-60 mb-2.5" />
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {activeCurrency === "USD" && "ESTIMATED USD VAULT NET WORTH"}
            {activeCurrency === "KHR" && "CAMBODIAN KHMER RIEL BALANCE"}
            {activeCurrency === "SHI" && "SHILIAIWEI NATIVE TOKEN BALANCE"}
          </div>

          {/* Large Balance Display */}
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1 font-display flex items-baseline justify-center">
            {activeCurrency === "USD" && (
              <>
                <span className="text-[#16a34a] text-3xl sm:text-4xl mr-1 font-bold">$</span>
                <span>{score.toLocaleString()}</span>
                <span className="text-slate-400 text-xl sm:text-2xl ml-1 font-semibold">.00</span>
              </>
            )}

            {activeCurrency === "KHR" && (
              <>
                <span>{khrBalance.toLocaleString()}</span>
                <span className="text-[#0098ea] text-xl sm:text-2xl ml-1.5 font-bold font-display">
                  KHR
                </span>
              </>
            )}

            {activeCurrency === "SHI" && (
              <>
                <span>{shiBalance.toLocaleString()}</span>
                <span className="text-[#0098ea] text-xl sm:text-2xl ml-1.5 font-bold font-display">
                  $SHI
                </span>
              </>
            )}
          </div>

          {/* Subtitle Rates & Secondary Assets Overview */}
          <div className="flex items-center justify-center gap-2 mt-2 pt-2.5 border-t border-slate-200 text-[11px] text-slate-500 font-semibold">
            <span>≈ ${score.toLocaleString()}.00 USD</span>
            <span>•</span>
            <span>{khrBalance.toLocaleString()} KHR</span>
            <span>•</span>
            <span className="text-[#0098ea] font-bold">{shiBalance.toLocaleString()} $SHI</span>
          </div>

          {/* Action Buttons (Receive, Send, Swap, Missions) - Unboxed Icons */}
          <div className="grid grid-cols-4 gap-2 mt-3 pt-1">
            <button
              type="button"
              onClick={() => setShowAddressModal(true)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition-all shadow-sm"
            >
              <ArrowDownLeft className="w-4 h-4 text-[#0098ea] mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Receive</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddressModal(true)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition-all shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4 text-[#16a34a] mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Send</span>
            </button>

            <button
              type="button"
              onClick={onGoToSwap}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition-all shadow-sm"
            >
              <Repeat className="w-4 h-4 text-amber-500 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Swap</span>
            </button>

            <button
              type="button"
              onClick={onGoToEarn}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 active:scale-95 transition-all shadow-sm"
            >
              <Gift className="w-4 h-4 text-rose-500 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Earn</span>
            </button>
          </div>
        </div>

        {/* Telemetry Stats - Unboxed Icons */}
        <div className="grid grid-cols-2 gap-2">
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
                {activeCurrency === "USD" && `+$${tapPower}.00 / TAP`}
                {activeCurrency === "KHR" && `+${(tapPower * 4100).toLocaleString()} KHR`}
                {activeCurrency === "SHI" && `+${tapPower * 10} $SHI / TAP`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Luxury WinGram Tap Medallion Button - White Liquid Glass */}
      <div className="relative my-auto flex items-center justify-center py-4">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleTap}
          onTouchStart={handleTap}
          className="tap-button-white relative w-64 h-64 rounded-full flex flex-col items-center justify-center cursor-pointer select-none"
        >
          {/* Outer Grooved Rim */}
          <div className="w-56 h-56 rounded-full border-2 border-[#0098ea]/40 flex flex-col items-center justify-center bg-white shadow-xl relative p-1 overflow-hidden">
            {/* Guilloche Radial Sunburst Rosette Watermark (7168912.webp) */}
            <div className="absolute inset-0 bg-security-sunburst opacity-30 pointer-events-none" />

            {/* Inner Ring with Micro-print border */}
            <div className="w-48 h-48 rounded-full border border-dashed border-[#0098ea]/40 flex flex-col items-center justify-center relative bg-white/70 backdrop-blur-xs">
              <span className="text-[9px] font-bold text-[#0098ea] tracking-widest uppercase mb-1">
                SHILIAIWEI
              </span>
              <span className="text-5xl font-black text-slate-900 font-display tracking-tight leading-none my-1">
                {activeCurrency === "USD" && "$"}
                {activeCurrency === "KHR" && "KHR"}
                {activeCurrency === "SHI" && "SHI"}
              </span>
              <span className="text-[10px] font-black text-[#16a34a] tracking-wider uppercase mt-1">
                TAP TO MINT
              </span>
              <span className="text-[8px] font-semibold text-slate-400 tracking-widest uppercase mt-0.5">
                CENTRAL VAULT
              </span>
            </div>
          </div>

          {/* Floating Currency Numbers */}
          {floatingPoints.map((p) => (
            <span
              key={p.id}
              className="absolute pointer-events-none text-sm font-black text-[#16a34a] animate-out fade-out slide-out-to-top duration-700 font-display"
              style={{ left: p.x, top: p.y }}
            >
              {p.text}
            </span>
          ))}
        </button>
      </div>

      {/* Bottom Mint Energy Gauge */}
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

      {/* SHILIAIWEI Receive / Wallet Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="liquid-glass-modal p-5 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#0098ea]" />
                <span className="text-sm font-bold text-slate-900 uppercase font-display">
                  SHILIAIWEI Address
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
              Supports simulated USD assets, Cambodian Khmer Riel, and $SHI utility coins.
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
    </div>
  );
};
