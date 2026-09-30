"use client";

import React from "react";
import { WeiCoinBadge } from "@/components/brand/WeiCoinBadge";
import { WeiBitcoin3DCoin } from "@/components/brand/WeiBitcoin3DCoin";
import type { TelegramWebApp } from "@/types/telegram";

export type WalletPanel = "overview" | "send" | "exchange";

interface WeiBalanceCardProps {
  address:     string | null;
  weiBalance:  number;
  usdBalance:  number;
  khrBalance:  number;
  panel:       WalletPanel;
  onPanel:     (p: WalletPanel) => void;
  tgApp:       TelegramWebApp | null;
}

/**
 * WeiBalanceCard — gradient header with 3D coin, balance display, and panel tabs.
 */
export function WeiBalanceCard({
  address,
  weiBalance,
  usdBalance,
  khrBalance,
  panel,
  onPanel,
}: WeiBalanceCardProps) {
  return (
    <div
      className="relative rounded-[28px] p-5 overflow-hidden text-white"
      style={{
        background:  "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
        boxShadow:   "0 20px 50px -10px rgba(48,43,99,.5),inset 0 1px 1px rgba(255,255,255,.15)",
      }}
    >
      {/* Top highlight line */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <WeiCoinBadge size="sm" variant="badge-only" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-200">
            WEI WALLET
          </span>
        </div>
        <span className="text-[10px] font-mono text-white/50 truncate max-w-[140px]">
          {address
            ? `${address.slice(0, 8)}...${address.slice(-6)}`
            : "Syncing..."}
        </span>
      </div>

      {/* Balance display */}
      <div className="text-center py-3">
        <div className="flex items-center justify-center gap-3 mb-1">
          <WeiBitcoin3DCoin size={48} interactive={false} />
          <div>
            <span className="text-4xl font-black font-mono tracking-tight block">
              {weiBalance.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-200/80">WEI COIN</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-white/60 font-mono">
          <span>${usdBalance.toFixed(2)} USD</span>
          <span>•</span>
          <span>{Math.floor(khrBalance).toLocaleString()} ៛</span>
        </div>
      </div>

      {/* Panel tabs */}
      <div className="flex gap-2 mt-4">
        {(["overview", "send", "exchange"] as WalletPanel[]).map((t) => (
          <button
            key={t}
            onClick={() => onPanel(t)}
            className={`flex-1 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
              panel === t
                ? "bg-white text-slate-900"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
