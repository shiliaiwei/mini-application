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
      <div className="rounded-full px-2 py-1.5 flex items-center justify-between border border-white/80 shadow-[0_12px_32px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.06)] bg-white/85 backdrop-blur-2xl ring-1 ring-slate-900/5">
        {/* 1. Home Tab (Changed from Vault to Home per user request) */}
        <button
          type="button"
          onClick={() => onChangeTab("wallet")}
          aria-label="Home"
          aria-current={activeTab === "wallet" ? "page" : undefined}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all min-h-[46px] focus:outline-none active:scale-90 ${
            activeTab === "wallet"
              ? "text-[#0098ea] font-extrabold bg-blue-50/90 shadow-2xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
        >
          <HomeIcon
            size={20}
            className={activeTab === "wallet" ? "text-[#0098ea]" : "text-slate-500"}
          />
          <span className="text-[10px] mt-0.5 tracking-wider font-bold">Home</span>
          {activeTab === "wallet" && (
            <span className="w-1 h-1 rounded-full bg-[#0098ea] mt-0.5" />
          )}
        </button>

        {/* 2. Missions Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("earn")}
          aria-label="Missions"
          aria-current={activeTab === "earn" ? "page" : undefined}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all min-h-[46px] focus:outline-none active:scale-90 ${
            activeTab === "earn"
              ? "text-[#0098ea] font-extrabold bg-blue-50/90 shadow-2xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
        >
          <Gift
            size={20}
            className={activeTab === "earn" ? "text-[#0098ea]" : "text-slate-500"}
          />
          <span className="text-[10px] mt-0.5 tracking-wider font-bold">Missions</span>
          {activeTab === "earn" && (
            <span className="w-1 h-1 rounded-full bg-[#0098ea] mt-0.5" />
          )}
        </button>

        {/* 3. Leaderboard Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("leaderboard")}
          aria-label="Leaderboard Rank"
          aria-current={activeTab === "leaderboard" ? "page" : undefined}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all min-h-[46px] focus:outline-none active:scale-90 ${
            activeTab === "leaderboard"
              ? "text-[#0098ea] font-extrabold bg-blue-50/90 shadow-2xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
        >
          <Trophy
            size={20}
            className={activeTab === "leaderboard" ? "text-[#0098ea]" : "text-slate-500"}
          />
          <span className="text-[10px] mt-0.5 tracking-wider font-bold">Rank</span>
          {activeTab === "leaderboard" && (
            <span className="w-1 h-1 rounded-full bg-[#0098ea] mt-0.5" />
          )}
        </button>

        {/* 4. Settings & Profile Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("profile")}
          aria-label="Settings"
          aria-current={activeTab === "profile" ? "page" : undefined}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all min-h-[46px] focus:outline-none active:scale-90 ${
            activeTab === "profile"
              ? "text-[#0098ea] font-extrabold bg-blue-50/90 shadow-2xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
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
                unoptimized
              />
            </div>
          ) : (
            <User
              size={20}
              className={activeTab === "profile" ? "text-[#0098ea]" : "text-slate-500"}
            />
          )}
          <span className="text-[10px] mt-0.5 tracking-wider font-bold">Settings</span>
          {activeTab === "profile" && (
            <span className="w-1 h-1 rounded-full bg-[#0098ea] mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
