"use client";

import React from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import {
  Gift,
  Trophy,
  User,
} from "@/components/icons/KeylineIcons";

export type GameTab = "wallet" | "earn" | "leaderboard" | "profile";

export interface GameDockProps {
  activeTab: GameTab;
  onChangeTab: (tab: GameTab) => void;
  user: TelegramUser | null;
  isVisible?: boolean;
}

export const GameDock: React.FC<GameDockProps> = ({
  activeTab,
  onChangeTab,
  user,
  isVisible = true,
}) => {
  return (
    <nav
      aria-label="Bottom Navigation Dock"
      className={`fixed bottom-[max(0.85rem,env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-[420px] select-none font-sans transition-all duration-300 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      {/* DOCK BAR CONTAINER (4 TABS, NO PLUS CENTER BUTTON) */}
      <div className="relative rounded-[28px] h-[64px] px-2 flex items-stretch justify-between border border-white/90 shadow-[0_12px_36px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.06)] bg-white/95 backdrop-blur-2xl ring-1 ring-slate-900/5">
        {/* 1. Home Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("wallet")}
          aria-label="Home"
          aria-current={activeTab === "wallet" ? "page" : undefined}
          className="flex-1 flex flex-col items-center justify-between pt-1 pb-2 transition-all focus:outline-none cursor-pointer group relative"
        >
          {/* Active Top Indicator Pill */}
          <div
            className={`w-5 h-1 rounded-full bg-[#1b4d4f] transition-all duration-200 ${
              activeTab === "wallet" ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />

          {/* Icon */}
          <div className="flex items-center justify-center my-auto">
            {activeTab === "wallet" ? (
              <svg width="22" height="22" viewBox="0 0 24 24" className="text-[#1b4d4f]">
                <path
                  d="M12 3L3.5 10a1.5 1.5 0 0 0-.5 1.15V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7.85a1.5 1.5 0 0 0-.5-1.15L12 3z"
                  fill="currentColor"
                />
                <rect x="11.25" y="11.5" width="1.5" height="4.5" rx="0.75" fill="white" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400 group-hover:text-slate-600 transition-colors"
              >
                <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-5a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v5H4a1 1 0 0 1-1-1v-9.5z" />
              </svg>
            )}
          </div>

          {/* Label */}
          <span
            className={`text-[11px] leading-none transition-colors ${
              activeTab === "wallet"
                ? "font-bold text-[#1b4d4f]"
                : "font-medium text-slate-400 group-hover:text-slate-600"
            }`}
          >
            Home
          </span>
        </button>

        {/* 2. Missions Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("earn")}
          aria-label="Missions"
          aria-current={activeTab === "earn" ? "page" : undefined}
          className="flex-1 flex flex-col items-center justify-between pt-1 pb-2 transition-all focus:outline-none cursor-pointer group relative"
        >
          {/* Active Top Indicator Pill */}
          <div
            className={`w-5 h-1 rounded-full bg-[#1b4d4f] transition-all duration-200 ${
              activeTab === "earn" ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />

          {/* Icon */}
          <div className="flex items-center justify-center my-auto">
            <Gift
              size={21}
              className={`transition-colors ${
                activeTab === "earn"
                  ? "text-[#1b4d4f]"
                  : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
          </div>

          {/* Label */}
          <span
            className={`text-[11px] leading-none transition-colors ${
              activeTab === "earn"
                ? "font-bold text-[#1b4d4f]"
                : "font-medium text-slate-400 group-hover:text-slate-600"
            }`}
          >
            Missions
          </span>
        </button>

        {/* 3. Rank Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("leaderboard")}
          aria-label="Leaderboard Rank"
          aria-current={activeTab === "leaderboard" ? "page" : undefined}
          className="flex-1 flex flex-col items-center justify-between pt-1 pb-2 transition-all focus:outline-none cursor-pointer group relative"
        >
          {/* Active Top Indicator Pill */}
          <div
            className={`w-5 h-1 rounded-full bg-[#1b4d4f] transition-all duration-200 ${
              activeTab === "leaderboard" ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />

          {/* Icon */}
          <div className="flex items-center justify-center my-auto">
            <Trophy
              size={21}
              className={`transition-colors ${
                activeTab === "leaderboard"
                  ? "text-[#1b4d4f]"
                  : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
          </div>

          {/* Label */}
          <span
            className={`text-[11px] leading-none transition-colors ${
              activeTab === "leaderboard"
                ? "font-bold text-[#1b4d4f]"
                : "font-medium text-slate-400 group-hover:text-slate-600"
            }`}
          >
            Rank
          </span>
        </button>

        {/* 4. Profile Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("profile")}
          aria-label="Profile"
          aria-current={activeTab === "profile" ? "page" : undefined}
          className="flex-1 flex flex-col items-center justify-between pt-1 pb-2 transition-all focus:outline-none cursor-pointer group relative"
        >
          {/* Active Top Indicator Pill */}
          <div
            className={`w-5 h-1 rounded-full bg-[#1b4d4f] transition-all duration-200 ${
              activeTab === "profile" ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />

          {/* Icon */}
          <div className="flex items-center justify-center my-auto">
            {user?.photo_url ? (
              <div
                className={`w-[22px] h-[22px] rounded-full overflow-hidden border transition-all ${
                  activeTab === "profile"
                    ? "border-[#1b4d4f] ring-1 ring-[#1b4d4f]"
                    : "border-slate-300"
                }`}
              >
                <Image
                  src={user.photo_url}
                  alt="Profile"
                  width={22}
                  height={22}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <User
                size={21}
                className={`transition-colors ${
                  activeTab === "profile"
                    ? "text-[#1b4d4f]"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
            )}
          </div>

          {/* Label */}
          <span
            className={`text-[11px] leading-none transition-colors ${
              activeTab === "profile"
                ? "font-bold text-[#1b4d4f]"
                : "font-medium text-slate-400 group-hover:text-slate-600"
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
