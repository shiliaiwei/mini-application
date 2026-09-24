"use client";

import React, { useState, useRef } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { Zap, Timer, Flame } from "lucide-react";

interface FloatingPoint {
  id: number;
  x: number;
  y: number;
}

interface TapGameViewProps {
  score: number;
  onTap: () => void;
  energy: number;
  maxEnergy: number;
  spendSeconds: number;
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
}

export const TapGameView: React.FC<TapGameViewProps> = ({
  score,
  onTap,
  energy,
  maxEnergy,
  spendSeconds,
  user,
  tgApp,
}) => {
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const handleTap = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    try {
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = clientX ? clientX - rect.left : rect.width / 2;
      const y = clientY ? clientY - rect.top : rect.height / 2;

      const newPoint: FloatingPoint = {
        id: Date.now() + Math.random(),
        x,
        y,
      };

      setFloatingPoints((prev) => [...prev.slice(-15), newPoint]);

      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== newPoint.id));
      }, 700);
    }

    onTap();
  };

  const energyPercent = Math.round((energy / maxEnergy) * 100);

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100dvh-130px)] pb-16 select-none">
      {/* Top Header Stats */}
      <div className="w-full space-y-3 pt-1">
        {/* User Identity Banner */}
        <div className="flex items-center justify-between text-xs px-1 font-body">
          <span className="text-slate-600 uppercase font-semibold">
            {user?.username ? `@${user.username}` : user?.first_name || "TELEGRAM USER"}
          </span>
          <span className="text-lime-700 font-bold bg-lime-100 px-2 py-0.5 rounded border border-lime-300">
            LEVEL 1
          </span>
        </div>

        {/* Big Score Display (Faculty Glyphic Font) */}
        <div className="text-center py-2">
          <div className="text-xs font-body font-semibold text-slate-500 uppercase tracking-widest">
            TOTAL SCORE
          </div>
          <div className="text-6xl font-black text-slate-900 tracking-tight mt-1 font-display">
            {score.toLocaleString()}
          </div>
          <div className="text-[11px] text-lime-700 font-body font-bold mt-0.5 uppercase tracking-wide">
            1 TAP = 1 POINT
          </div>
        </div>

        {/* Telemetry Bar (Spend Time & Rate) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="white-card rounded-xl p-2.5 flex items-center gap-2">
            <Timer className="w-4 h-4 text-lime-700 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 uppercase block leading-none font-body">
                TIME SPENT
              </span>
              <span className="text-xs font-body font-bold text-slate-900 block mt-1">
                {formatTime(spendSeconds)}
              </span>
            </div>
          </div>

          <div className="white-card rounded-xl p-2.5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-lime-700 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 uppercase block leading-none font-body">
                RATE
              </span>
              <span className="text-xs font-body font-bold text-slate-900 block mt-1">
                +1 PER TAP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Luxury Medallion Tap Button */}
      <div className="relative my-auto flex items-center justify-center py-4">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleTap}
          onTouchStart={handleTap}
          className="tap-button-white relative w-60 h-60 rounded-full flex flex-col items-center justify-center cursor-pointer"
        >
          {/* Inner Medallion Rings */}
          <div className="w-48 h-48 rounded-full border-2 border-lime-600/30 flex flex-col items-center justify-center bg-white shadow-inner">
            <span className="text-3xl font-black text-slate-900 tracking-wider font-display">
              TAP
            </span>
            <span className="text-[10px] font-body font-bold text-lime-700 tracking-widest uppercase mt-1">
              TOUCH TO EARN
            </span>
          </div>

          {/* Floating +1 numbers */}
          {floatingPoints.map((p) => (
            <span
              key={p.id}
              className="float-point-white"
              style={{ left: p.x, top: p.y }}
            >
              +1
            </span>
          ))}
        </button>
      </div>

      {/* Bottom Energy Gauge */}
      <div className="w-full space-y-1.5 pb-2 font-body">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-600 font-semibold">
            <Zap className="w-3.5 h-3.5 text-lime-700" />
            <span>ENERGY</span>
          </span>
          <span className="text-lime-700 font-bold">
            {energy} / {maxEnergy}
          </span>
        </div>

        {/* Solid Bar Gauge (No Gradients) */}
        <div className="w-full h-3 bg-slate-100 border border-slate-300 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-lime-600 rounded-full transition-all duration-150"
            style={{ width: `${energyPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
