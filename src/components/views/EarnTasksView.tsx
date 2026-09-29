"use client";

import React, { useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  KeylineGamepad,
  Gift,
  Trophy,
  Coins,
  Sparkles,
  Play,
  CirclePlay,
  Zap,
  Star,
  Flame,
  Grid2x2,
  Crown,
  Award,
  ChevronRight,
  Check,
  CircleCheck,
  Info,
  Timer,
  X,
  Repeat,
} from "@/components/icons/KeylineIcons";
import { BrandFooter } from "@/components/brand/BrandFooter";

export interface EarnTasksViewProps {
  score?: number;
  onAddScore?: (amount: number) => void;
  tapPower?: number;
  onUpgradeTapPower?: () => void;
  passiveRate?: number;
  onUpgradePassiveRate?: () => void;
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
}

export type GameCategory = "ALL" | "CARDS" | "REFLEX" | "TACTICS";

export interface GameItem {
  id: string;
  titleEn: string;
  titleKm: string;
  category: "CARDS" | "REFLEX" | "TACTICS";
  categoryLabel: string;
  tag: string;
  rewardWei: number;
  description: string;
  isCardGame?: boolean;
  accentColor: string;
}

const GAMES_CATALOGUE: GameItem[] = [
  {
    id: "card_flip_duel",
    titleEn: "Flip Cards & Dual Deck",
    titleKm: "ល្បែងបៀបើកផ្គូផ្គង និងប្រយុទ្ធកាត",
    category: "CARDS",
    categoryLabel: "Card Game",
    tag: "Featured Card Game",
    rewardWei: 500,
    description: "High-speed card flip memory matching with combo multipliers and dual deck card battles.",
    isCardGame: true,
    accentColor: "from-[#ec4899] to-[#be185d]",
  },
  {
    id: "card_solitaire_tripeaks",
    titleEn: "Card Solitaire Tri-Peaks",
    titleKm: "បៀសូលីទែរត្រីកំពូល",
    category: "CARDS",
    categoryLabel: "Card Game",
    tag: "Card Cascade",
    rewardWei: 750,
    description: "Classic tactile card cascade with rapid ascending and descending sequence clears.",
    isCardGame: true,
    accentColor: "from-[#8b5cf6] to-[#6d28d9]",
  },
  {
    id: "card_road_sign_deck",
    titleEn: "Road Sign Card Deck",
    titleKm: "កាតសញ្ញាចរាចរណ៍កម្ពុជា",
    category: "CARDS",
    categoryLabel: "Card Game",
    tag: "247 Signs Deck",
    rewardWei: 600,
    description: "Tactical flashcard duel deck matching authentic road sign graphics to defensive driving rules.",
    isCardGame: true,
    accentColor: "from-[#0098ea] to-[#0070aa]",
  },
  {
    id: "lucky_wheel",
    titleEn: "Lucky Wheel of Fortune",
    titleKm: "រង្វង់សំណាងប្រចាំថ្ងៃ",
    category: "TACTICS",
    categoryLabel: "Daily Chance",
    tag: "Daily Spin",
    rewardWei: 2500,
    description: "Daily fortune wheel with multiplier slices, jackpot vaults, and golden ticket respins.",
    accentColor: "from-[#f59e0b] to-[#b45309]",
  },
  {
    id: "word_flash",
    titleEn: "Word Flash Reflex",
    titleKm: "ពាក្យរហ័សឆ្លុះបញ្ចាំង",
    category: "REFLEX",
    categoryLabel: "Speed & Reflex",
    tag: "High Reflex",
    rewardWei: 350,
    description: "Fast reflex recognition of Khmer and English safety and crypto keywords before time expires.",
    accentColor: "from-[#06b6d4] to-[#0e7490]",
  },
  {
    id: "guess_faster",
    titleEn: "Guess Faster Quiz",
    titleKm: "ទាយល្បឿនលឿន",
    category: "REFLEX",
    categoryLabel: "Speed & Reflex",
    tag: "3s Rapid Quiz",
    rewardWei: 400,
    description: "Rapid-fire challenge testing road priority rules, speed regulations, and priority signs.",
    accentColor: "from-[#10b981] to-[#047857]",
  },
  {
    id: "row_5_gomoku",
    titleEn: "Row 5 Gomoku Tactics",
    titleKm: "ហ្គោម៉ូគុ ៥ គ្រាប់យុទ្ធសាស្ត្រ",
    category: "TACTICS",
    categoryLabel: "Tactical Strategy",
    tag: "Board Strategy",
    rewardWei: 600,
    description: "Strategic 5-in-a-row board combat on a digital stone grid against AI and peer players.",
    accentColor: "from-[#6366f1] to-[#4338ca]",
  },
  {
    id: "number_match",
    titleEn: "Number Match Grid",
    titleKm: "ផ្គូផ្គងលេខឡូជីខល",
    category: "REFLEX",
    categoryLabel: "Logic Puzzle",
    tag: "Pattern Solver",
    rewardWei: 300,
    description: "Numerical pattern matching, sliding sum grids, and crypto sequence logic puzzles.",
    accentColor: "from-[#f97316] to-[#c2410c]",
  },
];

export const EarnTasksView: React.FC<EarnTasksViewProps> = React.memo(({
  score = 0,
  tgApp,
}) => {
  const [activeCategory, setActiveCategory] = useState<GameCategory>("ALL");
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulated card game flip state for interactive preview
  const [flippedCards, setFlippedCards] = useState<number[]>([0, 2]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    try {
      tgApp?.HapticFeedback?.notificationOccurred?.("success");
    } catch {}
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleToggleCardFlip = (idx: number) => {
    try {
      tgApp?.HapticFeedback?.impactOccurred?.("light");
    } catch {}
    setFlippedCards((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const filteredGames = GAMES_CATALOGUE.filter((game) => {
    if (activeCategory === "ALL") return true;
    return game.category === activeCategory;
  });

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pt-1 pb-28 select-none font-sans text-slate-900 px-1">
      {/* ============================================================== */}
      {/* 1. SKEUOMORPHIC PURPLE LEATHER HEADER BANNER                   */}
      {/* ============================================================== */}
      <div
        className="relative w-full rounded-[26px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#6420a7] via-[#4e1688] to-[#340b5c] text-white"
        style={{
          boxShadow:
            "0 20px 42px -10px rgba(45, 10, 80, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Guilloche Banknote Background */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
          style={{
            backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover",
            filter: "contrast(1.35) brightness(1.1)",
          }}
        />

        {/* Simulated Thread Perimeter Stitching */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="6"
            y="6"
            width="calc(100% - 12px)"
            height="calc(100% - 12px)"
            rx="20"
            ry="20"
            fill="none"
            stroke="#e9d5ff"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            opacity="0.45"
            style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
          />
        </svg>

        {/* Top Specular Rim */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-purple-100">
                Arcade & Missions Vault
              </span>
              <span className="text-[10px] text-purple-200/80 font-mono">
                8 Games Registered
              </span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/25 border border-purple-300/25 text-white font-mono text-xs font-bold shadow-xs">
              <Coins size={14} className="text-cyan-300" />
              <span>{score.toLocaleString()} WEI</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm">
              Game Arcade & Mission Hub
            </h2>
            <p className="text-xs text-purple-200/80 mt-1 leading-snug">
              Play interactive mini-games, test card deck skills, and claim daily WEI COIN rewards.
            </p>
          </div>

          {/* Quick Mission Stat Strip */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-black/20 border border-purple-300/20 text-center">
              <span className="text-[9px] uppercase font-bold text-purple-300/70 block">Card Games</span>
              <span className="text-sm font-black text-white">3 Available</span>
            </div>
            <div className="p-2 rounded-xl bg-black/20 border border-purple-300/20 text-center">
              <span className="text-[9px] uppercase font-bold text-purple-300/70 block">Total Rewards</span>
              <span className="text-sm font-black text-cyan-300">+6,000 WEI</span>
            </div>
            <div className="p-2 rounded-xl bg-black/20 border border-purple-300/20 text-center">
              <span className="text-[9px] uppercase font-bold text-purple-300/70 block">Engine Mode</span>
              <span className="text-sm font-black text-emerald-300">UI Showcase</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CATEGORY FILTER TABS (FROSTED GLASSMORPHISM PILLS)          */}
      {/* ============================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "ALL" as GameCategory, label: "All Games (8)" },
          { id: "CARDS" as GameCategory, label: "Card Games (3)" },
          { id: "REFLEX" as GameCategory, label: "Speed & Reflex (3)" },
          { id: "TACTICS" as GameCategory, label: "Tactics & Luck (2)" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveCategory(tab.id);
              try {
                tgApp?.HapticFeedback?.selectionChanged();
              } catch {}
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab.id
                ? "bg-gradient-to-r from-[#6420a7] to-[#4e1688] text-white shadow-sm border border-purple-300/40"
                : "bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-2xs"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 3. FEATURED SPOTLIGHT: FLIP CARDS & DUAL DECK GAME              */}
      {/* ============================================================== */}
      {(activeCategory === "ALL" || activeCategory === "CARDS") && (
        <div
          className="relative w-full rounded-[26px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#6420a7] via-[#4e1688] to-[#340b5c] text-white cursor-pointer active:scale-[0.99] transition-all group"
          style={{
            boxShadow:
              "0 18px 36px -8px rgba(45, 10, 80, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.5)",
          }}
          onClick={() => setSelectedGame(GAMES_CATALOGUE[0])}
        >
          {/* Guilloche Banknote Background */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
            style={{
              backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              filter: "contrast(1.35) brightness(1.1)",
            }}
          />

          {/* Perimeter Stitching */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="6"
              y="6"
              width="calc(100% - 12px)"
              height="calc(100% - 12px)"
              rx="20"
              ry="20"
              fill="none"
              stroke="#e9d5ff"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              opacity="0.45"
              style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
            />
          </svg>

          {/* Top Specular Rim */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-rose-200">
                Featured Card Game
              </span>
              <span className="text-xs font-bold text-cyan-300 font-mono">
                +500 WEI COIN
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white leading-tight">
                  Flip Cards & Dual Deck (ល្បែងបៀបើកផ្គូផ្គង)
                </h3>
                <p className="text-xs text-purple-200/80 leading-snug max-w-sm">
                  Flip playing cards to reveal matching suits and numbers. Multi-card combo streaks multiply your session score.
                </p>
              </div>

              {/* 3D Stacked Playing Card Preview Graphic */}
              <div className="relative w-16 h-20 shrink-0">
                {/* Back card */}
                <div className="absolute inset-0 rounded-xl bg-purple-950 border border-purple-400/40 transform -rotate-6 shadow-md" />
                {/* Front card with satin sheen */}
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#d8b4fe] via-[#a855f7] to-[#7e22ce] border border-white/50 transform rotate-3 flex flex-col items-center justify-between p-1.5 text-white shadow-lg"
                  style={{
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7)",
                  }}
                >
                  <span className="text-[9px] font-black leading-none self-start">A</span>
                  <Sparkles size={16} className="text-white" />
                  <span className="text-[9px] font-black leading-none self-end">A</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-purple-200/70 font-medium">
                Tap card to launch interactive UI simulator
              </span>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Play size={13} className="text-cyan-300" />
                <span>Preview UI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. GAMES ROSTER GRID                                           */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Games ({filteredGames.length})
          </h4>
          <span className="text-[11px] text-slate-400">
            Skeuomorphic Card Suite
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className="relative rounded-[24px] p-4 overflow-hidden bg-gradient-to-b from-[#6420a7] via-[#4e1688] to-[#340b5c] text-white cursor-pointer active:scale-[0.99] transition-all group flex flex-col justify-between"
              style={{
                boxShadow:
                  "0 14px 28px -6px rgba(45, 10, 80, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 6px rgba(0, 0, 0, 0.45)",
              }}
            >
              {/* Guilloche Banknote Background */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20"
                style={{
                  backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center center",
                  backgroundSize: "cover",
                  filter: "contrast(1.35) brightness(1.1)",
                }}
              />

              {/* Perimeter Stitching */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="5"
                  y="5"
                  width="calc(100% - 10px)"
                  height="calc(100% - 10px)"
                  rx="18"
                  ry="18"
                  fill="none"
                  stroke="#e9d5ff"
                  strokeWidth="1.1"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  opacity="0.4"
                  style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
                />
              </svg>

              {/* Top Specular Rim */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-2.5">
                {/* Header Tag and Reward */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-purple-100">
                    {game.tag}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    +{game.rewardWei} WEI
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-base font-bold text-white leading-tight">
                    {game.titleEn}
                  </h4>
                  <div className="text-[11px] text-purple-200/70 font-medium">
                    {game.titleKm}
                  </div>
                  <p className="text-xs text-purple-100/80 mt-1 leading-snug line-clamp-2">
                    {game.description}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-purple-300/70 font-mono">
                  {game.categoryLabel}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGame(game);
                  }}
                  className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                >
                  <span>Launch UI</span>
                  <ChevronRight size={13} className="text-cyan-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. INTERACTIVE GAME UI PREVIEW MODAL (UI ONLY)                 */}
      {/* ============================================================== */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="relative w-full max-w-lg rounded-[28px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#6420a7] via-[#4e1688] to-[#340b5c] text-white shadow-2xl border border-purple-300/30 space-y-4 max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow:
                "0 24px 48px -12px rgba(45, 10, 80, 0.7), inset 0 2px 3px rgba(255, 255, 255, 0.4), inset 0 -3px 8px rgba(0, 0, 0, 0.6)",
            }}
          >
            {/* Guilloche Banknote Background */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
              style={{
                backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "cover",
                filter: "contrast(1.35) brightness(1.1)",
              }}
            />

            {/* Perimeter Stitching */}
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

            {/* Top Specular Rim */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

            {/* Modal Header */}
            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/15">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-purple-100">
                  UI Simulation Mode
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedGame.titleEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGame(null)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simulated Game Arena */}
            <div className="relative z-10 space-y-3">
              <div className="p-3 rounded-2xl bg-black/30 border border-purple-300/20 text-center">
                <span className="text-xs text-purple-200/80">
                  {selectedGame.description}
                </span>
              </div>

              {/* CARD GAME ARENA: FLIP CARDS PREVIEW */}
              {selectedGame.isCardGame && (
                <div className="p-4 rounded-2xl bg-black/25 border border-purple-300/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-200">
                    <span>Interactive Card Flip Deck</span>
                    <span className="text-cyan-300">Tap any card to flip</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: "A", suit: "WEI" },
                      { val: "K", suit: "USD" },
                      { val: "A", suit: "WEI" },
                      { val: "Q", suit: "KHR" },
                      { val: "10", suit: "ROAD" },
                      { val: "K", suit: "USD" },
                      { val: "10", suit: "ROAD" },
                      { val: "Q", suit: "KHR" },
                    ].map((card, idx) => {
                      const isFlipped = flippedCards.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleCardFlip(idx)}
                          className={`h-20 rounded-xl cursor-pointer transition-all duration-300 transform flex flex-col items-center justify-center p-1 font-bold ${
                            isFlipped
                              ? "bg-gradient-to-br from-[#d8b4fe] via-[#a855f7] to-[#7e22ce] text-white border-2 border-white/70 shadow-md rotate-y-180"
                              : "bg-[#2e0854] border-2 border-purple-400/40 text-purple-300 hover:border-purple-300"
                          }`}
                          style={{
                            boxShadow: isFlipped
                              ? "0 4px 12px rgba(168, 85, 247, 0.4), inset 0 1px 1px rgba(255,255,255,0.6)"
                              : "inset 0 1px 2px rgba(0,0,0,0.5)",
                          }}
                        >
                          {isFlipped ? (
                            <>
                              <span className="text-xs font-black">{card.val}</span>
                              <Sparkles size={14} className="my-0.5" />
                              <span className="text-[9px] uppercase font-mono">{card.suit}</span>
                            </>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-base font-black text-purple-400">WEI</span>
                              <span className="text-[8px] tracking-widest text-purple-300/60">CARD</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NON-CARD GAME ARENA PREVIEW */}
              {!selectedGame.isCardGame && (
                <div className="p-6 rounded-2xl bg-black/25 border border-purple-300/20 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                    <KeylineGamepad size={32} />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {selectedGame.titleEn} Playground
                  </h4>
                  <p className="text-xs text-purple-200/80 max-w-xs mx-auto">
                    Full mechanical gameplay engine will launch in the next sprint. UI layout and reward hooks are fully staged.
                  </p>
                </div>
              )}

              {/* Reward and Action Buttons */}
              <div className="p-3 rounded-2xl bg-black/25 border border-purple-300/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-purple-300/70 uppercase block">Completion Reward</span>
                  <span className="text-sm font-black text-cyan-300 font-mono">+{selectedGame.rewardWei} WEI COIN</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast(`Claimed test preview reward for ${selectedGame.titleEn}!`)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0098ea] via-[#0088cc] to-[#005f99] text-white font-bold text-xs shadow-md border border-cyan-300/40 active:scale-95 transition-all"
                >
                  Test Claim Reward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 inset-x-4 max-w-sm mx-auto z-50 p-3 rounded-2xl bg-[#340b5c] border border-purple-300/40 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-fadeIn">
          <CircleCheck size={16} className="text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Brand Footer */}
      <BrandFooter height={16} className="mt-4 pb-2" />
    </div>
  );
});

EarnTasksView.displayName = "EarnTasksView";
