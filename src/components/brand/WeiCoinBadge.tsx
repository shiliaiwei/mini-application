"use client";

import React from "react";
import { CoinType, COIN_STANDARDS, formatCoinAmount } from "@/lib/wallet/coinStandard";

export interface WeiCoinBadgeProps {
  coinType?: CoinType;
  amount?: number;
  showAmount?: boolean;
  showSymbol?: boolean;
  variant?: "badge-only" | "standard" | "pill";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Standardized Coin Representation Component
 * Incorporates the official Wei badge logo as the brand identifier for coin-related transactions.
 * Strictly adheres to Zero Emojis and Never Write Guide Example Labels rules.
 */
export const WeiCoinBadge: React.FC<WeiCoinBadgeProps> = ({
  coinType = "WEI",
  amount,
  showAmount = false,
  showSymbol = true,
  variant = "standard",
  size = "md",
  className = "",
}) => {
  const standard = COIN_STANDARDS[coinType];

  const sizeConfig = {
    sm: {
      badgeHeight: 16,
      badgeFontSize: 9,
      badgePaddingX: 4,
      badgeRadius: 3,
      textFontSize: "text-[11px]",
      containerPadding: "px-2 py-0.5",
    },
    md: {
      badgeHeight: 20,
      badgeFontSize: 11,
      badgePaddingX: 5,
      badgeRadius: 4,
      textFontSize: "text-xs",
      containerPadding: "px-2.5 py-1",
    },
    lg: {
      badgeHeight: 24,
      badgeFontSize: 13,
      badgePaddingX: 7,
      badgeRadius: 5,
      textFontSize: "text-sm",
      containerPadding: "px-3 py-1.5",
    },
  }[size];

  const weiBadgeNode = (
    <span
      style={{
        backgroundColor: "#0098ea",
        color: "#ffffff",
        fontSize: `${sizeConfig.badgeFontSize}px`,
        fontWeight: 900,
        fontFamily: "system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif",
        height: `${sizeConfig.badgeHeight}px`,
        padding: `0 ${sizeConfig.badgePaddingX}px`,
        borderRadius: `${sizeConfig.badgeRadius}px`,
        letterSpacing: "-0.01em",
        lineHeight: 1,
      }}
      className="inline-flex items-center justify-center flex-shrink-0 select-none drop-shadow-2xs"
      role="img"
      aria-label="WEI Badge Logo"
    >
      WEI
    </span>
  );

  if (variant === "badge-only") {
    return (
      <span className={`inline-flex items-center align-middle ${className}`}>
        {weiBadgeNode}
      </span>
    );
  }

  const formattedAmountText = amount !== undefined ? formatCoinAmount(amount, coinType) : null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 align-middle select-none ${
        variant === "pill"
          ? `${sizeConfig.containerPadding} rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-200 dark:border-white/10`
          : ""
      } ${className}`}
    >
      {weiBadgeNode}
      {showAmount && formattedAmountText && (
        <span className={`font-mono font-black text-slate-900 dark:text-white ${sizeConfig.textFontSize}`}>
          {formattedAmountText}
        </span>
      )}
      {!showAmount && showSymbol && (
        <span className={`font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider ${sizeConfig.textFontSize}`}>
          {standard.name}
        </span>
      )}
    </span>
  );
};
