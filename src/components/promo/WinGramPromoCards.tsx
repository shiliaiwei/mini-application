"use client";

import React, { useState, useEffect, useRef } from "react";
import { TelegramWebApp } from "@/types/telegram";
import { InstitutionalAdCard } from "@/components/promo/InstitutionalAdCard";
import { MiniGameType } from "@/components/views/MiniGameFullView";
import {
  RotateCw,
  Zap,
  Brain,
  Grid3x3,
  Dice5,
  Layers,
} from "@/components/icons/KeylineIcons";

interface WinGramPromoCardsProps {
  score?: number;
  totalPlayed?: number;
  onAddScore?: (amount: number) => void;
  onOpenDeposit?: () => void;
  onOpenTapVault?: () => void;
  onOpenStats?: () => void;
  onOpenAdDetail?: (partnerId: string) => void;
  onSelectGame?: (game: MiniGameType) => void;
  tgApp: TelegramWebApp | null;
}

export interface FeatureGameCardItem {
  id: MiniGameType;
  title: string;
  rewardLabel: string;
  bgHex: string;
  accentHex: string;
  textHex: string;
  subtextHex: string;
  Icon: React.ElementType;
}

/**
 * Feature Game Cards — landscape blob-shape style with KeylineIcons
 */
export const FEATURE_GAME_CARDS: FeatureGameCardItem[] = [
  {
    id: "wheel",
    title: "Daily Spin",
    rewardLabel: "+500 PTS",
    bgHex: "#FFF8ED",
    accentHex: "#F59E0B",
    textHex: "#78350F",
    subtextHex: "#B45309",
    Icon: RotateCw,
  },
  {
    id: "word-flash",
    title: "Word Flash",
    rewardLabel: "+8 PTS",
    bgHex: "#0F172A",
    accentHex: "#38BDF8",
    textHex: "#F0F9FF",
    subtextHex: "#7DD3FC",
    Icon: Zap,
  },
  {
    id: "guess-faster",
    title: "Guess Words",
    rewardLabel: "+15 PTS",
    bgHex: "#EFF6FF",
    accentHex: "#3B82F6",
    textHex: "#1E3A8A",
    subtextHex: "#3B82F6",
    Icon: Brain,
  },
  {
    id: "row5",
    title: "Row Five",
    rewardLabel: "+25 PTS",
    bgHex: "#F5F3FF",
    accentHex: "#8B5CF6",
    textHex: "#3B0764",
    subtextHex: "#7C3AED",
    Icon: Grid3x3,
  },
  {
    id: "number-match",
    title: "Number Match",
    rewardLabel: "+50 PTS",
    bgHex: "#FFF7ED",
    accentHex: "#F97316",
    textHex: "#7C2D12",
    subtextHex: "#EA580C",
    Icon: Dice5,
  },
  {
    id: "flip-card",
    title: "Flip Card",
    rewardLabel: "+60 PTS",
    bgHex: "#F0FDF4",
    accentHex: "#10B981",
    textHex: "#064E3B",
    subtextHex: "#059669",
    Icon: Layers,
  },
];



/* ──────────────────────────────── CARD COMPONENT ──────────────────────────────── */
const FeatureCard: React.FC<{
  card: FeatureGameCardItem;
  index: number;
  onClick: () => void;
}> = ({ card, index, onClick }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delay = index * 80;
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  const Icon = card.Icon;

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="w-full cursor-pointer select-none outline-none group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-60px)",
        transition: "opacity 0.38s cubic-bezier(0.22, 1, 0.36, 1), transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        className="relative flex items-center overflow-hidden active:scale-[0.982] transition-transform duration-150"
        style={{
          backgroundColor: card.bgHex,
          borderRadius: "28px",
          border: `1.5px solid ${card.accentHex}28`,
          boxShadow: `0 2px 16px ${card.accentHex}18`,
          minHeight: "102px",
          padding: "0 10px 0 20px",
        }}
      >
        {/* Blob accent background shape */}
        <svg
          aria-hidden="true"
          className="absolute right-0 top-0 h-full pointer-events-none"
          viewBox="0 0 180 102"
          style={{ width: "180px" }}
          preserveAspectRatio="xMaxYMid meet"
        >
          <path
            d="M180,0 C180,0 130,8 110,30 C90,52 104,102 180,102 Z"
            fill={card.accentHex}
            opacity="0.12"
          />
        </svg>

        {/* Left: Text content */}
        <div className="flex-1 z-10 py-5 pr-2">
          {/* Reward chip */}
          <span
            className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full mb-2 leading-none tracking-wide"
            style={{
              backgroundColor: card.accentHex + "22",
              color: card.accentHex,
              border: `1px solid ${card.accentHex}40`,
            }}
          >
            {card.rewardLabel}
          </span>

          {/* Full Name Title — NO shortcut acronym */}
          <h3
            className="font-black leading-tight"
            style={{
              color: card.textHex,
              fontSize: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            {card.title}
          </h3>

          {/* Play line */}
          <p
            className="text-[11px] font-semibold mt-1 flex items-center gap-1"
            style={{ color: card.subtextHex }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: card.accentHex }}
            />
            Tap to play
          </p>
        </div>

        {/* Right: KeylineIcon inside styled container */}
        <div
          className="relative z-10 flex-shrink-0 flex items-center justify-center pr-2"
          style={{ width: "88px", height: "88px" }}
        >
          <div
            className="w-[64px] h-[64px] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200"
            style={{
              backgroundColor: card.accentHex + "20",
              border: `1.5px solid ${card.accentHex}35`,
              boxShadow: `0 4px 14px ${card.accentHex}15`,
            }}
          >
            <Icon
              size={36}
              color={card.accentHex}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────── MAIN COMPONENT ──────────────────────────────── */
export const WinGramPromoCards: React.FC<WinGramPromoCardsProps> = ({
  onOpenAdDetail,
  onOpenStats,
  onSelectGame,
  tgApp,
}) => {
  const handleLaunchGame = (game: MiniGameType) => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
    } catch {}
    onSelectGame?.(game);
  };

  return (
    <div className="relative select-none font-sans w-full space-y-3">
      {/* ── AD CARD ── */}
      <div className="w-full">
        <InstitutionalAdCard
          onOpenDetail={(partnerId) => {
            try {
              tgApp?.HapticFeedback?.impactOccurred("medium");
            } catch {}
            onOpenAdDetail?.(partnerId);
          }}
          onOpenStats={onOpenStats}
        />
      </div>

      {/* ── FEATURE GAME CARDS — landscape blob style, slide-from-left ── */}
      <div className="w-full space-y-2.5 pt-1">
        {FEATURE_GAME_CARDS.map((card, i) => (
          <FeatureCard
            key={card.id}
            card={card}
            index={i}
            onClick={() => handleLaunchGame(card.id)}
          />
        ))}
      </div>
    </div>
  );
};
