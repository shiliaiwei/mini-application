"use client";

import React, { useState, useEffect } from "react";
import { TelegramWebApp } from "@/types/telegram";
import {
  Zap,
  Gift,
  Trophy,
  Flame,
  Star,
  ShieldCheck,
  Repeat,
  ChevronDown,
  ArrowUpRight,
  Check,
  Sparkles,
} from "@/components/icons/KeylineIcons";
import { NavCategory } from "@/components/navigation/CategoryBar";

export interface FeatureCardItem {
  id: string;
  title: string;
  badge: string;
  tag: string;
  description: string;
  actionText: string;
  category: NavCategory | "swap";
  accentColor: string;
  badgeBg: string;
  iconType: "vault" | "missions" | "tournaments" | "popular" | "favorites" | "settings" | "swap";
}

const DEFAULT_FEATURE_CARDS: FeatureCardItem[] = [
  {
    id: "vault",
    title: "Tap Vault",
    badge: "Active",
    tag: "Instant PTS",
    description: "Energy mining, daily tap yield & instant point claiming",
    actionText: "Open Vault",
    category: "vault",
    accentColor: "#0098ea",
    badgeBg: "bg-sky-50 text-[#0098ea] border-sky-200",
    iconType: "vault",
  },
  {
    id: "missions",
    title: "Missions",
    badge: "Streak",
    tag: "Daily Rewards",
    description: "Complete daily quests & check-ins to boost mining yield",
    actionText: "Claim Rewards",
    category: "earn",
    accentColor: "#ca8a04",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    iconType: "missions",
  },
  {
    id: "tournaments",
    title: "Tournaments",
    badge: "Live",
    tag: "Live Ranks",
    description: "Compete for global leaderboard dominance & TON prizes",
    actionText: "Join Tournament",
    category: "tournaments",
    accentColor: "#16a34a",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconType: "tournaments",
  },
  {
    id: "popular",
    title: "Popular Games",
    badge: "Hot",
    tag: "Hot Games",
    description: "Play verified Web3 mini games & score bonus points",
    actionText: "Explore Games",
    category: "popular",
    accentColor: "#dc2626",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    iconType: "popular",
  },
  {
    id: "favorites",
    title: "Favorites",
    badge: "Saved",
    tag: "Starred",
    description: "Quick access to your pinned vaults, games and links",
    actionText: "View Starred",
    category: "favorites",
    accentColor: "#f59e0b",
    badgeBg: "bg-yellow-50 text-yellow-700 border-yellow-200",
    iconType: "favorites",
  },
  {
    id: "settings",
    title: "Settings",
    badge: "Config",
    tag: "Telegram Config",
    description: "Manage Telegram authentication, DEX wallet & sound preferences",
    actionText: "Configure App",
    category: "settings",
    accentColor: "#0077b5",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    iconType: "settings",
  },
  {
    id: "swap",
    title: "Lobby Swap",
    badge: "0% Fee",
    tag: "Currency Exchange",
    description: "Instant seamless conversion between Khmer Riel and US Dollar",
    actionText: "Swap Currency",
    category: "swap",
    accentColor: "#7c3aed",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    iconType: "swap",
  },
];

interface BrandFeatureCardsProps {
  score: number;
  energy: number;
  maxEnergy: number;
  tapPower: number;
  onQuickTap?: () => void;
  onOpenTapVault: () => void;
  onSelectCategory: (cat: NavCategory | "swap") => void;
  tgApp: TelegramWebApp | null;
}

export const BrandFeatureCards: React.FC<BrandFeatureCardsProps> = ({
  score,
  energy,
  maxEnergy,
  tapPower,
  onQuickTap,
  onOpenTapVault,
  onSelectCategory,
  tgApp,
}) => {
  const [cards, setCards] = useState<FeatureCardItem[]>(DEFAULT_FEATURE_CARDS);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [reorderMode, setReorderMode] = useState(false);

  // Load user saved order from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shiliaiwei_feature_cards_order");
      if (saved) {
        const orderIds: string[] = JSON.parse(saved);
        const map = new Map(DEFAULT_FEATURE_CARDS.map((c) => [c.id, c]));
        const reordered: FeatureCardItem[] = [];
        orderIds.forEach((id) => {
          const item = map.get(id);
          if (item) {
            reordered.push(item);
            map.delete(id);
          }
        });
        // Append any remaining new cards
        map.forEach((item) => reordered.push(item));
        if (reordered.length > 0) {
          setCards(reordered);
        }
      }
    } catch {}
  }, []);

  const saveOrder = (newCards: FeatureCardItem[]) => {
    setCards(newCards);
    try {
      localStorage.setItem(
        "shiliaiwei_feature_cards_order",
        JSON.stringify(newCards.map((c) => c.id))
      );
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}
  };

  const handleDragStart = (idx: number, e: React.DragEvent) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setDragOverIdx(idx);
  };

  const handleDrop = (targetIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const updated = [...cards];
    const [moved] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, moved);
    saveOrder(updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleMoveCard = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;
    const updated = [...cards];
    const [item] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, item);
    saveOrder(updated);
  };

  const handleResetOrder = () => {
    saveOrder(DEFAULT_FEATURE_CARDS);
    try {
      localStorage.removeItem("shiliaiwei_feature_cards_order");
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
  };

  const handleCardClick = (card: FeatureCardItem) => {
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
    if (card.category === "vault") {
      onOpenTapVault();
    } else {
      onSelectCategory(card.category);
    }
  };

  const renderGraphicPreview = (card: FeatureCardItem) => {
    switch (card.iconType) {
      case "vault":
        return (
          <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 flex flex-col justify-between items-center relative overflow-hidden group-hover:bg-sky-50/50 transition-colors">
            <div className="flex items-center justify-between w-full text-[9px] font-extrabold text-slate-500">
              <span>ENERGY</span>
              <span className="text-[#0098ea] font-mono">{Math.round((energy / maxEnergy) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden my-1">
              <div
                className="bg-[#0098ea] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round((energy / maxEnergy) * 100)}%` }}
              />
            </div>
            {onQuickTap ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickTap();
                }}
                className="w-full py-1 rounded-lg bg-[#0098ea] hover:bg-[#0088cc] text-white text-[10px] font-black flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all"
              >
                <span>+{tapPower} PTS</span>
                <Zap size={11} />
              </button>
            ) : (
              <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                <Zap size={12} className="text-[#0098ea]" />
                <span>MINE</span>
              </div>
            )}
          </div>
        );

      case "missions":
        return (
          <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 flex flex-col justify-between items-center relative overflow-hidden group-hover:bg-amber-50/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
              <Gift size={18} />
            </div>
            <span className="text-[10px] font-black text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-full border border-amber-200/60">
              DAILY YIELD
            </span>
          </div>
        );

      case "tournaments":
        return (
          <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 flex flex-col justify-between items-center relative overflow-hidden group-hover:bg-emerald-50/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Trophy size={18} />
            </div>
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full border border-emerald-200/60">
              TOP RANKS
            </span>
          </div>
        );

      case "popular":
        return (
          <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 flex flex-col justify-between items-center relative overflow-hidden group-hover:bg-rose-50/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-rose-100/70 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
              <Flame size={18} />
            </div>
            <span className="text-[10px] font-black text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-full border border-rose-200/60">
              4 MINI GAMES
            </span>
          </div>
        );

      case "favorites":
        return (
          <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 flex flex-col justify-between items-center relative overflow-hidden group-hover:bg-yellow-50/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-yellow-100/70 border border-yellow-200 flex items-center justify-center text-yellow-700 shadow-2xs">
              <Star size={18} />
            </div>
            <span className="text-[10px] font-black text-yellow-800 bg-yellow-100/60 px-2 py-0.5 rounded-full border border-yellow-200/60">
              STARRED
            </span>
          </div>
        );

      case "settings":
        return (
          <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 flex flex-col justify-between items-center relative overflow-hidden group-hover:bg-blue-50/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-100/70 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs">
              <ShieldCheck size={18} />
            </div>
            <span className="text-[10px] font-black text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded-full border border-blue-200/60">
              AUTHENTICATED
            </span>
          </div>
        );

      case "swap":
        return (
          <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-200/90 p-2.5 flex flex-col justify-between items-center relative overflow-hidden group-hover:bg-purple-50/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-purple-100/70 border border-purple-200 flex items-center justify-center text-purple-700 shadow-2xs">
              <Repeat size={18} />
            </div>
            <span className="text-[10px] font-black text-purple-800 bg-purple-100/60 px-2 py-0.5 rounded-full border border-purple-200/60">
              KHR ⇄ USD
            </span>
          </div>
        );
    }
  };

  return (
    <section className="w-full space-y-2.5 select-none font-sans pt-1">
      {/* Header with ONE Clean Edit/Order Icon Button */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Feature Cards
        </span>

        {/* ONE Icon for Edit / Order */}
        <button
          type="button"
          onClick={() => {
            setReorderMode(!reorderMode);
            tgApp?.HapticFeedback?.selectionChanged();
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-2xs ${
            reorderMode
              ? "bg-[#0098ea] text-white border-[#0098ea]"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
          title={reorderMode ? "Done Reordering" : "Reorder Cards"}
          aria-label={reorderMode ? "Done Reordering" : "Reorder Cards"}
        >
          {reorderMode ? (
            <Check size={16} />
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 15l5 5 5-5" />
              <path d="M7 9l5-5 5 5" />
            </svg>
          )}
        </button>
      </div>

      {/* Stacked Horizontal Card Blocks List (Matching Reference Block Style) */}
      <div className="flex flex-col space-y-2.5">
        {cards.map((card, idx) => {
          const isDragging = draggedIdx === idx;
          const isOver = dragOverIdx === idx;

          return (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => handleDragStart(idx, e)}
              onDragOver={(e) => handleDragOver(idx, e)}
              onDrop={(e) => handleDrop(idx, e)}
              onDragEnd={handleDragEnd}
              onClick={() => handleCardClick(card)}
              className={`group relative w-full bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer overflow-hidden flex items-center justify-between ${
                isDragging
                  ? "opacity-50 scale-95 border-[#0098ea] shadow-lg"
                  : isOver
                  ? "border-[#0098ea] ring-2 ring-[#0098ea]/20 scale-[1.01]"
                  : reorderMode
                  ? "border-sky-300 shadow-xs"
                  : "border-slate-200/90 hover:border-slate-300 hover:shadow-sm active:scale-[0.99]"
              }`}
            >
              {/* Subtle Banknote Mesh Watermark across entire card */}
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.035]"
                style={{
                  backgroundImage: "url('/backgrounds/cardbanknote.svg')",
                }}
              />

              {/* Left Column: Grip Handle, Tags, Title, Subtitle, Action */}
              <div className="relative z-10 flex-1 min-w-0 pr-3 sm:pr-5 space-y-1.5">
                {/* Top Meta Line: Drag Grip + Tag Pill + Badge */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5"
                    title="Drag to reorder card"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 6-dots grip handle */}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="5" cy="4" r="1.5" />
                      <circle cx="11" cy="4" r="1.5" />
                      <circle cx="5" cy="8" r="1.5" />
                      <circle cx="11" cy="8" r="1.5" />
                      <circle cx="5" cy="12" r="1.5" />
                      <circle cx="11" cy="12" r="1.5" />
                    </svg>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${card.badgeBg}`}
                  >
                    {card.tag}
                  </span>

                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {card.badge}
                  </span>
                </div>

                {/* Title Line */}
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-[#0098ea] transition-colors leading-tight">
                    {card.title}
                  </h3>
                </div>

                {/* Subtitle / Description Line */}
                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-1 sm:line-clamp-2">
                  {card.description}
                </p>

                {/* Call to Action Line */}
                <div className="flex items-center gap-1 text-xs font-bold text-[#0098ea] group-hover:underline pt-0.5">
                  <span>{card.actionText}</span>
                  <ArrowUpRight size={14} className="text-[#0098ea]" />
                </div>
              </div>

              {/* Right Column: Graphic Preview or Reorder Controls in Edit Mode */}
              <div className="relative z-10 flex-shrink-0 w-24 sm:w-28 h-20 flex items-center justify-center">
                {reorderMode ? (
                  <div
                    className="w-full h-full rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex flex-col justify-between items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1.5 w-full">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveCard(idx, "up")}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-25 active:scale-95 transition-all shadow-2xs"
                        title="Move Up"
                        aria-label={`Move ${card.title} up`}
                      >
                        <ChevronDown size={14} className="rotate-180" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === cards.length - 1}
                        onClick={() => handleMoveCard(idx, "down")}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-25 active:scale-95 transition-all shadow-2xs"
                        title="Move Down"
                        aria-label={`Move ${card.title} down`}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <span className="text-[9px] font-black text-[#0098ea] tracking-wider uppercase">
                      Pos #{idx + 1}
                    </span>
                  </div>
                ) : (
                  renderGraphicPreview(card)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
