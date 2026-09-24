"use client";

import React from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import { Search, User } from "@/components/icons/KeylineIcons";
import { getUserLevelInfo } from "@/lib/games/levels";
import { VLogo } from "@/components/brand/VLogo";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";

interface WinGramHeaderProps {
  score: number;
  user: TelegramUser | null;
  activeMode: string;
  onSelectMode: (mode: string) => void;
  onOpenProfile: () => void;
  onOpenTopUp: () => void;
}

export const WinGramHeader: React.FC<WinGramHeaderProps> = ({
  score,
  user,
  activeMode,
  onSelectMode,
  onOpenProfile,
  onOpenTopUp,
}) => {
  const username = user?.username || user?.first_name || "SHILIAIWEI User";
  const levelInfo = getUserLevelInfo(score);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-3 py-2 flex items-center justify-between gap-2 select-none font-body shadow-xs">
      {/* Left: Brand Logo & Mode Switcher Pills */}
      <div className="flex items-center gap-2 min-w-0">
        {/* SHILIAIWEI Brand Logo with V Letter Emblem */}
        <button
          type="button"
          onClick={() => onSelectMode("lobby")}
          className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 text-left min-h-[44px] px-1 -ml-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
          aria-label="Go to Vault lobby"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0098ea] flex items-center justify-center text-white shadow-xs">
            <VLogo size={18} variant="white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wider text-slate-900 font-sans uppercase leading-tight">
              SHILIAIWEI
            </span>
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest leading-none">
              Vault
            </span>
          </div>
        </button>

        {/* Mode Switcher Pills */}
        <div className="hidden sm:flex items-center bg-slate-100/90 p-0.5 rounded-full border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => onSelectMode("lobby")}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeMode === "lobby"
                ? "bg-[#0098ea] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Vault
          </button>
          <button
            type="button"
            onClick={() => onSelectMode("games")}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeMode === "games"
                ? "bg-[#0098ea] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            3D Game
          </button>
          <button
            type="button"
            onClick={() => onSelectMode("earn")}
            className={`px-3 py-1.5 rounded-full transition-all ${
              activeMode === "earn"
                ? "bg-[#0098ea] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Missions
          </button>
        </div>
      </div>

      {/* Right: Search, Real Balance, Top Up, Profile */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Search */}
        <button
          type="button"
          onClick={() => onSelectMode("games")}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-colors min-w-[40px] min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
          aria-label="Search 3D games and features"
          title="Search"
        >
          <Search size={20} />
        </button>

        {/* Real Balance Pill */}
        <div
          className="flex items-center bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1 text-xs font-black min-h-[36px]"
          aria-label={`Current Balance: $${score.toFixed(2)}`}
        >
          <span className="text-[#16a34a] mr-1 font-bold">$</span>
          <span className="text-slate-900 font-display">
            {score.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Top Up Button */}
        <button
          type="button"
          onClick={onOpenTopUp}
          className="bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold px-3 py-2 rounded-full transition-all shadow-xs active:scale-95 min-h-[38px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0098ea]"
        >
          Top up
        </button>

        {/* Profile Avatar with Border Radius Circle Level Ring */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-white overflow-visible transition-transform active:scale-95 min-w-[40px] min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
          aria-label={`Open Profile for ${username}, Level ${levelInfo.level}`}
          title={`Profile (${username})`}
        >
          <div
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border-2 bg-white"
            style={{ borderColor: levelInfo.color }}
          >
            {user?.photo_url ? (
              <Image
                src={user.photo_url}
                alt="User profile picture"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-[#0098ea] flex items-center justify-center text-white font-bold text-xs">
                <User size={18} />
              </div>
            )}
          </div>
          <span
            className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full text-[8px] font-black text-black border border-black/40 shadow-xs"
            style={{ backgroundColor: levelInfo.color }}
          >
            L{levelInfo.level}
          </span>
          {user && (
            <TelegramVerifiedBadge size={13} className="absolute -top-1 -right-1 z-30 drop-shadow-xs" />
          )}
        </button>
      </div>
    </header>
  );
};

