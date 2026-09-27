"use client";

import React from "react";

export type MascotPose = "idle" | "wave" | "announce" | "cheer";

export interface ShiliaiweiMascotProps {
  size?: number;
  pose?: MascotPose;
  className?: string;
  showBadge?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

/**
 * SHILIAIWEI Official Brand Mascot - "Weibot"
 *
 * Designed based on the official SHILIAIWEI brand identity:
 * - Spherical plush companion in electric Telegram/LinkedIn blue (#0098ea / #0284c7)
 * - Expressive oversized glossy companion eyes with twin specular reflections
 * - Pointed ears with deep brand navy accents (#0077b5 / #1e3a8a)
 * - Chest medallion featuring the official [WEI] brand badge
 * - Poses: idle, wave, announce (megaphone), and cheer
 */
export const ShiliaiweiMascot: React.FC<ShiliaiweiMascotProps> = ({
  size = 120,
  pose = "idle",
  className = "",
  showBadge = true,
  animated = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`inline-block select-none flex-shrink-0 ${
        animated ? "transition-transform duration-300 hover:scale-105 active:scale-95" : ""
      } ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`SHILIAIWEI Mascot - ${pose}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,119,181,0.25)]"
      >
        <defs>
          {/* Main Body Radial Gradient */}
          <radialGradient id="weibotBodyGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#0098ea" />
            <stop offset="85%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>

          {/* Face Mask Light Gradient */}
          <radialGradient id="weibotFaceGrad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </radialGradient>

          {/* Ear Inner Gradient */}
          <linearGradient id="weibotEarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0077b5" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Megaphone Gradient */}
          <linearGradient id="megaphoneGrad" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>

        {/* ============================================================== */}
        {/* 1. FEET                                                        */}
        {/* ============================================================== */}
        <ellipse cx="78" cy="180" rx="16" ry="10" fill="#0284c7" />
        <ellipse cx="122" cy="180" rx="16" ry="10" fill="#0284c7" />

        {/* ============================================================== */}
        {/* 2. EARS                                                        */}
        {/* ============================================================== */}
        {/* Left Ear Outer */}
        <path
          d="M 50 82 L 40 32 C 40 30 43 28 46 31 L 78 58 Z"
          fill="#0098ea"
        />
        {/* Left Ear Inner */}
        <path
          d="M 50 72 L 44 40 L 68 58 Z"
          fill="url(#weibotEarGrad)"
        />

        {/* Right Ear Outer */}
        <path
          d="M 150 82 L 160 32 C 160 30 157 28 154 31 L 122 58 Z"
          fill="#0098ea"
        />
        {/* Right Ear Inner */}
        <path
          d="M 150 72 L 156 40 L 132 58 Z"
          fill="url(#weibotEarGrad)"
        />

        {/* ============================================================== */}
        {/* 3. MAIN SPHERICAL BODY                                         */}
        {/* ============================================================== */}
        <ellipse
          cx="100"
          cy="110"
          rx="72"
          ry="68"
          fill="url(#weibotBodyGrad)"
        />

        {/* Fur Highlight Texture Sheen */}
        <ellipse
          cx="82"
          cy="78"
          rx="32"
          ry="18"
          fill="#ffffff"
          opacity="0.15"
          transform="rotate(-15 82 78)"
        />

        {/* ============================================================== */}
        {/* 4. FACE MASK / LIGHT EYE PLATE                                 */}
        {/* ============================================================== */}
        <path
          d="M 52 110 C 52 82 72 74 100 74 C 128 74 148 82 148 110 C 148 132 128 140 100 140 C 72 140 52 132 52 110 Z"
          fill="url(#weibotFaceGrad)"
        />

        {/* ============================================================== */}
        {/* 5. BIG COMPANION EYES                                          */}
        {/* ============================================================== */}
        {/* Left Eye */}
        <g id="leftEye">
          <ellipse cx="80" cy="106" rx="17" ry="21" fill="#0f172a" />
          {/* Big Specular Reflection */}
          <circle cx="75" cy="98" r="6.5" fill="#ffffff" />
          {/* Secondary Sub-Reflection */}
          <circle cx="86" cy="115" r="3" fill="#ffffff" opacity="0.85" />
        </g>

        {/* Right Eye */}
        <g id="rightEye">
          <ellipse cx="120" cy="106" rx="17" ry="21" fill="#0f172a" />
          {/* Big Specular Reflection */}
          <circle cx="115" cy="98" r="6.5" fill="#ffffff" />
          {/* Secondary Sub-Reflection */}
          <circle cx="126" cy="115" r="3" fill="#ffffff" opacity="0.85" />
        </g>

        {/* Cute Cheek Blushes */}
        <ellipse cx="62" cy="120" rx="7" ry="4" fill="#38bdf8" opacity="0.6" />
        <ellipse cx="138" cy="120" rx="7" ry="4" fill="#38bdf8" opacity="0.6" />

        {/* ============================================================== */}
        {/* 6. NOSE & MOUTH                                                */}
        {/* ============================================================== */}
        {/* Tiny Button Nose */}
        <ellipse cx="100" cy="115" rx="3.5" ry="2.5" fill="#0f172a" />

        {/* Cheerful Mouth */}
        {pose === "announce" ? (
          /* Wide Open Shouting Mouth */
          <path
            d="M 94 122 Q 100 134 106 122 Z"
            fill="#0f172a"
          />
        ) : (
          /* Cute Cat W-Smile */
          <path
            d="M 93 121 Q 96.5 125 100 122 Q 103.5 125 107 121"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* ============================================================== */}
        {/* 7. CHEST EMBLEM: SHILIAIWEI [WEI] BADGE                         */}
        {/* ============================================================== */}
        {showBadge && (
          <g transform="translate(82, 146)">
            {/* Medallion Badge Container */}
            <rect
              x="0"
              y="0"
              width="36"
              height="18"
              rx="5"
              fill="#ffffff"
              stroke="#0284c7"
              strokeWidth="1.5"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
            />
            {/* WEI Text */}
            <text
              x="18"
              y="13"
              textAnchor="middle"
              fill="#0098ea"
              fontSize="10"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              letterSpacing="0.02em"
            >
              WEI
            </text>
          </g>
        )}

        {/* ============================================================== */}
        {/* 8. ARMS & POSE ACCESSORIES                                     */}
        {/* ============================================================== */}
        {pose === "idle" && (
          <>
            {/* Left Arm Resting */}
            <ellipse
              cx="34"
              cy="126"
              rx="12"
              ry="18"
              fill="#0098ea"
              transform="rotate(25 34 126)"
            />
            {/* Right Arm Resting */}
            <ellipse
              cx="166"
              cy="126"
              rx="12"
              ry="18"
              fill="#0098ea"
              transform="rotate(-25 166 126)"
            />
          </>
        )}

        {pose === "wave" && (
          <>
            {/* Left Arm Resting */}
            <ellipse
              cx="34"
              cy="126"
              rx="12"
              ry="18"
              fill="#0098ea"
              transform="rotate(25 34 126)"
            />
            {/* Right Arm Waving High */}
            <ellipse
              cx="168"
              cy="86"
              rx="13"
              ry="22"
              fill="#0098ea"
              transform="rotate(45 168 86)"
            />
            {/* Wave Sparkles */}
            <circle cx="188" cy="68" r="2.5" fill="#38bdf8" />
            <circle cx="180" cy="56" r="3.5" fill="#facc15" />
          </>
        )}

        {pose === "announce" && (
          <>
            {/* Left Arm Holding Megaphone */}
            <ellipse
              cx="44"
              cy="120"
              rx="12"
              ry="16"
              fill="#0098ea"
              transform="rotate(-30 44 120)"
            />
            {/* Blue Megaphone Prop (Matching Image 2) */}
            <path
              d="M 44 116 L 10 92 L 6 138 L 44 122 Z"
              fill="url(#megaphoneGrad)"
              stroke="#0369a1"
              strokeWidth="1.5"
            />
            {/* Megaphone Rim */}
            <ellipse
              cx="8"
              cy="115"
              rx="4"
              ry="23"
              fill="#38bdf8"
              stroke="#0369a1"
              strokeWidth="1.5"
            />
            {/* Sound Wave Accent Lines */}
            <path
              d="M -4 98 Q -14 115 -4 132"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M -12 90 Q -24 115 -12 140"
              stroke="#0098ea"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Arm */}
            <ellipse
              cx="166"
              cy="126"
              rx="12"
              ry="18"
              fill="#0098ea"
              transform="rotate(-25 166 126)"
            />
          </>
        )}

        {pose === "cheer" && (
          <>
            {/* Both Arms Raised in Joy */}
            <ellipse
              cx="34"
              cy="90"
              rx="12"
              ry="20"
              fill="#0098ea"
              transform="rotate(-40 34 90)"
            />
            <ellipse
              cx="166"
              cy="90"
              rx="12"
              ry="20"
              fill="#0098ea"
              transform="rotate(40 166 90)"
            />
            {/* Sparkles of Triumph */}
            <polygon
              points="100,32 103,40 111,43 103,46 100,54 97,46 89,43 97,40"
              fill="#facc15"
            />
            <circle cx="48" cy="52" r="3" fill="#38bdf8" />
            <circle cx="152" cy="52" r="3" fill="#38bdf8" />
          </>
        )}
      </svg>
    </div>
  );
};
