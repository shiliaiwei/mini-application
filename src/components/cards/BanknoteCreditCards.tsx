"use client";

import React, { useState, useEffect } from "react";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";

interface BanknoteCreditCardsProps {
  score: number;
  showBalance?: boolean;
  onToggleBalance?: () => void;
  user?: {
    id?: number | string;
    first_name?: string;
    last_name?: string;
    username?: string;
  } | null;
  tgApp?: {
    HapticFeedback?: {
      impactOccurred?: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
      notificationOccurred?: (type: "error" | "success" | "warning") => void;
      selectionChanged?: () => void;
    };
  } | null;
  onOpenDeposit?: () => void;
  onOpenSend?: () => void;
  onOpenSwap?: () => void;
  onOpenAddress?: () => void;
}

type CurrencyMode = "USD" | "KHR" | "SAR";

export const BanknoteCreditCards: React.FC<BanknoteCreditCardsProps> = React.memo(({
  score,
  showBalance = true,
  onToggleBalance,
  user,
  tgApp,
  onOpenDeposit,
}) => {
  const [currency, setCurrency] = useState<CurrencyMode>("USD");
  const [switchDirection, setSwitchDirection] = useState<"left" | "right">("right");
  const [isHangingSwitch, setIsHangingSwitch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shi_wallet_currency");
      if (saved === "USD" || saved === "KHR" || saved === "SAR") {
        setCurrency(saved as CurrencyMode);
      }
    }
  }, []);

  const telegramUsername = user?.username
    ? `@${user.username}`
    : user?.first_name
    ? `@${user.first_name.toLowerCase().replace(/[^a-z0-9_]/g, "")}`
    : "@shiliaiwei_holder";

  const walletAddress = user?.id
    ? `wei_0x${Number(user.id).toString(16).padStart(8, "0")}...${String(user.id).slice(-4)}`
    : "wei_0x78a19bc3...82f1";

  const usdFormatted = (score > 0 ? score / 100 : 268.48).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const khrFormatted = Math.floor(score > 0 ? score * 41 : 1100768).toLocaleString("en-US");

  const sarFormatted = (25867.40 + (score > 0 ? score * 0.0375 : 0)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleCycleCurrency = () => {
    setSwitchDirection((prev) => (prev === "right" ? "left" : "right"));
    setIsHangingSwitch(true);

    try {
      tgApp?.HapticFeedback?.selectionChanged?.();
      tgApp?.HapticFeedback?.impactOccurred?.("medium");
    } catch {}

    setCurrency((prev) => {
      const next: CurrencyMode = prev === "USD" ? "KHR" : prev === "KHR" ? "SAR" : "USD";
      if (typeof window !== "undefined") {
        localStorage.setItem("shi_wallet_currency", next);
      }
      return next;
    });

    setTimeout(() => {
      setIsHangingSwitch(false);
    }, 400);
  };

  const handleAddBalanceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      tgApp?.HapticFeedback?.impactOccurred?.("medium");
    } catch {}
    if (onOpenDeposit) {
      onOpenDeposit();
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      tgApp?.HapticFeedback?.selectionChanged?.();
    } catch {}
    if (onToggleBalance) {
      onToggleBalance();
    }
  };

  return (
    <div className="w-full select-none py-1">
      {/* Soft Ambient Backdrop Container */}
      <div className="relative w-full max-w-[430px] mx-auto">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute -inset-2 bg-purple-600/15 rounded-[46px] blur-2xl pointer-events-none" />

        {/* 3D Skeuomorphic Leather Pocket Container */}
        <div
          className="relative w-full rounded-[38px] p-2 bg-gradient-to-b from-[#6b22a8] via-[#52188f] to-[#380c63]"
          style={{
            boxShadow:
              "0 24px 48px -12px rgba(45, 10, 80, 0.55), 0 12px 24px -6px rgba(30, 5, 55, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.55)",
          }}
        >
          {/* Simulated Leather Grain Texture Overlay */}
          <div
            className="absolute inset-0 rounded-[38px] opacity-15 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(0,0,0,0.5) 1px, transparent 1px)`,
              backgroundSize: "6px 6px, 8px 8px",
            }}
          />

          {/* Perimeter Simulated Thread Stitching (Light Lavender Dashed Lines) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="9"
              y="9"
              width="calc(100% - 18px)"
              height="calc(100% - 18px)"
              rx="30"
              ry="30"
              fill="none"
              stroke="#e9d5ff"
              strokeWidth="1.25"
              strokeDasharray="4 4"
              strokeLinecap="round"
              opacity="0.5"
              style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
            />
          </svg>

          {/* ============================================================== */}
          {/* 1. STACKED CARDS PEEKING FROM TOP SLOT (INTERACTIVE SWITCH)   */}
          {/* ============================================================== */}
          <div
            onClick={handleCycleCurrency}
            className="relative w-full pt-1 px-3 cursor-pointer group"
            title="Tap card to switch currency ($ USD / ៛ KHR / SAR)"
          >
            {/* Back Card Edge (Visible Behind Main Stacked Card) */}
            <div
              className="w-[88%] mx-auto h-3 rounded-t-[20px] bg-[#3b0764] border-t border-purple-300/30 opacity-80"
              style={{
                boxShadow: "0 -2px 6px rgba(0,0,0,0.3)",
              }}
            />

            {/* Front Stacked Card (Stable Outside Container) */}
            <div
              className="relative w-[95%] mx-auto rounded-t-[26px] overflow-hidden px-5 pt-4 pb-14 text-white select-none"
              style={{
                background:
                  currency === "USD"
                    ? "linear-gradient(135deg, #d8b4fe 0%, #c084fc 40%, #a855f7 75%, #9333ea 100%)"
                    : currency === "KHR"
                    ? "linear-gradient(135deg, #e9d5ff 0%, #c084fc 35%, #7e22ce 70%, #581c87 100%)"
                    : "linear-gradient(135deg, #d8b4fe 0%, #a855f7 50%, #6b21a8 100%)",
                boxShadow:
                  "0 -4px 16px rgba(0, 0, 0, 0.25), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.15)",
              }}
            >
              {/* Card Specular Light Sheen */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 45%, transparent 70%)",
                }}
              />

              {/* Simulated Suspension Eyelets */}
              <div className="absolute top-2 inset-x-8 flex justify-between pointer-events-none z-20 opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-inner" />
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-inner" />
              </div>

              {/* Hanging Style Switching Content Plate */}
              <div
                className="relative z-10 will-change-transform"
                style={{
                  transformOrigin: switchDirection === "right" ? "top left" : "top right",
                  transform: isHangingSwitch
                    ? switchDirection === "right"
                      ? "translateX(18px) rotate(3deg)"
                      : "translateX(-18px) rotate(-3deg)"
                    : "translateX(0px) rotate(0deg)",
                  opacity: isHangingSwitch ? 0.75 : 1,
                  transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease-out",
                }}
              >
                <div className="flex items-start justify-between">
                  {/* Left Column: Telegram Owner @username & Crypto Address */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] truncate max-w-[150px] sm:max-w-[185px]">
                        {telegramUsername}
                      </h3>
                      <TelegramVerifiedBadge size={16} className="inline-flex drop-shadow-sm flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs font-mono tracking-wider text-purple-100/90 font-medium truncate max-w-[150px] sm:max-w-[180px]">
                        {walletAddress}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Currency Sign (Dollar $ / Riel ៛ / SAR) & Valid Date */}
                  <div className="flex flex-col items-end">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_6px_rgba(0,0,0,0.2)] transition-all"
                    >
                      {currency === "USD" ? (
                        <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] leading-none flex items-center gap-1">
                          $ <span className="text-[11px] font-black tracking-wider uppercase opacity-95">USD</span>
                        </span>
                      ) : currency === "KHR" ? (
                        <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] leading-none flex items-center gap-1">
                          ៛ <span className="text-[11px] font-black tracking-wider uppercase opacity-95">KHR</span>
                        </span>
                      ) : (
                        <span className="text-lg sm:text-xl font-black italic tracking-tighter text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] leading-none">
                          SAR
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] sm:text-xs text-purple-100/90 font-medium mt-1">
                      Valid: 05/29
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. 3D FRONT LEATHER POCKET WITH CURVED LIP & STITCHING */}
          {/* ============================================================== */}
          <div
            className="relative -mt-10 rounded-b-[32px] rounded-t-[26px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#5c1c99] via-[#4c1482] to-[#340b5c]"
            style={{
              boxShadow:
                "0 -8px 20px -4px rgba(25, 4, 45, 0.6), inset 0 2px 2px rgba(255, 255, 255, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.45)",
            }}
          >
            {/* Front Lip Curved Stitching Simulation */}
            <div className="absolute top-2 inset-x-5 pointer-events-none">
              <svg className="w-full h-3 overflow-visible" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 2 2 Q 180 8 360 2"
                  fill="none"
                  stroke="#e9d5ff"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  opacity="0.5"
                  style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
                />
              </svg>
            </div>

            {/* Front Pocket Lip 3D Specular Highlight Edge */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* BALANCE HEADER & VALUE */}
            <div className="relative z-10 pt-1">
              <div className="flex items-center justify-between text-[13px] font-medium text-purple-200/90 tracking-wide mb-1">
                <span>Total Balance</span>
                <span
                  onClick={handleCycleCurrency}
                  className="text-[10px] text-purple-200/80 hover:text-white cursor-pointer transition-colors"
                >
                  {currency === "USD"
                    ? "Tap card to switch to ៛ KHR"
                    : currency === "KHR"
                    ? "Tap card to switch to SAR"
                    : "Tap card to switch to $ USD"}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] font-sans">
                  {!showBalance
                    ? "••••••••"
                    : currency === "USD"
                    ? `$${usdFormatted}`
                    : currency === "KHR"
                    ? `៛${khrFormatted}`
                    : `SAR ${sarFormatted}`}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS ROW */}
            <div className="relative z-10 flex items-center justify-between gap-3 pt-5 mt-1">
              {/* Left: "+ Add Balance" Translucent Frosted Glass Pill Button */}
              <button
                type="button"
                onClick={handleAddBalanceClick}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all duration-200 ease-out border border-white/20 backdrop-blur-md text-white font-medium text-xs sm:text-sm cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_12px_rgba(0,0,0,0.18)]"
              >
                {/* Plus Icon */}
                <svg
                  className="w-4 h-4 text-white stroke-[2.5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Add Balance</span>
              </button>

              {/* Right: Secondary Utility Icon Buttons */}
              <div className="flex items-center gap-2.5">
                {/* Eye / Visibility Toggle Circular Button */}
                <button
                  type="button"
                  onClick={handleToggleClick}
                  aria-label={showBalance ? "Hide Balance" : "Show Balance"}
                  title={showBalance ? "Hide Balance" : "Show Balance"}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all duration-200 ease-out border border-white/20 backdrop-blur-md flex items-center justify-center text-white cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_12px_rgba(0,0,0,0.18)]"
                >
                  {showBalance ? (
                    /* Eye Open Icon */
                    <svg
                      className="w-4 h-4 text-white stroke-[2]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    /* Eye Slashed / Hidden Icon */
                    <svg
                      className="w-4 h-4 text-white stroke-[2]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BanknoteCreditCards.displayName = "BanknoteCreditCards";
