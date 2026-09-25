"use client";

import React from "react";

export type BrandVariant = "full" | "wordmark" | "mark";
export type BrandColorScheme = "blue" | "white" | "dark";

export interface ShiliaiweiBrandProps {
  /**
   * Official SHILIAIWEI Brand Logo
   * Format: "SHILIAI" (bold text) + "[WEI]" (badge at the end, LinkedIn style)
   * Full word logo always: never use "WEI" alone.
   *
   * MUTUAL EXCLUSIVITY RULE:
   * When this logo is displayed, never display extra brand text name in the same place.
   * When brand text is displayed, never display this logo alongside it.
   */
  variant?: BrandVariant;
  colorScheme?: BrandColorScheme;
  height?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Official SHILIAIWEI Brand Component (LinkedIn style: SHILIAI [WEI])
 *
 * RULES:
 * 1. Full word logo: "SHILIAI" + "[WEI]" badge. Never use "WEI" alone.
 * 2. Logo and text brand never display at the same time in the same place.
 */
export const ShiliaiweiBrand: React.FC<ShiliaiweiBrandProps> = ({
  colorScheme = "blue",
  height = 28,
  className = "",
  onClick,
}) => {
  const isWhite = colorScheme === "white";
  const isDark = colorScheme === "dark";

  // Colors
  const textColor = isWhite ? "#ffffff" : isDark ? "#0f172a" : "#0098ea";
  const badgeBg = isWhite ? "#ffffff" : "#0098ea";
  const badgeTextColor = isWhite ? "#0077b5" : "#ffffff";

  // Aspect ratio: 165 x 36
  const width = Math.round(height * 4.58);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 165 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      onClick={onClick}
      aria-label="SHILIAIWEI"
      role="img"
    >
      {/* 1. SHILIAI - Heavy Bold Sans-Serif Capital Text */}
      <text
        x="2"
        y="27"
        fill={textColor}
        fontSize="26"
        fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
        fontWeight="900"
        letterSpacing="-0.02em"
      >
        SHILIAI
      </text>

      {/* 2. [WEI] - Rounded Rectangle Badge (LinkedIn-style [in]) */}
      <rect
        x="110"
        y="6"
        width="50"
        height="24"
        rx="6"
        fill={badgeBg}
      />

      {/* 3. WEI - Centered Bold Text inside Badge */}
      <text
        x="135"
        y="24"
        textAnchor="middle"
        fill={badgeTextColor}
        fontSize="15"
        fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
        fontWeight="900"
        letterSpacing="-0.01em"
      >
        WEI
      </text>
    </svg>
  );
};

