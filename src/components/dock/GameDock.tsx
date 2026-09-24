"use client";

import React from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import { Gamepad2, Trophy, User } from "lucide-react";

export type GameTab = "game" | "leaderboard" | "profile";

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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[360px] select-none">
      <div className="game-dock rounded-full px-4 py-2 flex items-center justify-around shadow-lg">
        {/* Game Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("game")}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-full transition-colors ${
            activeTab === "game"
              ? "text-lime-400 font-bold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Gamepad2 className={`w-5 h-5 ${activeTab === "game" ? "text-lime-400" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-wide uppercase">Tap</span>
        </button>

        {/* Leaderboard Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("leaderboard")}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-full transition-colors ${
            activeTab === "leaderboard"
              ? "text-lime-400 font-bold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Trophy className={`w-5 h-5 ${activeTab === "leaderboard" ? "text-lime-400" : ""}`} />
          <span className="text-[10px] mt-0.5 tracking-wide uppercase">Rank</span>
        </button>

        {/* Profile Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("profile")}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-full transition-colors ${
            activeTab === "profile"
              ? "text-lime-400 font-bold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          {user?.photo_url ? (
            <div
              className={`w-5 h-5 rounded-full overflow-hidden border ${
                activeTab === "profile" ? "border-lime-400" : "border-neutral-600"
              }`}
            >
              <Image
                src={user.photo_url}
                alt="Profile"
                width={20}
                height={20}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <User className={`w-5 h-5 ${activeTab === "profile" ? "text-lime-400" : ""}`} />
          )}
          <span className="text-[10px] mt-0.5 tracking-wide uppercase">User</span>
        </button>
      </div>
    </nav>
  );
};
