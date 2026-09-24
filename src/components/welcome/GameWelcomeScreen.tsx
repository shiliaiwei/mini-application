"use client";

import React, { useEffect, useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { Gamepad2, Check } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-[#080c0a] text-white max-w-md mx-auto w-full select-none font-mono">
      {/* Top Tag */}
      <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-[#233827] pb-3">
        <span className="text-lime-400 font-bold uppercase">@srievibot</span>
        <span className="text-[10px] bg-[#16211b] border border-[#233827] px-2 py-0.5 rounded text-neutral-300">
          TAP TO EARN
        </span>
      </div>

      {/* Center Welcome */}
      <div className="my-auto text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#111914] border-2 border-lime-400 mx-auto flex items-center justify-center text-lime-400 shadow-xl">
          <Gamepad2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-black text-white uppercase tracking-wider">
            {synced ? `Ready, ${playerName}` : "Connecting Telegram..."}
          </h1>
          <p className="text-xs text-neutral-400">
            {synced
              ? "Telegram Owner verified. Launching game..."
              : "Synchronizing account identity..."}
          </p>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111914] border border-[#233827] text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              synced ? "bg-lime-400" : "bg-neutral-500 animate-ping"
            }`}
          />
          <span className="font-bold text-lime-400 uppercase">
            {synced ? "TELEGRAM AUTH VERIFIED" : "SYNCING"}
          </span>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onComplete}
          className="w-full py-3 px-4 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-black text-xs uppercase tracking-wider transition-colors"
        >
          {synced ? "Entering Game..." : "Start Now"}
        </button>
      </div>
    </div>
  );
};
