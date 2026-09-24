"use client";

import React from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import { Home, Database, Settings, User } from "lucide-react";

export type TabType = "home" | "database" | "settings" | "profile";

interface DockerMenuProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  user: TelegramUser | null;
  dbOnline?: boolean;
}

export const DockerMenu: React.FC<DockerMenuProps> = ({
  activeTab,
  onChangeTab,
  user,
  dbOnline = true,
}) => {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[390px] select-none">
      {/* Floating Pill Dock matching User Reference Image 1 */}
      <div className="liquid-dock rounded-full px-3 py-2 flex items-center justify-around shadow-2xl">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => onChangeTab("home")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 ${
            activeTab === "home"
              ? "text-sky-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform duration-200 ${activeTab === "home" ? "scale-110" : ""}`} />
            {activeTab === "home" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* Tab 2: Database (what database you connect to) */}
        <button
          type="button"
          onClick={() => onChangeTab("database")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 ${
            activeTab === "database"
              ? "text-sky-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Database className={`w-5 h-5 transition-transform duration-200 ${activeTab === "database" ? "scale-110" : ""}`} />
            {/* Live DB indicator dot */}
            <span
              className={`absolute -top-0.5 -right-1 w-2 h-2 rounded-full border border-[#161f2e] ${
                dbOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            {activeTab === "database" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Database</span>
        </button>

        {/* Tab 3: App Settings (matching Image 2 & 3) */}
        <button
          type="button"
          onClick={() => onChangeTab("settings")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 ${
            activeTab === "settings"
              ? "text-sky-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Settings className={`w-5 h-5 transition-transform duration-200 ${activeTab === "settings" ? "scale-110" : ""}`} />
            {activeTab === "settings" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Settings</span>
        </button>

        {/* Tab 4: Profile (Telegram User Avatar or User icon) */}
        <button
          type="button"
          onClick={() => onChangeTab("profile")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 ${
            activeTab === "profile"
              ? "text-sky-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            {user?.photo_url ? (
              <div
                className={`w-5 h-5 rounded-full overflow-hidden border ${
                  activeTab === "profile" ? "border-sky-400 ring-2 ring-sky-400/30" : "border-slate-500"
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
              <User className={`w-5 h-5 transition-transform duration-200 ${activeTab === "profile" ? "scale-110" : ""}`} />
            )}
            {activeTab === "profile" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
