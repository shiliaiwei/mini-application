import React from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import {
  Wallet,
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

export const GameDock: React.FC<GameDockProps> = ({
  activeTab,
  onChangeTab,
  user,
}) => {
  return (
    <nav
      aria-label="Bottom Navigation Dock"
      className="fixed bottom-[max(0.6rem,env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-[440px] select-none font-body"
    >
      <div className="rounded-2xl px-2 py-1.5 flex items-center justify-between border border-slate-200 shadow-2xl bg-white/95 backdrop-blur-xl">
        {/* Wallet / Vault Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("wallet")}
          aria-label="Vault"
          aria-current={activeTab === "wallet" ? "page" : undefined}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] active:scale-95 ${
            activeTab === "wallet"
              ? "text-[#0098ea] font-black bg-blue-50/80"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wallet size={22} className={activeTab === "wallet" ? "text-[#0098ea]" : "text-slate-600"} />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-bold">Vault</span>
        </button>

        {/* Earn / Missions Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("earn")}
          aria-label="Earn Missions"
          aria-current={activeTab === "earn" ? "page" : undefined}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] active:scale-95 ${
            activeTab === "earn"
              ? "text-[#0098ea] font-black bg-blue-50/80"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Gift size={22} className={activeTab === "earn" ? "text-[#0098ea]" : "text-slate-600"} />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-bold">Missions</span>
        </button>

        {/* Leaderboard Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("leaderboard")}
          aria-label="Leaderboard Rank"
          aria-current={activeTab === "leaderboard" ? "page" : undefined}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] active:scale-95 ${
            activeTab === "leaderboard"
              ? "text-[#0098ea] font-black bg-blue-50/80"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Trophy size={22} className={activeTab === "leaderboard" ? "text-[#0098ea]" : "text-slate-600"} />
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-bold">Rank</span>
        </button>

        {/* Profile / Settings Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("profile")}
          aria-label="Settings & Profile"
          aria-current={activeTab === "profile" ? "page" : undefined}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] active:scale-95 ${
            activeTab === "profile"
              ? "text-[#0098ea] font-black bg-blue-50/80"
              : "text-slate-600 hover:text-slate-900"
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
            <User size={22} className={activeTab === "profile" ? "text-[#0098ea]" : "text-slate-600"} />
          )}
          <span className="text-[10px] mt-0.5 tracking-wider uppercase font-bold">Settings</span>
        </button>
      </div>
    </nav>
  );
};

