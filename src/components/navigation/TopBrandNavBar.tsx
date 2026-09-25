"use client";

import React from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { Eye, EyeOff, Bell } from "@/components/icons/KeylineIcons";

interface TopBrandNavBarProps {
  showBalances: boolean;
  onToggleBalances: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  user: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
}

/**
 * Sticky Global Top Navigation Bar
 *
 * SPECIFICATIONS:
 * 1. Top Padding: Exactly 45px (updated from 32px to 45px per instruction).
 * 2. Sticky: Stays fixed at the top across all pages and SPA views.
 * 3. Scope: Rendered on all views EXCEPT when in the profile menu.
 * 4. Brand: Official SHILIAI [WEI] logo with zero extra text alongside it.
 */
export const TopBrandNavBar: React.FC<TopBrandNavBarProps> = ({
  showBalances,
  onToggleBalances,
  onOpenNotifications,
  onOpenProfile,
  user,
  tgApp,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100/80 px-3 pt-[45px] pb-2 select-none font-sans shadow-2xs">
      <div className="max-w-xl mx-auto flex items-center justify-between px-1">
        {/* Brand Logo (Full word logo: SHILIAI [WEI] on single line, tight 2px gap) */}
        <div className="flex items-center">
          <ShiliaiweiBrand height={22} colorScheme="blue" />
        </div>

        {/* Top Actions: Eye Toggle, Notifications, User Avatar */}
        <div className="flex items-center gap-1.5">
          {/* Eye Balance Toggle */}
          <button
            type="button"
            onClick={() => {
              try {
                tgApp?.HapticFeedback?.selectionChanged();
              } catch {}
              onToggleBalances();
            }}
            className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] cursor-pointer"
            aria-label={showBalances ? "Hide Balances" : "Show Balances"}
            title={showBalances ? "Hide Balances" : "Show Balances"}
          >
            {showBalances ? (
              <Eye size={20} className="text-slate-700" />
            ) : (
              <EyeOff size={20} className="text-slate-500" />
            )}
          </button>

          {/* Bell Notifications */}
          <button
            type="button"
            onClick={() => {
              try {
                tgApp?.HapticFeedback?.impactOccurred("light");
              } catch {}
              onOpenNotifications?.();
            }}
            className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] cursor-pointer relative"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={20} className="text-slate-700" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={() => {
              try {
                tgApp?.HapticFeedback?.impactOccurred("light");
              } catch {}
              onOpenProfile?.();
            }}
            className="flex items-center pl-1 cursor-pointer focus:outline-none group active:scale-95 transition-transform"
            aria-label="Open Profile"
            title="Profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800 transition-colors">
              {user?.first_name ? user.first_name.slice(0, 2).toUpperCase() : "VS"}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
