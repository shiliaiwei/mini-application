"use client";

import React from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import { getUserLevelInfo } from "@/lib/games/levels";
import { Shield, Sparkles } from "lucide-react";

interface LevelCircleProfileProps {
  score: number;
  user: TelegramUser | null;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

export const LevelCircleProfile: React.FC<LevelCircleProfileProps> = ({
  score,
  user,
  size = "md",
  showDetails = true,
}) => {
  const levelInfo = getUserLevelInfo(score);
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || `@${user?.username}` || "SHILIAIWEI Player";

  // Dimension presets
  const sizeMap = {
    sm: { container: 40, avatar: 32, stroke: 3, font: "text-[9px]" },
    md: { container: 68, avatar: 54, stroke: 4, font: "text-xs" },
    lg: { container: 96, avatar: 80, stroke: 5, font: "text-sm" },
  };

  const { container, avatar, stroke } = sizeMap[size];
  const radius = (container - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (levelInfo.progressPercent / 100) * circumference;

  return (
    <div className="flex items-center gap-3 select-none font-body">
      {/* Border Radius Circular Profile with SVG Level Progress Ring */}
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: container, height: container }}
      >
        {/* SVG Progress Circle Ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={container}
          height={container}
          viewBox={`0 0 ${container} ${container}`}
        >
          {/* Background Ring Track */}
          <circle
            cx={container / 2}
            cy={container / 2}
            r={radius}
            fill="none"
            stroke="#232c35"
            strokeWidth={stroke}
          />
          {/* Dynamic Level Progress Arc */}
          <circle
            cx={container / 2}
            cy={container / 2}
            r={radius}
            fill="none"
            stroke={levelInfo.color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {/* Circular Avatar Container */}
        <div
          className="rounded-full overflow-hidden flex items-center justify-center bg-[#182026] border border-[#232c35]"
          style={{ width: avatar, height: avatar }}
        >
          {user?.photo_url ? (
            <Image
              src={user.photo_url}
              alt="Avatar"
              width={avatar}
              height={avatar}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-black"
              style={{ backgroundColor: levelInfo.color }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Level Badge Pill (Pinned to Bottom of Circle) */}
        <div
          className="absolute -bottom-1 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider text-black flex items-center gap-0.5 border border-black/40 shadow-sm"
          style={{ backgroundColor: levelInfo.color }}
        >
          <span>L{levelInfo.level}</span>
        </div>
      </div>

      {/* Profile Details & Level Status (Optional) */}
      {showDetails && (
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white truncate block">
              {displayName}
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.2 rounded text-white flex items-center gap-1"
              style={{ backgroundColor: "#202932", borderColor: levelInfo.color, borderWidth: 1 }}
            >
              <Shield className="w-2.5 h-2.5" style={{ color: levelInfo.color }} />
              <span>{levelInfo.title}</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-semibold">
            <span>Progress: {score.toLocaleString()} / {levelInfo.nextLevelScore.toLocaleString()} PTS</span>
            <span className="text-white font-bold">{levelInfo.progressPercent}%</span>
          </div>

          {/* Level Progress Bar */}
          <div className="w-full h-1.5 bg-[#131b22] border border-[#232c35] rounded-full overflow-hidden mt-1">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${levelInfo.progressPercent}%`,
                backgroundColor: levelInfo.color,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
