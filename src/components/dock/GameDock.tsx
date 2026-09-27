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

export const GameDock: React.FC<GameDockProps> = React.memo(({
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
      {/* 3D SKEUOMORPHIC PURPLE LEATHER DOCK CONTAINER */}
      <div
        className="relative rounded-[28px] h-[66px] px-2 flex items-stretch justify-between overflow-hidden bg-gradient-to-b from-[#5c1c99] via-[#48127f] to-[#320a59]"
        style={{
          boxShadow:
            "0 18px 40px -10px rgba(35, 6, 65, 0.75), 0 8px 16px -4px rgba(25, 4, 45, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 6px rgba(0, 0, 0, 0.55)",
        }}
      >
        {/* Simulated Leather Grain Texture Overlay */}
        <div
          className="absolute inset-0 rounded-[28px] opacity-15 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(0,0,0,0.5) 1px, transparent 1px)`,
            backgroundSize: "6px 6px, 8px 8px",
          }}
        />

        {/* Perimeter Simulated Thread Stitching (Light Lavender Dashed Lines) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="6"
            y="6"
            width="calc(100% - 12px)"
            height="calc(100% - 12px)"
            rx="22"
            ry="22"
            fill="none"
            stroke="#e9d5ff"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            opacity="0.45"
            style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
          />
        </svg>

        {/* 3D Top Specular Rim Highlight */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-20" />

        {/* 1. Home Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("wallet")}
          aria-label="Home"
          aria-current={activeTab === "wallet" ? "page" : undefined}
          className="relative z-20 flex-1 flex flex-col items-center justify-between pt-1.5 pb-2 transition-all focus:outline-none cursor-pointer group"
        >
          {/* Active Top Indicator Pill */}
          <div
            className={`w-6 h-1 rounded-full bg-gradient-to-r from-purple-200 via-white to-purple-200 shadow-[0_0_8px_rgba(233,213,255,0.9)] transition-all duration-200 ${
              activeTab === "wallet" ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />

          {/* Icon */}
          <div className="flex items-center justify-center my-auto transition-transform duration-200 group-hover:scale-105">
            {activeTab === "wallet" ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                className="text-white filter drop-shadow-[0_1px_4px_rgba(255,255,255,0.4)]"
              >
                <path
                  d="M12 3L3.5 10a1.5 1.5 0 0 0-.5 1.15V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7.85a1.5 1.5 0 0 0-.5-1.15L12 3z"
                  fill="currentColor"
                />
                <rect x="11.25" y="11.5" width="1.5" height="4.5" rx="0.75" fill="#5c1c99" />
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
                className="text-purple-200/50 group-hover:text-purple-100 transition-colors"
              >
                <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-5a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v5H4a1 1 0 0 1-1-1v-9.5z" />
              </svg>
            )}
          </div>

          {/* Label */}
          <span
            className={`text-[11px] leading-none transition-colors ${
              activeTab === "wallet"
                ? "font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                : "font-medium text-purple-200/50 group-hover:text-purple-100"
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
          className="relative z-20 flex-1 flex flex-col items-center justify-between pt-1.5 pb-2 transition-all focus:outline-none cursor-pointer group"
        >
          {/* Active Top Indicator Pill */}
          <div
            className={`w-6 h-1 rounded-full bg-gradient-to-r from-purple-200 via-white to-purple-200 shadow-[0_0_8px_rgba(233,213,255,0.9)] transition-all duration-200 ${
              activeTab === "earn" ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />

          {/* Icon */}
          <div className="flex items-center justify-center my-auto transition-transform duration-200 group-hover:scale-105">
            <Gift
              size={21}
              className={`transition-colors ${
                activeTab === "earn"
                  ? "text-white filter drop-shadow-[0_1px_4px_rgba(255,255,255,0.4)]"
                  : "text-purple-200/50 group-hover:text-purple-100"
              }`}
            />
          </div>

          {/* Label */}
          <span
            className={`text-[11px] leading-none transition-colors ${
              activeTab === "earn"
                ? "font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                : "font-medium text-purple-200/50 group-hover:text-purple-100"
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
          className="relative z-20 flex-1 flex flex-col items-center justify-between pt-1.5 pb-2 transition-all focus:outline-none cursor-pointer group"
        >
          {/* Active Top Indicator Pill */}
          <div
            className={`w-6 h-1 rounded-full bg-gradient-to-r from-purple-200 via-white to-purple-200 shadow-[0_0_8px_rgba(233,213,255,0.9)] transition-all duration-200 ${
              activeTab === "leaderboard" ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />

          {/* Icon */}
          <div className="flex items-center justify-center my-auto transition-transform duration-200 group-hover:scale-105">
            <Trophy
              size={21}
              className={`transition-colors ${
                activeTab === "leaderboard"
                  ? "text-white filter drop-shadow-[0_1px_4px_rgba(255,255,255,0.4)]"
                  : "text-purple-200/50 group-hover:text-purple-100"
              }`}
            />
          </div>

          {/* Label */}
          <span
            className={`text-[11px] leading-none transition-colors ${
              activeTab === "leaderboard"
                ? "font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                : "font-medium text-purple-200/50 group-hover:text-purple-100"
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
          className="relative z-20 flex-1 flex flex-col items-center justify-between pt-1.5 pb-2 transition-all focus:outline-none cursor-pointer group"
        >
          {/* Active Top Indicator Pill */}
          <div
            className={`w-6 h-1 rounded-full bg-gradient-to-r from-purple-200 via-white to-purple-200 shadow-[0_0_8px_rgba(233,213,255,0.9)] transition-all duration-200 ${
              activeTab === "profile" ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />

          {/* Icon */}
          <div className="flex items-center justify-center my-auto transition-transform duration-200 group-hover:scale-105">
            {user?.photo_url ? (
              <div
                className={`w-[22px] h-[22px] rounded-full overflow-hidden border transition-all ${
                  activeTab === "profile"
                    ? "border-white ring-2 ring-purple-300 shadow-[0_0_8px_rgba(233,213,255,0.6)]"
                    : "border-purple-300/40"
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
                    ? "text-white filter drop-shadow-[0_1px_4px_rgba(255,255,255,0.4)]"
                    : "text-purple-200/50 group-hover:text-purple-100"
                }`}
              />
            )}
          </div>

          {/* Label */}
          <span
            className={`text-[11px] leading-none transition-colors ${
              activeTab === "profile"
                ? "font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                : "font-medium text-purple-200/50 group-hover:text-purple-100"
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
});

GameDock.displayName = "GameDock";
