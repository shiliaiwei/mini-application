"use client";

import React, { useRef } from "react";
import {
  Grid2x2,
  Star,
  Flame,
  Zap,
  Gift,
  Repeat,
  Trophy,
  ShieldCheck,
  ChevronRight,
  KeylineGamepad,
} from "@/components/icons/KeylineIcons";

export type NavCategory =
  | "lobby"
  | "vault"
  | "games"
  | "earn"
  | "swap"
  | "tournaments"
  | "favorites"
  | "popular"
  | "security";

interface CategoryBarProps {
  activeCategory: NavCategory;
  onSelectCategory: (cat: NavCategory) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const categories: Array<{ id: NavCategory; label: string; icon: React.ReactNode }> = [
    { id: "lobby", label: "Lobby", icon: <Grid2x2 size={16} /> },
    { id: "vault", label: "Tap Vault", icon: <Zap size={16} className="text-cyan-600" /> },
    { id: "games", label: "3D Games", icon: <KeylineGamepad size={16} className="text-[#0098ea]" /> },
    { id: "earn", label: "Missions", icon: <Gift size={16} className="text-amber-600" /> },
    { id: "swap", label: "DEX Swap", icon: <Repeat size={16} className="text-emerald-600" /> },
    { id: "tournaments", label: "Tournaments", icon: <Trophy size={16} className="text-yellow-600" /> },
    { id: "popular", label: "Popular", icon: <Flame size={16} className="text-red-500" /> },
    { id: "favorites", label: "Favorites", icon: <Star size={16} className="text-amber-500" /> },
    { id: "security", label: "Security", icon: <ShieldCheck size={16} className="text-blue-600" /> },
  ];

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 180, behavior: "smooth" });
    }
  };

  return (
    <nav aria-label="Feature categories" className="relative flex flex-col font-body">
      <div className="bg-white/95 backdrop-blur-xl px-2.5 py-1.5 select-none flex items-center gap-1 border-b border-slate-100">
        <div
          ref={scrollRef}
          role="tablist"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth flex-1 py-0.5"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all min-h-[38px] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] ${
                  isActive
                    ? "bg-[#0098ea] text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900 bg-slate-100/70 hover:bg-slate-200/80"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Next Arrow Button */}
        <button
          type="button"
          onClick={handleScrollRight}
          className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center flex-shrink-0 transition-colors shadow-xs ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
          aria-label="Scroll category bar right"
          title="Scroll Next"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Flower Banknote Security Guilloche Divider Strip (1033454350116.webp) */}
      <div className="w-full h-2.5 border-strip-flower opacity-75 border-b border-slate-200/60" />
    </nav>
  );
};

