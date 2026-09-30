"use client";

import React, { useState, useCallback } from "react";
import { Repeat } from "@/components/icons/KeylineIcons";
import { flash, type FlashMsg } from "./weiWalletUtils";
import { InlineMsg } from "./weiWalletHooks";
import type { TelegramWebApp } from "@/types/telegram";

interface WeiExchangePanelProps {
  address:         string | null;
  weiBalance:      number;
  initData:        string;
  tgApp:           TelegramWebApp | null;
  onBalanceUpdate: (n: number) => void;
}

/**
 * WeiExchangePanel — exchange WEI for USD or KHR, burning WEI on conversion.
 * Min 100 WEI, max 25,000 WEI per transaction.
 */
export function WeiExchangePanel({
  address,
  weiBalance,
  initData,
  tgApp,
  onBalanceUpdate,
}: WeiExchangePanelProps) {
  const [xAmt,    setXAmt]    = useState("");
  const [xPair,   setXPair]   = useState<"WEI_USD" | "WEI_KHR">("WEI_USD");
  const [msg,     setMsg]     = useState<FlashMsg>(null);
  const [loading, setLoading] = useState(false);

  const handleExchange = useCallback(async () => {
    if (loading) return;
    setMsg(null);
    const amt = parseInt(xAmt, 10);

    if (!amt || amt < 100)     { flash(setMsg, false, "Minimum 100 WEI"); return; }
    if (amt > 25_000)           { flash(setMsg, false, "Maximum 25,000 WEI per transaction"); return; }
    if (amt > weiBalance)       { flash(setMsg, false, "Insufficient WEI balance"); return; }

    setLoading(true);
    try { tgApp?.HapticFeedback?.impactOccurred("light"); } catch {}

    try {
      const res = await fetch("/api/wallet/exchange", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fromAddress: address, pair: xPair, amount: amt, initData }),
      });
      const data = await res.json();
      if (data.success) {
        try { tgApp?.HapticFeedback?.notificationOccurred("success"); } catch {}
        const got =
          xPair === "WEI_USD"
            ? `$${Number(data.convertedAmount).toFixed(2)} USD`
            : `${Number(data.convertedAmount).toLocaleString()} ៛ KHR`;
        flash(setMsg, true, `${amt.toLocaleString()} WEI → ${got} (burned)`);
        onBalanceUpdate(data.newBalance);
        setXAmt("");
      } else {
        flash(setMsg, false, data.error || "Exchange failed");
      }
    } catch {
      flash(setMsg, false, "Network error");
    } finally {
      setLoading(false);
    }
  }, [loading, xAmt, xPair, address, weiBalance, initData, tgApp, onBalanceUpdate]);

  return (
    <div className="bg-white rounded-[22px] border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-1.5">
        <Repeat size={14} className="text-purple-500" />
        <span className="text-xs font-black uppercase text-slate-800">
          Exchange & Burn WEI
        </span>
      </div>

      <InlineMsg state={msg} />

      {/* Pair selector */}
      <div className="flex gap-2">
        {(["WEI_USD", "WEI_KHR"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setXPair(p)}
            className={`flex-1 py-2 rounded-full text-[11px] font-black transition-all active:scale-95 cursor-pointer ${
              xPair === p
                ? "bg-purple-500 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {p === "WEI_USD" ? "WEI → USD" : "WEI → KHR"}
          </button>
        ))}
      </div>

      <input
        type="number"
        inputMode="numeric"
        placeholder="Amount WEI (min 100, max 25,000)"
        value={xAmt}
        onChange={(e) => setXAmt(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-purple-400 bg-slate-50"
      />

      <p className="text-[10px] text-slate-400 text-center">
        {xPair === "WEI_USD" ? "1 WEI = $0.01 USD" : "1 WEI = 41 KHR"} — WEI burned on exchange
      </p>

      <button
        onClick={handleExchange}
        disabled={loading}
        className="w-full py-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-60"
      >
        {loading ? "Processing..." : "Exchange & Burn WEI"}
      </button>
    </div>
  );
}
