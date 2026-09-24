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
    <div className="space-y-4 pb-20 select-none">
      {/* Profile Card */}
      <div className="game-card rounded-2xl p-5 text-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden bg-[#16211b] border-2 border-lime-400 mx-auto flex items-center justify-center mb-3">
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
            <User className="w-10 h-10 text-lime-400" />
          )}
        </div>

        <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
          {fullName}
        </h2>
        <p className="text-xs font-mono text-lime-400 mt-0.5">
          {user?.username ? `@${user.username}` : "Telegram Verified"}
        </p>

        {/* Telegram ID pill */}
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-[#16211b] border border-[#233827] text-xs font-mono">
          <span className="text-neutral-400">ID:</span>
          <span className="text-white font-bold">{user?.id || "LINKED"}</span>
          {user?.id && (
            <button
              type="button"
              onClick={handleCopyId}
              className="text-neutral-400 hover:text-white"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-lime-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Game Stats Group */}
      <div className="game-card rounded-2xl p-4 space-y-3 font-mono">
        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider pb-2 border-b border-[#233827]">
          Player Statistics
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <Zap className="w-4 h-4 text-lime-400" />
            <span>Total Points Earned</span>
          </span>
          <span className="font-bold text-lime-400 text-sm">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <Timer className="w-4 h-4 text-lime-400" />
            <span>Time Spent Tapping</span>
          </span>
          <span className="font-bold text-white">
            {formatTime(spendSeconds)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-300">Tap Power</span>
          <span className="font-bold text-lime-400">+1 per touch</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-300">Telegram Platform</span>
          <span className="font-bold text-white uppercase">
            {tgApp?.platform || "MOBILE"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleShare}
          className="w-full py-3 px-4 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Share Invite Link
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-xl bg-[#16211b] border border-[#233827] text-neutral-300 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Close Game
        </button>
      </div>
    </div>
  );
};
