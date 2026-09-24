"use client";

import React from "react";

interface HudCardProps {
  children: React.ReactNode;
  theme?: "cyan" | "amber";
  title?: string;
  tag?: string;
  sideText?: string;
  hasHazardBar?: boolean;
  className?: string;
}

export const HudCard: React.FC<HudCardProps> = ({
  children,
  theme = "cyan",
  title,
  tag,
  sideText,
  hasHazardBar = true,
  className = "",
}) => {
  const isCyan = theme === "cyan";
  const primaryColor = isCyan ? "#00f0ff" : "#ffb800";
  const borderColor = isCyan ? "border-cyan-500/40" : "border-amber-500/40";
  const glowColor = isCyan ? "shadow-[0_0_15px_rgba(0,240,255,0.15)]" : "shadow-[0_0_15px_rgba(255,184,0,0.15)]";
  const hazardClass = isCyan ? "hazard-stripes-cyan" : "hazard-stripes-amber";
  const textColor = isCyan ? "text-cyan-400" : "text-amber-400";

  return (
    <div className={`relative ${glowColor} ${className}`}>
      {/* Outer Tech Frame with Chamfered Corners */}
      <div
        className={`relative liquid-glass rounded-sm p-4 ${borderColor} ${
          isCyan ? "chamfer-card-cyan" : "chamfer-card-amber"
        }`}
      >
        {/* Top Header / Status bar */}
        {(title || tag) && (
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 text-xs font-mono">
            {title && (
              <span className={`font-semibold tracking-wider uppercase ${textColor} flex items-center gap-1.5`}>
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
                {title}
              </span>
            )}
            {tag && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/15 text-slate-300">
                {tag}
              </span>
            )}
          </div>
        )}

        {/* Side Text (matches vertical text in user reference image) */}
        {sideText && (
          <div
            className="absolute left-1 bottom-8 text-[9px] font-mono tracking-widest text-slate-500 uppercase select-none pointer-events-none origin-bottom-left -rotate-90"
          >
            {sideText}
          </div>
        )}

        {/* Main Content Area */}
        <div className={sideText ? "pl-3" : ""}>{children}</div>

        {/* Corner Angled Accent Lines */}
        <div
          className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 pointer-events-none"
          style={{ borderColor: primaryColor }}
        />
        <div
          className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 pointer-events-none"
        />

        {/* Bottom Hazard Stripe Block (Matches the striped corner block in reference image) */}
        {hasHazardBar && (
          <div
            className={`absolute bottom-0 right-0 w-16 h-3.5 ${hazardClass} border-t border-l border-black/40 pointer-events-none`}
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 8px 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
};
