"use client";

import React from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import { Wallet, Gift, Repeat, Trophy, User, Gamepad2 } from "lucide-react";

export type GameTab = "wallet" | "games" | "earn" | "swap" | "leaderboard" | "profile";

interface GameDockProps {
  activeTab: GameTab;
  onChangeTab: (tab: GameTab) => void;
  user: TelegramUser | null;
}

export const GameDock: React.FC<GameDockProps> = ({
  activeTab,
  onChangeTab,
  user,
}) => {
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-[440px] select-none font-body">
      <div className="rounded-full px-2 py-2 flex items-center justify-around border border-slate-200/90 shadow-xl bg-white/90 backdrop-blur-xl">
        {/* Wallet / Vault Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("wallet")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all ${
            activeTab === "wallet"
              ? "text-[#0098ea] font-bold scale-105"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Wallet className={`w-5 h-5 ${activeTab === "wallet" ? "text-[#0098ea]" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-semibold">Vault</span>
        </button>

        {/* 3D Games Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("games")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all ${
            activeTab === "games"
              ? "text-[#0098ea] font-bold scale-105"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Gamepad2 className={`w-5 h-5 ${activeTab === "games" ? "text-[#0098ea]" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-semibold">3D Game</span>
        </button>

        {/* Earn Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("earn")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === "earn"
              ? "text-[#0098ea] font-bold scale-105"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Gift className={`w-5 h-5 ${activeTab === "earn" ? "text-[#0098ea]" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-semibold">Earn</span>
        </button>

        {/* Swap Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("swap")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === "swap"
              ? "text-[#0098ea] font-bold scale-105"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Repeat className={`w-5 h-5 ${activeTab === "swap" ? "text-[#0098ea]" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-semibold">Swap</span>
        </button>

        {/* Leaderboard Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("leaderboard")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === "leaderboard"
              ? "text-[#0098ea] font-bold scale-105"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Trophy className={`w-5 h-5 ${activeTab === "leaderboard" ? "text-[#0098ea]" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-semibold">Rank</span>
        </button>

        {/* Profile Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("profile")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all ${
            activeTab === "profile"
              ? "text-[#0098ea] font-bold scale-105"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {user?.photo_url ? (
            <div
              className={`w-5 h-5 rounded-full overflow-hidden border ${
                activeTab === "profile" ? "border-[#0098ea]" : "border-slate-300"
              }`}
            >
              <Image
                src={user.photo_url}
                alt="Profile"
                width={20}
                height={20}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <User className={`w-5 h-5 ${activeTab === "profile" ? "text-[#0098ea]" : ""}`} />
          )}
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-semibold">Profile</span>
        </button>
      </div>
    </nav>
  );
};
