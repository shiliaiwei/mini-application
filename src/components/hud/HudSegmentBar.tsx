"use client";

import React from "react";

interface HudSegmentBarProps {
  label?: string;
  value?: number; // 0 to 100
  totalSegments?: number;
  theme?: "cyan" | "amber";
  className?: string;
}

export const HudSegmentBar: React.FC<HudSegmentBarProps> = ({
  label,
  value = 75,
  totalSegments = 16,
  theme = "cyan",
  className = "",
}) => {
  const isCyan = theme === "cyan";
  const activeClass = isCyan ? "active-cyan" : "active-amber";
  const textColor = isCyan ? "text-cyan-400" : "text-amber-400";

  const activeCount = Math.round((Math.max(0, Math.min(100, value)) / 100) * totalSegments);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-[10px] font-mono tracking-wider">
          <span className="text-slate-400 uppercase">{label}</span>
          <span className={`${textColor} font-bold`}>{value}%</span>
        </div>
      )}

      {/* Segmented bar container with angled ticks */}
      <div className="hud-segmented-bar p-1 bg-black/40 rounded border border-white/10">
        {Array.from({ length: totalSegments }).map((_, i) => {
          const isActive = i < activeCount;
          return (
            <div
              key={i}
              className={`hud-segment ${isActive ? activeClass : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
};
