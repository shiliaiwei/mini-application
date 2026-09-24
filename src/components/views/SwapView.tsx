"use client";

import React, { useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ArrowUpDown, Repeat, Check, Sparkles, Coins } from "lucide-react";

export type CurrencyType = "PTS" | "USD" | "KHR";

interface SwapViewProps {
  score: number;
  onSetScore: (newScore: number) => void;
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
}

export const SwapView: React.FC<SwapViewProps> = ({
  score,
  onSetScore,
  user,
  tgApp,
}) => {
  const [fromCurrency, setFromCurrency] = useState<CurrencyType>("PTS");
  const [toCurrency, setToCurrency] = useState<CurrencyType>("USD");
  const [inputAmount, setInputAmount] = useState<string>("100");
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);

  // Conversion rates in points (100 PTS = $1.00 USD = 4,100 KHR)
  const getOutputAmount = (amount: number, from: CurrencyType, to: CurrencyType): number => {
    if (from === to) return amount;
    
    // Normalize to PTS first
    let pts = 0;
    if (from === "PTS") pts = amount;
    else if (from === "USD") pts = amount * 100;
    else if (from === "KHR") pts = amount / 41;

    // Convert PTS to target
    if (to === "PTS") return pts;
    if (to === "USD") return pts / 100;
    if (to === "KHR") return pts * 41;
    return 0;
  };

  const getAvailableBalance = (curr: CurrencyType): number => {
    if (curr === "PTS") return score;
    if (curr === "USD") return score / 100;
    if (curr === "KHR") return Math.floor(score * 41);
    return 0;
  };

  const currentAvailable = getAvailableBalance(fromCurrency);
  const parsedInput = parseFloat(inputAmount) || 0;
  const calculatedOutput = getOutputAmount(parsedInput, fromCurrency, toCurrency);

  const handleFlip = () => {
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleQuickPercent = (pct: number) => {
    const calculated = (currentAvailable * pct) / 100;
    setInputAmount(
      calculated > 0
        ? fromCurrency === "KHR" || fromCurrency === "PTS"
          ? Math.floor(calculated).toString()
          : calculated.toFixed(2)
        : "0"
    );
  };

  const handleExecuteSwap = async () => {
    if (parsedInput <= 0 || parsedInput > currentAvailable) return;

    // Calculate score impact
    let pointsSpent = 0;
    if (fromCurrency === "PTS") pointsSpent = parsedInput;
    else if (fromCurrency === "USD") pointsSpent = parsedInput * 100;
    else if (fromCurrency === "KHR") pointsSpent = parsedInput / 41;

    let pointsGained = 0;
    if (toCurrency === "PTS") pointsGained = calculatedOutput;
    else if (toCurrency === "USD") pointsGained = calculatedOutput * 100;
    else if (toCurrency === "KHR") pointsGained = calculatedOutput / 41;

    const newScore = Math.max(0, Math.round(score - pointsSpent + pointsGained));
    onSetScore(newScore);

    const outputText =
      toCurrency === "KHR"
        ? `${Math.floor(calculatedOutput).toLocaleString()} KHR`
        : toCurrency === "USD"
        ? `$${calculatedOutput.toFixed(2)} USD`
        : `${Math.floor(calculatedOutput).toLocaleString()} PTS`;

    const successMsg = `Exchanged ${parsedInput.toLocaleString()} ${fromCurrency} for ${outputText} successfully!`;

    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}

    setSwapSuccess(successMsg);

    // Record exchange action into Neon PostgreSQL audit_logs
    if (user?.id) {
      try {
        await fetch("/api/audit/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: user.id,
            action: "POINTS_EXCHANGE",
            details: `Exchanged ${parsedInput} ${fromCurrency} for ${outputText}`,
            platform: tgApp?.platform || "TELEGRAM_WEB",
          }),
        });
      } catch {}
    }

    setTimeout(() => {
      setSwapSuccess(null);
    }, 4500);
  };

  const canSwap = parsedInput > 0 && parsedInput <= currentAvailable;

  return (
    <div className="space-y-4 pb-24 font-body select-none text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* Header Info */}
      <div className="liquid-glass p-4 flex items-center justify-between border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            SHILIAIWEI POINTS & CURRENCY EXCHANGE
          </span>
          <span className="text-sm font-black text-slate-900 font-display block mt-0.5">
            Convert Game Points to USD or Khmer Riel
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#16a34a] text-[10px] font-bold">
          Instant Settlement
        </div>
      </div>

      {/* Main Swap Card */}
      <div className="liquid-glass p-5 space-y-3 relative border border-slate-200/90 shadow-sm">
        {/* Banknote Waves Security Strip (10350112346.webp) */}
        <div className="w-full h-3 border-strip-waves opacity-60 mb-1" />

        {/* From Section */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>YOU PAY</span>
            <span>
              Available:{" "}
              {fromCurrency === "USD"
                ? `$${currentAvailable.toFixed(2)}`
                : `${Math.floor(currentAvailable).toLocaleString()} ${fromCurrency}`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="bg-transparent text-2xl font-black text-slate-900 font-display focus:outline-none w-full"
              placeholder="0"
            />

            <select
              value={fromCurrency}
              onChange={(e) => {
                const val = e.target.value as CurrencyType;
                if (val === toCurrency) handleFlip();
                else setFromCurrency(val);
              }}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="PTS">Game Points (PTS)</option>
              <option value="USD">USD ($)</option>
              <option value="KHR">KHR (Riel ៛)</option>
            </select>
          </div>

          {/* Quick Pct Selectors */}
          <div className="flex items-center gap-1.5 pt-1">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                className="px-2.5 py-0.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 transition-colors shadow-sm"
              >
                {pct === 100 ? "MAX" : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Center Invert Button */}
        <div className="relative flex justify-center -my-2 z-10">
          <button
            type="button"
            onClick={handleFlip}
            className="w-10 h-10 rounded-full bg-[#0098ea] hover:bg-[#0088cc] text-white flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-white cursor-pointer"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* To Section */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>YOU RECEIVE (ESTIMATED)</span>
            <span>
              {fromCurrency === "PTS" && toCurrency === "USD" && "100 PTS = $1.00 USD"}
              {fromCurrency === "PTS" && toCurrency === "KHR" && "100 PTS = 4,100 KHR"}
              {fromCurrency === "USD" && toCurrency === "KHR" && "$1.00 USD = 4,100 KHR"}
              {fromCurrency === "KHR" && toCurrency === "USD" && "4,100 KHR = $1.00 USD"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-2xl font-black text-[#16a34a] font-display">
              {toCurrency === "KHR"
                ? `${Math.floor(calculatedOutput).toLocaleString()} KHR`
                : toCurrency === "USD"
                ? `$${calculatedOutput.toFixed(2)} USD`
                : `${Math.floor(calculatedOutput).toLocaleString()} PTS`}
            </div>

            <select
              value={toCurrency}
              onChange={(e) => {
                const val = e.target.value as CurrencyType;
                if (val === fromCurrency) handleFlip();
                else setToCurrency(val);
              }}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="KHR">KHR (Riel ៛)</option>
              <option value="PTS">Game Points (PTS)</option>
            </select>
          </div>
        </div>

        {/* Success Alert */}
        {swapSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16a34a] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{swapSuccess}</span>
          </div>
        )}

        {/* Swap Action Button */}
        <button
          type="button"
          onClick={handleExecuteSwap}
          disabled={!canSwap}
          className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
            canSwap
              ? "bg-[#0098ea] hover:bg-[#0088cc] text-white active:scale-98 cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Execute Instant Exchange</span>
        </button>
      </div>

      {/* Conversion Rate Card */}
      <div className="liquid-glass p-4 space-y-2 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#0098ea]" />
          <span>Official Conversion Standards</span>
        </div>
        <div className="space-y-1 text-xs text-slate-500">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span>100 Game Points (PTS)</span>
            <span className="font-mono text-[#16a34a] font-bold">$1.00 USD</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span>100 Game Points (PTS)</span>
            <span className="font-mono text-[#0098ea] font-bold">4,100.00 KHR (Riel)</span>
          </div>
          <div className="flex justify-between py-1">
            <span>1 USD ($)</span>
            <span className="font-mono text-slate-900 font-bold">4,100.00 KHR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
