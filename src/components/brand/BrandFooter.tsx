"use client";

import React from "react";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";

interface BrandFooterProps {
  colorScheme?: "blue" | "white" | "dark";
  height?: number;
  className?: string;
}

/**
 * Consistent brand footer used across views.
 * Renders the official SHILIAI [WEI] logo alone (no duplicate brand text alongside it).
 */
export const BrandFooter: React.FC<BrandFooterProps> = ({
  colorScheme = "blue",
  height = 18,
  className = "",
}) => {
  return (
    <footer className={`flex flex-col items-center justify-center py-4 select-none ${className}`}>
      <ShiliaiweiBrand height={height} colorScheme={colorScheme} />
    </footer>
  );
};

