"use client";

import React from "react";

export type BrandVariant = "wordmark" | "mark";
export type BrandColorScheme = "blue" | "white" | "dark";

export interface ShiliaiweiBrandProps {
  /**
   * Brand Asset Mutual Exclusivity:
   * - "wordmark": Brand name only (SHILIAI [WEI]). Zero logo icon.
   * - "mark": Logo badge only ([WEI] or emblem). Zero brand text.
   */
  variant?: BrandVariant;
  colorScheme?: BrandColorScheme;
  height?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Official SHILIAIWEI Brand Component
 * Strictly enforces Brand Asset Mutual Exclusivity Rule:
 * Never displays logo mark and brand text name simultaneously.
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

  const badgeTextColor =
    colorScheme === "white"
      ? "#0098ea"
      : "#ffffff";

  const badgeBgColor =
    colorScheme === "white"
      ? "#ffffff"
      : primaryColor;

  if (variant === "mark") {
    // Mode 1: Logo Mark Only (Zero Brand Text Name)
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
        aria-label="SHILIAIWEI Logo Mark"
        role="img"
      >
        {/* Solid Rounded Badge Container */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="11"
          fill={badgeBgColor}
        />
        {/* White Monogram WEI Core */}
        <text
          x="24"
          y="32"
          textAnchor="middle"
          fill={badgeTextColor}
          fontSize="20"
          fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
          fontWeight="900"
          letterSpacing="-0.03em"
        >
          WEI
        </text>
      </svg>
    );
  }

  // Mode 2: Brand Name Only / Wordmark (Zero Logo Icon)
  // Calculates width based on standard 4.4 : 1 aspect ratio
  const width = Math.round(height * 4.4);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      onClick={onClick}
      aria-label="SHILIAIWEI"
      role="img"
    >
      {/* SHILIAI Base Text */}
      <text
        x="2"
        y="37"
        fill={primaryColor}
        fontSize="36"
        fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
        fontWeight="900"
        letterSpacing="0.02em"
      >
        SHILIAI
      </text>

      {/* WEI Solid Badge Block */}
      <rect
        x="146"
        y="6"
        width="70"
        height="39"
        rx="8"
        fill={badgeBgColor}
      />

      {/* WEI Inverted Text */}
      <text
        x="181"
        y="36"
        textAnchor="middle"
        fill={badgeTextColor}
        fontSize="31"
        fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
        fontWeight="900"
        letterSpacing="0.04em"
      >
        WEI
      </text>
    </svg>
  );
};
