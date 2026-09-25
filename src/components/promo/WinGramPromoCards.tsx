"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dices,
  Zap,
  Globe,
  LayoutGrid,
  Hash,
  Layers,
} from "lucide-react";
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
  /** Outer ticket shell color */
  shellHex: string;
  /** Icon & accent color */
  accentHex: string;
  /** Text color on white zone */
  textHex: string;
  Icon: React.ElementType;
}

/**
 * Feature Game Cards — Premium Ticket/Stub Monochrome Shape
 * Using real Lucide React icons, no custom SVGs, no shortcut acronyms
 */
export const FEATURE_GAME_CARDS: FeatureGameCardItem[] = [
  {
    id: "wheel",
    title: "Daily Spin",
    rewardLabel: "+500 PTS",
    shellHex: "#92400E",
    accentHex: "#F59E0B",
    textHex: "#78350F",
    Icon: Dices,
  },
  {
    id: "word-flash",
    title: "Word Flash",
    rewardLabel: "+8 PTS",
    shellHex: "#0F172A",
    accentHex: "#38BDF8",
    textHex: "#0C4A6E",
    Icon: Zap,
  },
  {
    id: "guess-faster",
    title: "Guess Words",
    rewardLabel: "+15 PTS",
    shellHex: "#1E3A8A",
    accentHex: "#3B82F6",
    textHex: "#1E3A8A",
    Icon: Globe,
  },
  {
    id: "row5",
    title: "Row Five",
    rewardLabel: "+25 PTS",
    shellHex: "#3B0764",
    accentHex: "#A855F7",
    textHex: "#4C1D95",
    Icon: LayoutGrid,
  },
  {
    id: "number-match",
    title: "Number Match",
    rewardLabel: "+50 PTS",
    shellHex: "#7C2D12",
    accentHex: "#F97316",
    textHex: "#7C2D12",
    Icon: Hash,
  },
  {
    id: "flip-card",
    title: "Flip Card",
    rewardLabel: "+60 PTS",
    shellHex: "#064E3B",
    accentHex: "#10B981",
    textHex: "#064E3B",
    Icon: Layers,
  },
];

/* ─────────────────────────── TICKET CARD ─────────────────────────── */
const TicketCard: React.FC<{
  card: FeatureGameCardItem;
  index: number;
  onClick: () => void;
}> = ({ card, index, onClick }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { Icon } = card;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 70);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="w-full cursor-pointer select-none outline-none active:scale-[0.982] transition-transform duration-150"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-56px)",
        transition: "opacity 0.36s cubic-bezier(0.22,1,0.36,1), transform 0.36s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* ── OUTER TICKET SHELL (colored) ── */}
      <div
        style={{
          background: card.shellHex,
          borderRadius: "6px",
          padding: "3px",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Decorative corner ornaments */}
        <svg className="absolute top-2 left-2 pointer-events-none z-20" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M1 10 Q1 1 10 1" stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none"/>
          <circle cx="1" cy="1" r="1" fill="white" fillOpacity="0.4"/>
        </svg>
        <svg className="absolute top-2 right-2 pointer-events-none z-20" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M19 10 Q19 1 10 1" stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none"/>
          <circle cx="19" cy="1" r="1" fill="white" fillOpacity="0.4"/>
        </svg>
        <svg className="absolute bottom-2 left-2 pointer-events-none z-20" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M1 10 Q1 19 10 19" stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none"/>
          <circle cx="1" cy="19" r="1" fill="white" fillOpacity="0.4"/>
        </svg>
        <svg className="absolute bottom-2 right-2 pointer-events-none z-20" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M19 10 Q19 19 10 19" stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none"/>
          <circle cx="19" cy="19" r="1" fill="white" fillOpacity="0.4"/>
        </svg>

        {/* ── INNER WHITE CONTENT AREA — Horizontal landscape ticket ── */}
        <div
          style={{
            background: "white",
            borderRadius: "4px",
            overflow: "visible",
            position: "relative",
            display: "flex",
            alignItems: "stretch",
            minHeight: "100px",
          }}
        >
          {/* Left punch-out notch on shell */}
          <div
            style={{
              position: "absolute",
              left: "-9px",
              top: "50%",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: card.shellHex,
              transform: "translateY(-50%)",
              zIndex: 10,
            }}
          />
          {/* Right punch-out notch on shell */}
          <div
            style={{
              position: "absolute",
              right: "-9px",
              top: "50%",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: card.shellHex,
              transform: "translateY(-50%)",
              zIndex: 10,
            }}
          />

          {/* ── ICON STUB (left band, colored) ── */}
          <div
            style={{
              width: "96px",
              flexShrink: 0,
              background: card.accentHex + "18",
              borderRight: `1.5px dashed ${card.accentHex}50`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              borderRadius: "4px 0 0 4px",
            }}
          >
            {/* Top notch on divider */}
            <div
              style={{
                position: "absolute",
                top: "-9px",
                right: "-9px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: card.shellHex,
                zIndex: 11,
              }}
            />
            {/* Bottom notch on divider */}
            <div
              style={{
                position: "absolute",
                bottom: "-9px",
                right: "-9px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: card.shellHex,
                zIndex: 11,
              }}
            />

            {/* Real Lucide icon — large */}
            <Icon
              size={52}
              color={card.accentHex}
              strokeWidth={1.5}
              aria-hidden
            />
          </div>

          {/* ── MAIN CONTENT (right body) ── */}
          <div
            style={{
              flex: 1,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            {/* Reward badge */}
            <span
              style={{
                display: "inline-block",
                fontSize: "10px",
                fontWeight: 900,
                lineHeight: 1,
                color: card.accentHex,
                background: card.accentHex + "16",
                border: `1px solid ${card.accentHex}38`,
                borderRadius: "3px",
                padding: "2px 7px",
                letterSpacing: "0.04em",
                marginBottom: "2px",
                width: "fit-content",
              }}
            >
              {card.rewardLabel}
            </span>

            {/* Full game title — no shortcut */}
            <h3
              style={{
                color: "#0F172A",
                fontSize: "22px",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              {card.title}
            </h3>

            {/* Tap line */}
            <p
              style={{
                color: "#94A3B8",
                fontSize: "11px",
                fontWeight: 600,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: card.accentHex,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              Tap to play
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
export const WinGramPromoCards: React.FC<WinGramPromoCardsProps> = ({
  onOpenAdDetail,
  onOpenStats,
  onSelectGame,
  tgApp,
}) => {
  const handleLaunchGame = (game: MiniGameType) => {
    try { tgApp?.HapticFeedback?.impactOccurred("medium"); } catch {}
    onSelectGame?.(game);
  };

  return (
    <div className="relative select-none font-sans w-full space-y-3">
      {/* Ad card — same ticket style handled inside InstitutionalAdCard */}
      <div className="w-full">
        <InstitutionalAdCard
          onOpenDetail={(partnerId) => {
            try { tgApp?.HapticFeedback?.impactOccurred("medium"); } catch {}
            onOpenAdDetail?.(partnerId);
          }}
          onOpenStats={onOpenStats}
        />
      </div>

      {/* Feature game cards — ticket stub style, slide-from-left */}
      <div className="w-full space-y-2.5 pt-1">
        {FEATURE_GAME_CARDS.map((card, i) => (
          <TicketCard
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
