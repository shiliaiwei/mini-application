"use client";

import React, { useState, useEffect, useRef } from "react";
import { TelegramWebApp } from "@/types/telegram";
import { InstitutionalAdCard } from "@/components/promo/InstitutionalAdCard";
import { MiniGameType } from "@/components/views/MiniGameFullView";

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
  illustration: "wheel" | "car" | "luggage" | "sneaker" | "heart" | "cards";
}

/**
 * Feature Game Cards — landscape blob-shape style
 * Each card: premium unique color, 3D SVG icon, full name, no shortcut acronym
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
    illustration: "wheel",
  },
  {
    id: "word-flash",
    title: "Word Flash",
    rewardLabel: "+8 PTS",
    bgHex: "#0F172A",
    accentHex: "#38BDF8",
    textHex: "#F0F9FF",
    subtextHex: "#7DD3FC",
    illustration: "car",
  },
  {
    id: "guess-faster",
    title: "Guess Words",
    rewardLabel: "+15 PTS",
    bgHex: "#EFF6FF",
    accentHex: "#3B82F6",
    textHex: "#1E3A8A",
    subtextHex: "#3B82F6",
    illustration: "luggage",
  },
  {
    id: "row5",
    title: "Row Five",
    rewardLabel: "+25 PTS",
    bgHex: "#F5F3FF",
    accentHex: "#8B5CF6",
    textHex: "#3B0764",
    subtextHex: "#7C3AED",
    illustration: "sneaker",
  },
  {
    id: "number-match",
    title: "Number Match",
    rewardLabel: "+50 PTS",
    bgHex: "#FFF7ED",
    accentHex: "#F97316",
    textHex: "#7C2D12",
    subtextHex: "#EA580C",
    illustration: "heart",
  },
  {
    id: "flip-card",
    title: "Flip Card",
    rewardLabel: "+60 PTS",
    bgHex: "#F0FDF4",
    accentHex: "#10B981",
    textHex: "#064E3B",
    subtextHex: "#059669",
    illustration: "cards",
  },
];

/* ──────────────────────────────── 3D SVG ICONS ──────────────────────────────── */
const Icon3DWheel: React.FC = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
    {/* Outer rim */}
    <circle cx="44" cy="46" r="34" fill="#FBBF24" />
    <circle cx="44" cy="46" r="28" fill="#F59E0B" />
    <circle cx="44" cy="46" r="22" fill="#D97706" />
    {/* Spokes */}
    {[0, 45, 90, 135].map((deg, i) => {
      const r = (deg * Math.PI) / 180;
      return (
        <line
          key={i}
          x1={44 + Math.cos(r) * 22}
          y1={46 + Math.sin(r) * 22}
          x2={44 - Math.cos(r) * 22}
          y2={46 - Math.sin(r) * 22}
          stroke="#FDE68A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    })}
    {/* Hub */}
    <circle cx="44" cy="46" r="6" fill="#92400E" />
    {/* Pointer */}
    <polygon points="44,8 40,18 48,18" fill="#EF4444" />
    {/* Gloss */}
    <ellipse cx="36" cy="32" rx="7" ry="4" fill="white" opacity="0.22" transform="rotate(-30 36 32)" />
    {/* Coin floaters */}
    <circle cx="16" cy="26" r="7" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5" />
    <text x="16" y="30" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="900">$</text>
    <circle cx="76" cy="66" r="5" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.2" />
  </svg>
);

const Icon3DCar: React.FC = () => (
  <svg width="92" height="88" viewBox="0 0 92 88" fill="none">
    {/* Body */}
    <path d="M8 54 C10 43 20 38 34 36 L48 30 C60 30 72 35 82 43 L90 50 C94 55 92 62 88 66 L16 66 C10 66 6 61 8 54 Z" fill="#1E293B" />
    {/* Roof */}
    <path d="M32 36 L46 31 L68 35 L75 42 L29 42 Z" fill="#334155" opacity="0.9" />
    {/* Windows */}
    <path d="M34 36 L45 32 L56 35 L54 42 L36 42 Z" fill="#38BDF8" opacity="0.7" />
    {/* Headlight */}
    <ellipse cx="86" cy="52" rx="4" ry="2.5" fill="#E0F2FE" />
    <ellipse cx="86" cy="52" rx="2.5" ry="1.5" fill="white" />
    {/* Tail light */}
    <rect x="10" y="55" width="5" height="4" rx="1" fill="#EF4444" />
    {/* Wheels */}
    <circle cx="28" cy="66" r="11" fill="#0F172A" />
    <circle cx="28" cy="66" r="7" fill="#334155" />
    <circle cx="28" cy="66" r="3.5" fill="#94A3B8" />
    <circle cx="74" cy="66" r="11" fill="#0F172A" />
    <circle cx="74" cy="66" r="7" fill="#334155" />
    <circle cx="74" cy="66" r="3.5" fill="#94A3B8" />
    {/* Speed bolt */}
    <path d="M4 28 L26 18 L19 32 L36 32 L12 50" fill="#38BDF8" opacity="0.85" />
    {/* Gloss */}
    <ellipse cx="52" cy="37" rx="10" ry="3" fill="white" opacity="0.12" transform="rotate(-8 52 37)" />
  </svg>
);

const Icon3DSuitcase: React.FC = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
    {/* Handle */}
    <path d="M38 14 L38 7 C38 5 40 3 42 3 L48 3 C50 3 52 5 52 7 L52 14" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
    {/* Body */}
    <rect x="22" y="14" width="46" height="62" rx="10" fill="#3B82F6" />
    <rect x="22" y="14" width="46" height="62" rx="10" stroke="#1D4ED8" strokeWidth="1.5" />
    {/* Vertical stripes */}
    {[30, 38, 46, 54, 60].map((x, i) => (
      <line key={i} x1={x} y1="18" x2={x} y2="70" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" />
    ))}
    {/* Center band */}
    <rect x="22" y="40" width="46" height="8" fill="#1D4ED8" opacity="0.45" />
    {/* Lock */}
    <rect x="39" y="42" width="12" height="8" rx="2" fill="#EFF6FF" />
    {/* Wheels */}
    <circle cx="31" cy="78" r="3.5" fill="#1E293B" />
    <circle cx="59" cy="78" r="3.5" fill="#1E293B" />
    {/* Tag */}
    <rect x="58" y="22" width="13" height="9" rx="2.5" fill="#FCD34D" />
    <line x1="60" y1="22" x2="66" y2="16" stroke="#94A3B8" strokeWidth="1.2" />
    {/* Gloss */}
    <ellipse cx="38" cy="24" rx="7" ry="3" fill="white" opacity="0.25" transform="rotate(-15 38 24)" />
  </svg>
);

const Icon3DSneaker: React.FC = () => (
  <svg width="92" height="88" viewBox="0 0 92 88" fill="none">
    {/* Sole */}
    <path d="M14 64 L82 64 C86 64 88 68 86 72 L82 76 C80 78 18 78 14 78 C10 78 10 70 14 64 Z" fill="white" stroke="#E9D5FF" strokeWidth="1.2" />
    {/* Upper */}
    <path d="M14 54 C18 40 32 32 46 30 L62 36 C70 40 80 44 86 48 C90 51 90 58 86 64 L18 64 C12 64 10 59 14 54 Z" fill="#8B5CF6" />
    {/* Highlight stripe */}
    <path d="M28 42 L54 38 L62 42 L54 48 L26 50 Z" fill="#A78BFA" opacity="0.6" />
    {/* Laces */}
    <path d="M24 48 L36 46 M30 51 L42 49 M36 54 L48 52" stroke="#EDE9FE" strokeWidth="1.8" strokeLinecap="round" />
    {/* Logo mark */}
    <ellipse cx="72" cy="48" rx="8" ry="5" fill="#7C3AED" opacity="0.7" />
    <path d="M68 48 L76 45 L76 51 Z" fill="#DDD6FE" />
    {/* Gloss */}
    <ellipse cx="44" cy="36" rx="12" ry="3.5" fill="white" opacity="0.2" transform="rotate(-10 44 36)" />
  </svg>
);

const Icon3DHeart: React.FC = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
    {/* Shadow */}
    <ellipse cx="44" cy="78" rx="24" ry="5" fill="#F97316" opacity="0.2" />
    {/* Main heart */}
    <path d="M44 72 C44 72 14 50 14 30 C14 18 24 10 34 14 C38 16 44 22 44 22 C44 22 50 16 54 14 C64 10 74 18 74 30 C74 50 44 72 44 72 Z" fill="#FB923C" />
    {/* Inner heart */}
    <path d="M44 62 C44 62 24 46 24 32 C24 25 30 20 36 22 C40 24 44 28 44 28 C44 28 48 24 52 22 C58 20 64 25 64 32 C64 46 44 62 44 62 Z" fill="#FDBA74" />
    {/* Gloss */}
    <ellipse cx="36" cy="20" rx="6" ry="3.5" fill="white" opacity="0.35" transform="rotate(-25 36 20)" />
    {/* Stars */}
    <circle cx="16" cy="18" r="3" fill="#FDE68A" />
    <circle cx="74" cy="24" r="2" fill="#FDE68A" />
    <circle cx="20" cy="60" r="2.5" fill="#FDE68A" />
    {/* Coin */}
    <circle cx="72" cy="58" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
    <text x="72" y="63" textAnchor="middle" fill="#78350F" fontSize="10" fontWeight="900">#</text>
  </svg>
);

const Icon3DCards: React.FC = () => (
  <svg width="92" height="88" viewBox="0 0 92 88" fill="none">
    {/* Back card left */}
    <rect x="8" y="22" width="38" height="54" rx="8" fill="#059669" transform="rotate(-14 8 22)" />
    {/* Back card right */}
    <rect x="48" y="14" width="38" height="54" rx="8" fill="#34D399" transform="rotate(10 48 14)" />
    {/* Front card */}
    <rect x="26" y="18" width="40" height="56" rx="8" fill="white" stroke="#A7F3D0" strokeWidth="1.5" />
    {/* Card suit */}
    <circle cx="46" cy="46" r="9" fill="#10B981" />
    <polygon points="46,38 50,45 57,46 52,51 54,58 46,54 38,58 40,51 35,46 42,45" fill="#FEF08A" />
    {/* Corner labels */}
    <text x="30" y="32" fill="#10B981" fontSize="11" fontWeight="900">A</text>
    <text x="57" y="67" fill="#10B981" fontSize="11" fontWeight="900" textAnchor="middle">♠</text>
    {/* Gloss */}
    <rect x="28" y="20" width="36" height="12" rx="4" fill="white" opacity="0.3" />
  </svg>
);

const ILLUSTRATIONS: Record<FeatureGameCardItem["illustration"], React.FC> = {
  wheel: Icon3DWheel,
  car: Icon3DCar,
  luggage: Icon3DSuitcase,
  sneaker: Icon3DSneaker,
  heart: Icon3DHeart,
  cards: Icon3DCards,
};

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

  const Illustration = ILLUSTRATIONS[card.illustration];

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="w-full cursor-pointer select-none outline-none"
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
          padding: "0 6px 0 20px",
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

        {/* Right: 3D Icon illustration */}
        <div
          className="relative z-10 flex-shrink-0 flex items-center justify-center"
          style={{ width: "96px", height: "96px" }}
        >
          <div className="drop-shadow-lg">
            <Illustration />
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
