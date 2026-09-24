"use client";

import React, { useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ArrowUpDown, Repeat, Check, Sparkles } from "lucide-react";

export type CurrencyType = "USD" | "KHR" | "SHI";

interface SwapViewProps {
  score: number;
  onSetScore: (newScore: number) => void;
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
}

export const SwapView: React.FC<SwapViewProps> = ({
  score,
  onSetScore,
  tgApp,
}) => {
  const [fromCurrency, setFromCurrency] = useState<CurrencyType>("USD");
  const [toCurrency, setToCurrency] = useState<CurrencyType>("KHR");
  const [inputAmount, setInputAmount] = useState<string>("10");
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);

  // Conversion rates relative to 1 USD
  // 1 USD = 4100 KHR
  // 1 USD = 10 SHI
  const rates: Record<CurrencyType, number> = {
    USD: 1,
    KHR: 4100,
    SHI: 10,
  };

  const getAvailableBalance = (curr: CurrencyType): number => {
    if (curr === "USD") return score;
    if (curr === "KHR") return score * 4100;
    if (curr === "SHI") return score * 10;
    return 0;
  };

  const currentAvailable = getAvailableBalance(fromCurrency);
  const parsedInput = parseFloat(inputAmount) || 0;

  // Convert fromCurrency to toCurrency
  const amountInUSD = parsedInput / rates[fromCurrency];
  const calculatedOutput = amountInUSD * rates[toCurrency];

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
        ? fromCurrency === "KHR"
          ? Math.floor(calculated).toString()
          : calculated.toFixed(0)
        : "0"
    );
  };

  const handleExecuteSwap = () => {
    if (parsedInput <= 0 || parsedInput > currentAvailable) return;

    // Convert swap to new USD score
    const newScore = score - amountInUSD + amountInUSD;
    onSetScore(newScore);

    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}

    setSwapSuccess(
      `Swapped ${parsedInput.toLocaleString()} ${fromCurrency} for ${
        toCurrency === "KHR"
          ? Math.floor(calculatedOutput).toLocaleString()
          : calculatedOutput.toFixed(2)
      } ${toCurrency} successfully!`
    );

    setTimeout(() => {
      setSwapSuccess(null);
    }, 4000);
  };

  const canSwap = parsedInput > 0 && parsedInput <= currentAvailable;

  return (
    <div className="space-y-4 pb-24 font-body select-none text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* Header Info */}
      <div className="liquid-glass p-4 flex items-center justify-between border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            SHILIAIWEI DEX LIQUIDITY
          </span>
          <span className="text-sm font-black text-slate-900 font-display block mt-0.5">
            Instant Multi-Currency Swap
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0098ea] text-[10px] font-bold">
          0.00% Gas Fee
        </div>
      </div>

      {/* Main Swap Card */}
      <div className="liquid-glass p-5 space-y-3 relative border border-slate-200/90 shadow-sm">
        {/* From Section */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>YOU PAY</span>
            <span>
              Available: {currentAvailable.toLocaleString()} {fromCurrency}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="bg-transparent text-2xl font-black text-slate-900 font-display focus:outline-none w-full"
              placeholder="0.00"
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
              <option value="USD">USD ($)</option>
              <option value="KHR">KHR (Riel)</option>
              <option value="SHI">SHI ($SHI)</option>
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
            className="w-10 h-10 rounded-full bg-[#0098ea] hover:bg-[#0088cc] text-white flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-white"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* To Section */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>YOU RECEIVE (ESTIMATED)</span>
            <span>Rate: 1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(2)} {toCurrency}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-2xl font-black text-[#16a34a] font-display">
              {toCurrency === "KHR"
                ? Math.floor(calculatedOutput).toLocaleString()
                : calculatedOutput.toFixed(2)}
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
              <option value="KHR">KHR (Riel)</option>
              <option value="SHI">SHI ($SHI)</option>
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
              ? "bg-[#0098ea] hover:bg-[#0088cc] text-white active:scale-98"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Execute Instant Swap</span>
        </button>
      </div>

      {/* Conversion Rate Card */}
      <div className="liquid-glass p-4 space-y-2 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#0098ea]" />
          <span>Official SHILIAIWEI Pegging Rates</span>
        </div>
        <div className="space-y-1 text-xs text-slate-500">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span>1 USD ($)</span>
            <span className="font-mono text-slate-900 font-bold">4,100.00 KHR</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span>1 USD ($)</span>
            <span className="font-mono text-[#0098ea] font-bold">10.00 $SHI</span>
          </div>
          <div className="flex justify-between py-1">
            <span>1 $SHI Coin</span>
            <span className="font-mono text-[#16a34a] font-bold">410.00 KHR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
