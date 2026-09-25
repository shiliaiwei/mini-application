"use client";

import React from "react";

export type BrandVariant = "wordmark" | "mark";
export type BrandColorScheme = "blue" | "white" | "dark";

export interface ShiliaiweiBrandProps {
  /**
   * Brand Asset Mutual Exclusivity (RULE: logo mark and brand text name NEVER appear together):
   * - "wordmark": Renders "SHILIAIWEI" as ONE continuous word. Zero logo icon.
   * - "mark":     Renders pure geometric emblem only. Zero text of any kind.
   */
  variant?: BrandVariant;
  colorScheme?: BrandColorScheme;
  height?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Official SHILIAIWEI Brand Component
 *
 * BRAND RULES (strictly enforced):
 * 1. Full word only: "SHILIAIWEI" — never split as "SHILIAI" + "WEI"
 * 2. Mark only OR wordmark only — never both in the same place
 * 3. If using logo mark → zero brand text name alongside it
 * 4. If using text wordmark → zero logo icon alongside it
 */
export const ShiliaiweiBrand: React.FC<ShiliaiweiBrandProps> = ({
  variant = "wordmark",
  colorScheme = "blue",
  height = 28,
  className = "",
  onClick,
}) => {
  const primaryColor =
    colorScheme === "white"
      ? "#ffffff"
      : colorScheme === "dark"
      ? "#0f172a"
      : "#0098ea";

  /* ── MODE 1: MARK — Pure geometric emblem. ZERO text. ── */
  if (variant === "mark") {
    const size = height;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block flex-shrink-0 select-none ${className}`}
        onClick={onClick}
        aria-label="SHILIAIWEI Mark"
        role="img"
      >
        <rect x="2" y="2" width="44" height="44" rx="11" fill={primaryColor} />
        {/* Three geometric bars — brand emblem, no text */}
        <rect x="12" y="11" width="24" height="6" rx="3" fill="white" />
        <rect x="17" y="21" width="19" height="6" rx="3" fill="white" />
        <rect x="12" y="31" width="24" height="6" rx="3" fill="white" />
      </svg>
    );
  }

  /* ── MODE 2: WORDMARK — "SHILIAIWEI" as one continuous word. ZERO icon. ── */
  const width = Math.round(height * 5.8);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 290 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      onClick={onClick}
      aria-label="SHILIAIWEI"
      role="img"
    >
      <text
        x="2"
        y="39"
        fill={primaryColor}
        fontSize="38"
        fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
        fontWeight="900"
        letterSpacing="-0.01em"
      >
        SHILIAIWEI
      </text>
    </svg>
  );
};
