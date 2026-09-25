"use client";

import React from "react";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";

interface BrandFooterProps {
  /** Show the wordmark (text) or mark (icon) — never both */
  variant?: "wordmark" | "mark";
  colorScheme?: "blue" | "white" | "dark";
  height?: number;
  tagline?: string;
  className?: string;
}

/**
 * Consistent brand footer used across all views.
 *
 * RULE: logo mark and brand text name NEVER appear together.
 * - If variant="wordmark" → renders SHILIAIWEI text only, no icon.
 * - If variant="mark"     → renders geometric emblem only, no text name.
 * - Optional tagline is always a secondary label in muted color — NOT the brand name.
 */
export const BrandFooter: React.FC<BrandFooterProps> = ({
  variant = "wordmark",
  colorScheme = "blue",
  height = 18,
  tagline,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center gap-1 py-3 ${className}`}>
      {/* Brand asset — wordmark or mark, never both */}
      <ShiliaiweiBrand variant={variant} height={height} colorScheme={colorScheme} />

      {/* Optional tagline — NOT the brand name, just a secondary description */}
      {tagline && (
        <p className="text-[10px] font-semibold text-slate-400 tracking-wide text-center">
          {tagline}
        </p>
      )}
    </div>
  );
};
