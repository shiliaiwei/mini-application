"use client";

import React, { useEffect, useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";

interface GameWelcomeScreenProps {
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
  onComplete: () => void;
}

export const GameWelcomeScreen: React.FC<GameWelcomeScreenProps> = ({
  user,
  tgApp,
  onComplete,
}) => {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setSynced(true);
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
    }, 600);

    const t2 = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [tgApp, onComplete]);

  const playerName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "Telegram Holder";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 app-bg-white text-slate-900 max-w-md mx-auto w-full select-none font-body relative overflow-hidden">
      {/* Flowing Vertical Banknote Security Ribbon (ca18d734-2fb8-483c-8a5a-a4ea71fcb4cf.webp) */}
      <div className="absolute inset-0 bg-security-ribbon opacity-[0.05] pointer-events-none z-0" />

      {/* Top Tag */}
      <div className="relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
          <span className="text-[#0098ea] font-bold uppercase tracking-wider">@srievibot</span>
          <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold uppercase tracking-wider">
            SHILIAIWEI
          </span>
        </div>
        {/* Rings Banknote Security Strip (103345550116.webp) */}
        <div className="w-full h-2 border-strip-rings opacity-70 border-b border-slate-200/80" />
      </div>

      {/* Center Welcome */}
      <div className="my-auto text-center space-y-4 relative z-10">
        <div className="w-20 h-20 rounded-full bg-white border-2 border-[#0098ea] mx-auto flex items-center justify-center shadow-lg relative overflow-hidden">
          {/* Radial Rosette Watermark (7168912.webp) */}
          <div className="absolute inset-0 bg-security-sunburst opacity-30 pointer-events-none" />
          <ShiliaiweiBrand variant="mark" height={44} className="relative z-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider font-display">
            {synced ? `Vault Ready, ${playerName}` : "Connecting Vault..."}
          </h1>
          <p className="text-xs text-slate-500">
            {synced
              ? "Live connection established. Vault ledger synchronized."
              : "Synchronizing Web3 keys and ledger balances..."}
          </p>
        </div>

        {/* Sync Indicator */}
        <div className="w-48 mx-auto h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-[#0098ea] rounded-full transition-all duration-700 ${
              synced ? "w-full" : "w-1/3 animate-pulse"
            }`}
          />
        </div>
      </div>
    </div>
  );
};
