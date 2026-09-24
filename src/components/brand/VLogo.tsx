"use client";

import React from "react";

interface VLogoProps {
  size?: number | string;
  variant?: "solid-blue" | "white" | "dark" | "outline";
  className?: string;
}

export const VLogo: React.FC<VLogoProps> = ({
  size = 28,
  variant = "solid-blue",
  className = "",
}) => {
  const numericSize = typeof size === "number" ? size : parseInt(size, 10) || 28;

  // Solid colors only - strictly zero gradients
  const fillColor =
    variant === "white"
      ? "#ffffff"
      : variant === "dark"
      ? "#0f172a"
      : "#0098ea";

  const accentColor =
    variant === "white"
      ? "rgba(255, 255, 255, 0.75)"
      : variant === "dark"
      ? "#334155"
      : "#0077b5";

  return (
    <svg
      width={numericSize}
      height={numericSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 select-none ${className}`}
    >
      {/* Precision Geometric V Letter Emblem */}
      {/* Left Wing Facet */}
      <polygon
        points="14,16 38,16 50,72 38,72"
        fill={fillColor}
      />
      {/* Right Wing Facet */}
      <polygon
        points="62,16 86,16 62,72 50,72"
        fill={accentColor}
      />
      {/* Center Keystone Base */}
      <polygon
        points="38,72 62,72 50,88"
        fill={fillColor}
      />
      {/* Top Inner Crown Diamond */}
      <polygon
        points="50,24 57,35 50,46 43,35"
        fill={variant === "white" ? "#0098ea" : "#ffffff"}
      />
    </svg>
  );
};
