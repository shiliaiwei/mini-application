"use client";

import React, { useEffect, useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { Gamepad2 } from "lucide-react";

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
    }, 1300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [tgApp, onComplete]);

  const playerName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "Telegram Player";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 guilloche-bg bg-white text-slate-900 max-w-md mx-auto w-full select-none font-body">
      {/* Top Tag */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-3">
        <span className="text-lime-700 font-bold uppercase tracking-wider">@srievibot</span>
        <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold">
          TAP TO EARN
        </span>
      </div>

      {/* Center Welcome */}
      <div className="my-auto text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-white border-2 border-lime-700 mx-auto flex items-center justify-center text-lime-700 shadow-xl">
          <Gamepad2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider font-display">
            {synced ? `Ready, ${playerName}` : "Connecting Telegram..."}
          </h1>
          <p className="text-xs text-slate-500">
            {synced
              ? "Telegram Owner verified. Launching game..."
              : "Synchronizing account identity..."}
          </p>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              synced ? "bg-lime-600" : "bg-slate-400 animate-ping"
            }`}
          />
          <span className="font-bold text-lime-800 uppercase text-[11px]">
            {synced ? "TELEGRAM AUTH VERIFIED" : "SYNCING"}
          </span>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onComplete}
          className="w-full py-3.5 px-4 rounded-xl bg-lime-700 hover:bg-lime-800 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-md"
        >
          {synced ? "Entering Game..." : "Start Now"}
        </button>
      </div>
    </div>
  );
};
