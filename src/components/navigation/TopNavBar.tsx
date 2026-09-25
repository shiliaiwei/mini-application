"use client";

import React from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";

interface TopNavBarProps {
  score: number;
  user: TelegramUser | null;
  onOpenTopUp: () => void;
  onOpenProfile: () => void;
  onLogoClick?: () => void;
}

/**
 * Universal Sticky Top Navigation Bar
 * Pinned at the top of all views:
 * - Left: Official single-line SHILIAI [WEI] logo
 * - Right: Real-time Vault Balance ($), Top Up button, and Profile avatar with L4 badge
 */
export const TopNavBar: React.FC<TopNavBarProps> = ({
  score,
  user,
  onOpenTopUp,
  onOpenProfile,
  onLogoClick,
}) => {
  const usdValue = (score / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-3 py-2 flex items-center justify-between gap-2 select-none font-body shadow-xs">
      {/* ── Left: Official Brand Logo ── */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onLogoClick}
          className="flex items-center cursor-pointer flex-shrink-0 text-left min-h-[40px] px-1 -ml-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
          aria-label="SHILIAIWEI Home"
        >
          <ShiliaiweiBrand height={22} colorScheme="blue" />
        </button>
      </div>

      {/* ── Right: Balance + Top Up + Profile ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Real-time USD Balance Capsule */}
        <div
          className="flex items-center bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1 text-xs font-black min-h-[36px]"
          aria-label={`Current Balance: $${usdValue}`}
        >
          <span className="text-[#16a34a] mr-1 font-bold">$</span>
          <span className="text-slate-900 font-display">{usdValue}</span>
        </div>

        {/* Top Up CTA */}
        <button
          type="button"
          onClick={onOpenTopUp}
          className="bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold px-3 py-2 rounded-full transition-all shadow-xs active:scale-95 min-h-[36px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0098ea] cursor-pointer"
        >
          Top up
        </button>

        {/* Profile Avatar Button */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-white overflow-visible transition-transform active:scale-95 min-w-[36px] min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] cursor-pointer"
          aria-label={`Open Profile for ${user?.first_name || "User"}, Level 4`}
          title="Profile"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border-2 border-[#0098ea] bg-white">
            <div className="w-full h-full bg-[#0098ea] flex items-center justify-center text-white font-bold text-xs">
              {user?.first_name ? user.first_name.slice(0, 2).toUpperCase() : "SH"}
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full text-[8px] font-black text-black border border-black/40 shadow-xs bg-[#0098ea]">
            L4
          </span>
          <span
            className="inline-flex items-center justify-center align-middle flex-shrink-0 absolute -top-1 -right-1 z-30 drop-shadow-xs"
            title="Verified Telegram Account"
          >
            <TelegramVerifiedBadge size={13} />
          </span>
        </button>
      </div>
    </header>
  );
};
