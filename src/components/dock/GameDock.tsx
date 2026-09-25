import React from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import {
  Gift,
  Trophy,
  User,
} from "@/components/icons/KeylineIcons";

export type GameTab = "wallet" | "earn" | "leaderboard" | "profile";

interface GameDockProps {
  activeTab: GameTab;
  onChangeTab: (tab: GameTab) => void;
  user: TelegramUser | null;
}

// Apple Keyline Home Icon
const HomeIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 22,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
  </svg>
);

export const GameDock: React.FC<GameDockProps> = ({
  activeTab,
  onChangeTab,
  user,
}) => {
  return (
    <nav
      aria-label="Bottom Navigation Dock"
      className="fixed bottom-[max(0.85rem,env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-[390px] select-none font-sans"
    >
      {/* Floating Apple-Style Glassmorphism Dock */}
      <div className="rounded-full p-1.5 flex items-center justify-between border border-white/80 shadow-[0_12px_32px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.06)] bg-white/90 backdrop-blur-2xl ring-1 ring-slate-900/5">
        {/* 1. Home Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("wallet")}
          aria-label="Home"
          aria-current={activeTab === "wallet" ? "page" : undefined}
          className={`flex-1 flex items-center justify-center h-[42px] rounded-full transition-all duration-300 focus:outline-none cursor-pointer group ${
            activeTab === "wallet"
              ? "bg-gradient-to-r from-[#0088cc] via-[#0098ea] to-[#00b0ff] text-white shadow-[0_4px_16px_rgba(0,152,234,0.38)] scale-105"
              : "flex-col text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 hover:scale-105 active:scale-90"
          }`}
        >
          <HomeIcon
            size={activeTab === "wallet" ? 22 : 19}
            className={activeTab === "wallet" ? "text-white" : "text-slate-500 group-hover:text-slate-900"}
          />
          {activeTab !== "wallet" && (
            <span className="text-[10px] mt-0.5 tracking-tight font-bold text-slate-500 group-hover:text-slate-900 leading-none">
              Home
            </span>
          )}
        </button>

        {/* 2. Missions Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("earn")}
          aria-label="Missions"
          aria-current={activeTab === "earn" ? "page" : undefined}
          className={`flex-1 flex items-center justify-center h-[42px] rounded-full transition-all duration-300 focus:outline-none cursor-pointer group ${
            activeTab === "earn"
              ? "bg-gradient-to-r from-[#0088cc] via-[#0098ea] to-[#00b0ff] text-white shadow-[0_4px_16px_rgba(0,152,234,0.38)] scale-105"
              : "flex-col text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 hover:scale-105 active:scale-90"
          }`}
        >
          <Gift
            size={activeTab === "earn" ? 22 : 19}
            className={activeTab === "earn" ? "text-white" : "text-slate-500 group-hover:text-slate-900"}
          />
          {activeTab !== "earn" && (
            <span className="text-[10px] mt-0.5 tracking-tight font-bold text-slate-500 group-hover:text-slate-900 leading-none">
              Missions
            </span>
          )}
        </button>

        {/* 3. Leaderboard Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("leaderboard")}
          aria-label="Leaderboard Rank"
          aria-current={activeTab === "leaderboard" ? "page" : undefined}
          className={`flex-1 flex items-center justify-center h-[42px] rounded-full transition-all duration-300 focus:outline-none cursor-pointer group ${
            activeTab === "leaderboard"
              ? "bg-gradient-to-r from-[#0088cc] via-[#0098ea] to-[#00b0ff] text-white shadow-[0_4px_16px_rgba(0,152,234,0.38)] scale-105"
              : "flex-col text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 hover:scale-105 active:scale-90"
          }`}
        >
          <Trophy
            size={activeTab === "leaderboard" ? 22 : 19}
            className={activeTab === "leaderboard" ? "text-white" : "text-slate-500 group-hover:text-slate-900"}
          />
          {activeTab !== "leaderboard" && (
            <span className="text-[10px] mt-0.5 tracking-tight font-bold text-slate-500 group-hover:text-slate-900 leading-none">
              Rank
            </span>
          )}
        </button>

        {/* 4. Settings & Profile Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("profile")}
          aria-label="Settings"
          aria-current={activeTab === "profile" ? "page" : undefined}
          className={`flex-1 flex items-center justify-center h-[42px] rounded-full transition-all duration-300 focus:outline-none cursor-pointer group ${
            activeTab === "profile"
              ? "bg-gradient-to-r from-[#0088cc] via-[#0098ea] to-[#00b0ff] text-white shadow-[0_4px_16px_rgba(0,152,234,0.38)] scale-105"
              : "flex-col text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 hover:scale-105 active:scale-90"
          }`}
        >
          {user?.photo_url ? (
            <div
              className={`w-5 h-5 rounded-full overflow-hidden border ${
                activeTab === "profile" ? "border-white shadow-2xs" : "border-slate-300"
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
            <User
              size={activeTab === "profile" ? 22 : 19}
              className={activeTab === "profile" ? "text-white" : "text-slate-500 group-hover:text-slate-900"}
            />
          )}
          {activeTab !== "profile" && (
            <span className="text-[10px] mt-0.5 tracking-tight font-bold text-slate-500 group-hover:text-slate-900 leading-none">
              Settings
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
