"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { User, Copy, Check, Share2, Timer, Zap, LogOut } from "lucide-react";

interface GameProfileViewProps {
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
  score: number;
  spendSeconds: number;
}

export const GameProfileView: React.FC<GameProfileViewProps> = ({
  user,
  tgApp,
  score,
  spendSeconds,
}) => {
  const [copied, setCopied] = useState(false);

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "Telegram Player";

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(String(user.id));
      setCopied(true);
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
      if (tgApp?.openTelegramLink) {
        tgApp.openTelegramLink(
          "https://t.me/share/url?url=" +
            encodeURIComponent("https://t.me/srievibot/app") +
            "&text=" +
            encodeURIComponent("Join me on this Telegram Tap-to-Earn Game!")
        );
      }
    } catch {}
  };

  const handleClose = () => {
    try {
      tgApp?.close();
    } catch {}
  };

  return (
    <div className="space-y-4 pb-20 select-none font-body">
      {/* Profile Card */}
      <div className="white-card rounded-2xl p-5 text-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-lime-700 mx-auto flex items-center justify-center mb-3 shadow-md">
          {user?.photo_url ? (
            <Image
              src={user.photo_url}
              alt={fullName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <User className="w-10 h-10 text-lime-700" />
          )}
        </div>

        <h2 className="text-lg font-bold text-slate-900 font-display uppercase tracking-wide">
          {fullName}
        </h2>
        <p className="text-xs text-lime-700 font-semibold mt-0.5">
          {user?.username ? `@${user.username}` : "Telegram Verified"}
        </p>

        {/* Telegram ID pill */}
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs">
          <span className="text-slate-500 font-medium">ID:</span>
          <span className="text-slate-900 font-bold">{user?.id || "LINKED"}</span>
          {user?.id && (
            <button
              type="button"
              onClick={handleCopyId}
              className="text-slate-500 hover:text-slate-900"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-lime-700" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Game Stats Group */}
      <div className="white-card rounded-2xl p-4 space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100 font-display">
          Player Statistics
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Zap className="w-4 h-4 text-lime-700" />
            <span>Total Points Earned</span>
          </span>
          <span className="font-bold text-slate-900 font-display text-sm">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Timer className="w-4 h-4 text-lime-700" />
            <span>Time Spent Tapping</span>
          </span>
          <span className="font-bold text-slate-900">
            {formatTime(spendSeconds)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Tap Power</span>
          <span className="font-bold text-lime-700">+1 per touch</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Telegram Platform</span>
          <span className="font-bold text-slate-900 uppercase">
            {tgApp?.platform || "MOBILE"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleShare}
          className="w-full py-3 px-4 rounded-xl bg-lime-700 hover:bg-lime-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md"
        >
          <Share2 className="w-4 h-4" />
          Share Invite Link
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Close Game
        </button>
      </div>
    </div>
  );
};
