"use client";

import React from "react";

export type BrandVariant = "full" | "wordmark" | "mark";
export type BrandColorScheme = "blue" | "white" | "dark";
export type BrandFormat = "inline" | "svg";

export interface ShiliaiweiBrandProps {
  /**
   * Official SHILIAIWEI Brand Logo
   * Format: "SHILIAI" (bold text) + "[WEI]" (badge at the end, LinkedIn style)
   * Single-line, tight 2-3px gap, zero excess spacing.
   *
   * =========================================================================
   * MANDATORY SHILIAIWEI BRAND LOGO RULES (NEVER ALTER):
   * =========================================================================
   * 1. ZERO ADDITIONS: NEVER add anything before, after, or around the logo.
   *    - NO prefixes (e.g. "SHILIAIWEI Official", "App", "Platform").
   *    - NO suffixes (e.g. "Vault", "Gaming", "Casino", "VIP").
   *    - NO accompanying taglines, subtitle text, or auxiliary labels.
   *    - NO decorative icons, shields, or marks appended or prepended directly.
   * 2. ONE LINE ONLY & TIGHT ZERO-SPACE BADGE:
   *    - The [WEI] badge MUST sit on the exact same line immediately adjacent
   *      to "SHILIAI" with a tight 2px–3px margin (like LinkedIn's [in] badge).
   *    - NEVER allow a loose gap, space character, or line wrap.
   * 3. MUTUAL EXCLUSIVITY:
   *    - When the logo is displayed, never display extra brand text name in the same place.
   *    - When brand text is displayed, never display this logo alongside it.
   *    - Never use "WEI" alone as a standalone mark without "SHILIAI".
   * =========================================================================
   */
  variant?: BrandVariant;
  colorScheme?: BrandColorScheme;
  format?: BrandFormat;
  height?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Official SHILIAIWEI Brand Component (LinkedIn style: SHILIAI [WEI])
 */
export const ShiliaiweiBrand: React.FC<ShiliaiweiBrandProps> = ({
  colorScheme = "blue",
  format = "inline",
  height = 24,
  className = "",
  onClick,
}) => {
  const isWhite = colorScheme === "white";
  const isDark = colorScheme === "dark";

  // Brand Palette
  const textColor = isWhite ? "#ffffff" : isDark ? "#0f172a" : "#0098ea";
  const badgeBg = isWhite ? "#ffffff" : "#0098ea";
  const badgeTextColor = isWhite ? "#0077b5" : "#ffffff";

  // For SVG format (Android Vector / Canvas exports)
  if (format === "svg") {
    // Exact tight vector coordinates: 122 x 32
    const width = Math.round(height * 3.81);
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 122 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block flex-shrink-0 select-none whitespace-nowrap ${className}`}
        onClick={onClick}
        aria-label="SHILIAIWEI"
        role="img"
      >
        <text
          x="0"
          y="24"
          fill={textColor}
          fontSize="24"
          fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
          fontWeight="900"
          letterSpacing="-0.03em"
          textLength="72"
          lengthAdjust="spacingAndGlyphs"
        >
          SHILIAI
        </text>
        <rect x="75" y="4" width="44" height="23" rx="6" fill={badgeBg} />
        <text
          x="97"
          y="21"
          textAnchor="middle"
          fill={badgeTextColor}
          fontSize="14"
          fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
          fontWeight="900"
          letterSpacing="-0.01em"
        >
          WEI
        </text>
      </svg>
    );
  }

  // Default Inline-Flex Layout: Zero font-metric drift, tight 2px gap, 100% one-line
  const fontSizeText = Math.round(height * 0.92);
  const fontSizeBadge = Math.round(height * 0.52);
  const badgeHeight = Math.round(height * 0.84);
  const badgePaddingX = Math.max(4, Math.round(height * 0.22));
  const badgeRadius = Math.max(3, Math.round(height * 0.2));
  const badgeMarginLeft = Math.max(2, Math.round(height * 0.1));

  return (
    <span
      className={`inline-flex items-center flex-shrink-0 select-none whitespace-nowrap align-middle leading-none ${className}`}
      style={{ height: `${height}px`, verticalAlign: "middle" }}
      onClick={onClick}
      aria-label="SHILIAIWEI"
      role="img"
    >
      <span
        style={{
          fontSize: `${fontSizeText}px`,
          color: textColor,
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        SHILIAI
      </span>
      <span
        style={{
          backgroundColor: badgeBg,
          color: badgeTextColor,
          fontSize: `${fontSizeBadge}px`,
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif",
          height: `${badgeHeight}px`,
          padding: `0 ${badgePaddingX}px`,
          borderRadius: `${badgeRadius}px`,
          marginLeft: `${badgeMarginLeft}px`,
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
        className="inline-flex items-center justify-center flex-shrink-0"
      >
        WEI
      </span>
    </span>
  );
};

