"use client";

import React, { useState, useRef, useEffect } from "react";
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
    // Trigger haptic
    try {
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}

    // Calculate click coordinates for floating +1
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

      // Remove after animation
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
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-mono text-neutral-400 uppercase">
            {user?.username ? `@${user.username}` : user?.first_name || "TELEGRAM USER"}
          </span>
          <span className="text-lime-400 font-mono font-bold">
            LEVEL 1
          </span>
        </div>

        {/* Big Score Display */}
        <div className="text-center py-2">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            TOTAL SCORE
          </div>
          <div className="text-5xl font-black text-lime-400 tracking-tight mt-1 font-mono">
            {score.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono mt-0.5 uppercase">
            1 TAP = 1 POINT
          </div>
        </div>

        {/* Telemetry Bar (Spend Time & Energy) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="game-card rounded-xl p-2.5 flex items-center gap-2">
            <Timer className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-neutral-400 uppercase block leading-none">
                TIME SPENT
              </span>
              <span className="text-xs font-mono font-bold text-white block mt-1">
                {formatTime(spendSeconds)}
              </span>
            </div>
          </div>

          <div className="game-card rounded-xl p-2.5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-neutral-400 uppercase block leading-none">
                RATE
              </span>
              <span className="text-xs font-mono font-bold text-white block mt-1">
                +1 PER TAP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Giant Tactile Tap Target Button */}
      <div className="relative my-auto flex items-center justify-center py-4">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleTap}
          onTouchStart={handleTap}
          className="tap-button relative w-60 h-60 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-2xl active:shadow-none"
        >
          {/* Inner ring */}
          <div className="w-48 h-48 rounded-full border-2 border-lime-500/40 flex flex-col items-center justify-center bg-[#111914]">
            <span className="text-2xl font-black text-lime-400 tracking-wider font-mono">
              TAP
            </span>
            <span className="text-[11px] font-mono text-neutral-400 tracking-widest uppercase mt-1">
              TOUCH TO EARN
            </span>
          </div>

          {/* Floating +1 numbers */}
          {floatingPoints.map((p) => (
            <span
              key={p.id}
              className="float-point"
              style={{ left: p.x, top: p.y }}
            >
              +1
            </span>
          ))}
        </button>
      </div>

      {/* Bottom Energy Gauge */}
      <div className="w-full space-y-1.5 pb-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1 text-neutral-300">
            <Zap className="w-3.5 h-3.5 text-lime-400" />
            <span>ENERGY</span>
          </span>
          <span className="text-lime-400 font-bold">
            {energy} / {maxEnergy}
          </span>
        </div>

        {/* Solid Bar Gauge (No Gradients) */}
        <div className="w-full h-3 bg-[#111914] border border-[#233827] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-lime-400 rounded-full transition-all duration-150"
            style={{ width: `${energyPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
