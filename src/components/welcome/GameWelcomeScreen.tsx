"use client";

import React, { useEffect, useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";

interface GameWelcomeScreenProps {
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
  onComplete: () => void;
}

/**
 * Mobile App Welcome Screen (Android SplashScreen API Architecture)
 *
 * SPECIFICATIONS (Android 12+ Window SplashScreen & Adaptive Icon Guidelines):
 * 1. Window Background: Single opaque color (#ffffff) covering the full Window/Activity.
 * 2. Animation Duration: Total duration <= 1,000 milliseconds (950ms total sequence).
 * 3. Adaptive App Icon with Background:
 *    - Canvas size: 240×240 dp
 *    - Circular mask: 160 dp diameter (one-third of the foreground is masked)
 *    - Vector drawable: Pure vector launcher icon with into-app launch animation
 * 4. Branded Image:
 *    - Dimensions: 200×80 dp at bottom third of the splash window
 *    - Official SHILIAIWEI brand logo on one line with tight zero-excess spacing
 *    - Zero additions rule: Never add anything before, after, or around the logo
 */
export const GameWelcomeScreen: React.FC<GameWelcomeScreenProps> = ({
  tgApp,
  onComplete,
}) => {
  const [stage, setStage] = useState<"initial" | "entered" | "shimmer" | "exit">("initial");

  useEffect(() => {
    // 50ms: Trigger spring into-app launch motion
    const tEnter = setTimeout(() => {
      setStage("entered");
      try {
        tgApp?.HapticFeedback?.impactOccurred("light");
      } catch {}
    }, 50);

    // 400ms: Trigger logo shimmer sweep & badge energy pulse
    const tShimmer = setTimeout(() => {
      setStage("shimmer");
      try {
        tgApp?.HapticFeedback?.selectionChanged();
      } catch {}
    }, 400);

    // 780ms: Begin smooth into-app exit transition
    const tExit = setTimeout(() => {
      setStage("exit");
    }, 780);

    // 980ms: Finalize and hand over to app Activity (<= 1,000ms limit)
    const tComplete = setTimeout(() => {
      onComplete();
    }, 980);

    return () => {
      clearTimeout(tEnter);
      clearTimeout(tShimmer);
      clearTimeout(tExit);
      clearTimeout(tComplete);
    };
  }, [tgApp, onComplete]);

  const handleInstantDismiss = () => {
    setStage("exit");
    try {
      tgApp?.HapticFeedback?.impactOccurred("medium");
    } catch {}
    setTimeout(onComplete, 80);
  };

  const isExiting = stage === "exit";
  const isEntered = stage === "entered" || stage === "shimmer" || stage === "exit";
  const isShimmer = stage === "shimmer" || stage === "exit";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleInstantDismiss}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleInstantDismiss()}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-white select-none overflow-hidden cursor-pointer focus:outline-none transition-all duration-300 ease-out ${
        isExiting ? "opacity-0 scale-[1.04] pointer-events-none" : "opacity-100 scale-100"
      }`}
      aria-label="SHILIAIWEI Mobile App Launch Screen"
    >
      {/* 1. Window Background - Single Opaque White (#ffffff) with subtle banknote security mesh */}
      <div className="absolute inset-0 bg-app-guilloche opacity-[0.035] pointer-events-none z-0" />

      {/* Top Spacer */}
      <div className="flex-1 w-full" />

      {/* 2. Adaptive App Icon (Android 12+ SplashScreen: 240x240 dp canvas, 160 dp circular mask) */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: "240px", height: "240px" }}
        >
          {/* Concentric Ambient Energy Ripple Rings */}
          <div
            className={`absolute rounded-full border border-[#0098ea]/25 pointer-events-none transition-all duration-700 ease-out ${
              isEntered ? "w-60 h-60 opacity-60 scale-100" : "w-28 h-28 opacity-0 scale-50"
            }`}
          />
          <div
            className={`absolute rounded-full border border-[#0098ea]/15 pointer-events-none transition-all duration-1000 ease-out delay-100 ${
              isEntered ? "w-72 h-72 opacity-40 scale-100" : "w-32 h-32 opacity-0 scale-50"
            }`}
          />

          {/* Centered Circular Mask: 160 dp diameter (One-third foreground masked) */}
          <div
            style={{ width: "160px", height: "160px" }}
            className={`rounded-full overflow-hidden bg-gradient-to-br from-[#00b4d8] via-[#0098ea] to-[#0077b5] shadow-2xl shadow-[#0098ea]/35 flex items-center justify-center relative transition-all duration-500 transform ${
              isEntered
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-75 opacity-0 translate-y-4"
            }`}
          >
            {/* Shimmer Light Reflection Sweep Layer */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full transition-transform duration-700 ease-in-out pointer-events-none ${
                isShimmer ? "translate-x-full" : "-translate-x-full"
              }`}
            />

            {/* Vector Drawable Foreground: Vault Shield & Web3 Lightning Mark */}
            <svg
              width="96"
              height="96"
              viewBox="0 0 96 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`select-none filter drop-shadow-md transition-all duration-500 ${
                isEntered ? "scale-100 rotate-0" : "scale-90 -rotate-6"
              }`}
            >
              {/* Outer Security Shield Hexagon Contour */}
              <path
                d="M48 8L82 22V46C82 66.8 67.5 86.1 48 91C28.5 86.1 14 66.8 14 46V22L48 8Z"
                fill="white"
                fillOpacity="0.16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Inner Medallion Guilloche Ring */}
              <circle
                cx="48"
                cy="48"
                r="26"
                stroke="white"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                strokeOpacity="0.6"
              />

              {/* Center Web3 Lightning Energy Vector */}
              <path
                d="M51 24L33 49H47L43 72L63 46H49L53 24H51Z"
                fill="white"
                className="drop-shadow-sm"
              />

              {/* Micro Nodes representing Web3 Security */}
              <circle cx="48" cy="18" r="2.5" fill="white" />
              <circle cx="70" cy="46" r="2.5" fill="white" />
              <circle cx="26" cy="46" r="2.5" fill="white" />
              <circle cx="48" cy="78" r="2.5" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="flex-1 w-full" />

      {/* 3. Branded Image (Android SplashScreen API: 200x80 dp) with Animated Logo Entrance */}
      <div className="relative z-10 pb-8 flex flex-col items-center justify-center">
        <div
          style={{ width: "200px", height: "80px" }}
          className={`flex items-center justify-center relative overflow-hidden transition-all duration-600 ease-out transform ${
            isEntered
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-3 scale-95"
          }`}
        >
          {/* Logo Container with Smooth Spring Scale */}
          <div
            className={`transition-all duration-500 transform ${
              isShimmer ? "scale-105" : "scale-100"
            }`}
          >
            {/* Strictly Official SHILIAIWEI Logo: Single line, tight 2px gap, zero additions */}
            <ShiliaiweiBrand height={26} colorScheme="blue" />
          </div>

          {/* Shimmer Light Bar across Logo */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-sky-300/30 to-transparent pointer-events-none transition-transform duration-700 ease-in-out ${
              isShimmer ? "translate-x-full" : "-translate-x-full"
            }`}
          />
        </div>
      </div>
    </div>
  );
};
