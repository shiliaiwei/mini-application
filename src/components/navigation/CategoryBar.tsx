"use client";

import React, { useRef } from "react";
import {
  Grid2X2,
  Star,
  Flame,
  Zap,
  Gift,
  Repeat,
  Trophy,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Gamepad2,
} from "lucide-react";

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
    { id: "lobby", label: "Lobby", icon: <Grid2X2 className="w-3.5 h-3.5" /> },
    { id: "vault", label: "Tap Vault", icon: <Zap className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: "games", label: "3D Games", icon: <Gamepad2 className="w-3.5 h-3.5 text-[#0098ea]" /> },
    { id: "earn", label: "Missions", icon: <Gift className="w-3.5 h-3.5 text-amber-400" /> },
    { id: "swap", label: "DEX Swap", icon: <Repeat className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: "tournaments", label: "Tournaments", icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" /> },
    { id: "popular", label: "Popular", icon: <Flame className="w-3.5 h-3.5 text-red-400" /> },
    { id: "favorites", label: "Favorites", icon: <Star className="w-3.5 h-3.5" /> },
    { id: "security", label: "Security", icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> },
  ];

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 160, behavior: "smooth" });
    }
  };

  return (
    <div className="relative bg-white/80 backdrop-blur-xl border-b border-slate-200/90 px-3 py-2 select-none flex items-center gap-1 font-body">
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#0098ea] text-white shadow-sm shadow-[#0098ea]/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
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
        className="w-7 h-7 rounded-full bg-white/90 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center flex-shrink-0 transition-colors shadow-sm ml-1"
        title="Scroll Next"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
