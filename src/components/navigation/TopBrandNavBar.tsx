"use client";

import React from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";

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
 * 1. Top Padding: Exactly 60px (updated from 45px to 60px per instruction).
 * 2. Sticky: Stays fixed at the top across all pages and SPA views.
 * 3. Scope: Rendered on all views EXCEPT when in the profile menu.
 * 4. Brand: Official SHILIAI [WEI] logo with zero extra text alongside it.
 */
export const TopBrandNavBar: React.FC<TopBrandNavBarProps> = React.memo(({
  showBalances,
  onToggleBalances,
  onOpenNotifications,
  onOpenProfile,
  user,
  tgApp,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100/80 px-3 pt-[60px] pb-2 select-none font-sans shadow-2xs">
      <div className="max-w-xl mx-auto flex items-center justify-center px-1 min-h-[40px]">
        {/* Brand Logo - Centered Horizontally */}
        <ShiliaiweiBrand height={22} colorScheme="blue" />
      </div>
    </header>
  );
});

TopBrandNavBar.displayName = "TopBrandNavBar";
