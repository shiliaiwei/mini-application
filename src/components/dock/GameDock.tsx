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
  isVisible?: boolean;
}

// Apple Keyline Home Icon
const HomeIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
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

// Ad / Megaphone icon
const AdIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
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
    <path d="M3 11V13a1 1 0 0 0 1 1h1l1 4h2l-1-4h8l3 4h2l-3-4h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z" />
    <path d="M18 8 C18 8 20 9 20 12 C20 15 18 16 18 16" />
  </svg>
);

export const GameDock: React.FC<GameDockProps> = ({
  activeTab,
  onChangeTab,
  user,
  isVisible = true,
}) => {
  const tabs: {
    id: GameTab;
    label: string;
    icon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      id: "wallet",
      label: "Home",
      icon: (active) =>
        active ? (
          <div className="w-8 h-8 rounded-full bg-[#0098ea] text-white flex items-center justify-center shadow-xs transition-all duration-200">
            <HomeIcon size={18} className="text-white" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-0.5 px-2 rounded-full group-hover:bg-slate-100/70 transition-all">
            <HomeIcon size={19} className="text-slate-500 group-hover:text-slate-900" />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold text-slate-500 group-hover:text-slate-900 leading-none">
              Home
            </span>
          </div>
        ),
    },
    {
      id: "earn",
      label: "Missions",
      icon: (active) =>
        active ? (
          <div className="w-8 h-8 rounded-full bg-[#0098ea] text-white flex items-center justify-center shadow-xs transition-all duration-200">
            <Gift size={18} className="text-white" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-0.5 px-2 rounded-full group-hover:bg-slate-100/70 transition-all">
            <Gift size={19} className="text-slate-500 group-hover:text-slate-900" />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold text-slate-500 group-hover:text-slate-900 leading-none">
              Missions
            </span>
          </div>
        ),
    },
    {
      id: "leaderboard",
      label: "Rank",
      icon: (active) =>
        active ? (
          <div className="w-8 h-8 rounded-full bg-[#0098ea] text-white flex items-center justify-center shadow-xs transition-all duration-200">
            <Trophy size={18} className="text-white" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-0.5 px-2 rounded-full group-hover:bg-slate-100/70 transition-all">
            <Trophy size={19} className="text-slate-500 group-hover:text-slate-900" />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold text-slate-500 group-hover:text-slate-900 leading-none">
              Rank
            </span>
          </div>
        ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (active) =>
        active ? (
          <div className="w-8 h-8 rounded-full bg-[#0098ea] text-white flex items-center justify-center shadow-xs transition-all duration-200">
            {user?.photo_url ? (
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/60">
                <Image
                  src={user.photo_url}
                  alt="Profile"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <User size={18} className="text-white" />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-0.5 px-2 rounded-full group-hover:bg-slate-100/70 transition-all">
            {user?.photo_url ? (
              <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-300">
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
              <User size={19} className="text-slate-500 group-hover:text-slate-900" />
            )}
            <span className="text-[10px] mt-0.5 tracking-tight font-bold text-slate-500 group-hover:text-slate-900 leading-none">
              Profile
            </span>
          </div>
        ),
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation Dock"
      className={`fixed bottom-[max(0.85rem,env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 w-[97%] max-w-[420px] select-none font-sans transition-all duration-300 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      {/* Floating Apple-Style Dock */}
      <div className="rounded-full px-1 py-1.5 flex items-center justify-between border border-slate-200/80 shadow-[0_12px_32px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.06)] bg-white ring-1 ring-slate-900/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? "page" : undefined}
            className="flex-1 flex flex-col items-center justify-center h-[42px] transition-all focus:outline-none cursor-pointer group"
          >
            {tab.icon(activeTab === tab.id)}
          </button>
        ))}
      </div>
    </nav>
  );
};
