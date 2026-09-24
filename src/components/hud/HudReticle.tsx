"use client";

import React from "react";

interface HudReticleProps {
  color?: "cyan" | "amber" | "white";
  size?: number;
  className?: string;
  type?: "target" | "dot-circle" | "crosshair";
}

export const HudReticle: React.FC<HudReticleProps> = ({
  color = "cyan",
  size = 40,
  className = "",
  type = "target",
}) => {
  const strokeColor =
    color === "cyan" ? "#00f0ff" : color === "amber" ? "#ffb800" : "#e2e8f0";

  if (type === "crosshair") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        className={`inline-block ${className}`}
      >
        <line x1="20" y1="4" x2="20" y2="14" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
        <line x1="20" y1="26" x2="20" y2="36" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
        <line x1="4" y1="20" x2="14" y2="20" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
        <line x1="26" y1="20" x2="36" y2="20" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
        <circle cx="20" cy="20" r="1.5" fill={strokeColor} />
      </svg>
    );
  }

  if (type === "dot-circle") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        className={`inline-block ${className}`}
      >
        <circle cx="20" cy="20" r="12" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="20" cy="20" r="2.5" fill={strokeColor} />
      </svg>
    );
  }

  // default: target (concentric circle with tick marks, matching image top right)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      className={`inline-block ${className}`}
    >
      <circle cx="22" cy="22" r="14" stroke={strokeColor} strokeWidth="1.5" />
      <circle cx="22" cy="22" r="6" stroke={strokeColor} strokeWidth="1" opacity="0.6" />
      <circle cx="22" cy="22" r="2" fill={strokeColor} />
      {/* 4 cardinal ticks */}
      <line x1="22" y1="3" x2="22" y2="10" stroke={strokeColor} strokeWidth="1.75" />
      <line x1="22" y1="34" x2="22" y2="41" stroke={strokeColor} strokeWidth="1.75" />
      <line x1="3" y1="22" x2="10" y2="22" stroke={strokeColor} strokeWidth="1.75" />
      <line x1="34" y1="22" x2="41" y2="22" stroke={strokeColor} strokeWidth="1.75" />
    </svg>
  );
};
