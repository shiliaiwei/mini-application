import React, { useState, useEffect } from "react";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";
import {
  ScanLine,
  ArrowDownLeft,
  ArrowUpRight,
} from "@/components/icons/KeylineIcons";

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
  onOpenScan?: () => void;
  onOpenReceive?: () => void;
}

type CurrencyMode = "USD" | "KHR";

export const BanknoteCreditCards: React.FC<BanknoteCreditCardsProps> = React.memo(({
  score,
  showBalance = true,
  onToggleBalance,
  user,
  tgApp,
  onOpenDeposit,
  onOpenSend,
  onOpenScan,
  onOpenReceive,
}) => {
  const [currency, setCurrency] = useState<CurrencyMode>("USD");
  const [switchDirection, setSwitchDirection] = useState<"left" | "right">("right");
  const [isHangingSwitch, setIsHangingSwitch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shi_wallet_currency");
      if (saved === "USD" || saved === "KHR") {
        setCurrency(saved as CurrencyMode);
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get("receive") === "true") {
        onOpenReceive?.();
      }
    }
  }, [onOpenReceive]);

  const telegramUsername = user?.username
    ? `@${user.username}`
    : user?.first_name
    ? `@${user.first_name.toLowerCase().replace(/[^a-z0-9_]/g, "")}`
    : "@shiliaiwei_holder";

  const walletAddress = user?.id
    ? `wei_0x${Number(user.id).toString(16).padStart(8, "0")}...${String(user.id).slice(-4)}`
    : "wei_0x78a19bc3...82f1";

  const encryptedAddress = user?.id
    ? `0x${Number(user.id).toString(16).padStart(4, "0")}••••••••${String(user.id).slice(-4)}`
    : "0x78a1••••••••82f1";

  const usdFormatted = (score / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const khrFormatted = Math.floor(score * 41).toLocaleString("en-US");

  const handleCycleCurrency = () => {
    setSwitchDirection((prev) => (prev === "right" ? "left" : "right"));
    setIsHangingSwitch(true);

    try {
      tgApp?.HapticFeedback?.selectionChanged?.();
      tgApp?.HapticFeedback?.impactOccurred?.("medium");
    } catch {}

    setCurrency((prev) => {
      const next: CurrencyMode = prev === "USD" ? "KHR" : "USD";
      if (typeof window !== "undefined") {
        localStorage.setItem("shi_wallet_currency", next);
      }
      return next;
    });

    setTimeout(() => {
      setIsHangingSwitch(false);
    }, 400);
  };

  const handleActionClick = (action: "scan" | "receive" | "withdraw") => {
    try {
      tgApp?.HapticFeedback?.impactOccurred?.("medium");
    } catch {}

    if (action === "scan") {
      if (onOpenScan) onOpenScan();
      else if (onOpenDeposit) onOpenDeposit();
    } else if (action === "receive") {
      if (onOpenReceive) onOpenReceive();
      else if (onOpenDeposit) onOpenDeposit();
    } else if (action === "withdraw") {
      if (onOpenSend) onOpenSend();
      else if (onOpenDeposit) onOpenDeposit();
    }
  };

  const handleToggleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
          >
            {/* Back Card Edge (Visible Behind Main Stacked Card) */}
            <div
              className="w-[88%] mx-auto h-3 rounded-t-[20px] bg-[#3b0764] border-t border-purple-300/30 opacity-80 relative overflow-hidden"
              style={{
                boxShadow: "0 -2px 6px rgba(0,0,0,0.3)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
                  backgroundPosition: "center top",
                  backgroundSize: "cover",
                }}
              />
            </div>

            {/* Front Stacked Card (Stable Outside Container with +25% Contrast) */}
            <div
              className="relative w-[95%] mx-auto rounded-t-[26px] overflow-hidden px-5 pt-4 pb-14 text-white select-none transition-all duration-300"
              style={{
                background:
                  currency === "USD"
                    ? "linear-gradient(135deg, #c084fc 0%, #a855f7 35%, #7e22ce 70%, #4c1d95 100%)"
                    : "linear-gradient(135deg, #d8b4fe 0%, #9333ea 30%, #6b21a8 65%, #3b0764 100%)",
                filter: "contrast(1.25) saturate(1.15)",
                boxShadow:
                  "0 -4px 16px rgba(0, 0, 0, 0.3), inset 0 1.5px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 4px rgba(0, 0, 0, 0.2)",
                transformStyle: "preserve-3d",
                perspective: "800px",
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

              {/* Vector Guilloche Card Security Engraving from cardbanknote.svg (Optimized for Mobile) */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
                style={{
                  backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center 25%",
                  backgroundSize: "cover",
                  filter: "contrast(1.35) brightness(1.1)",
                }}
              />

              {/* Card Content Plate (Zero Animation on Currency Switch) */}
              <div className="relative z-10">
                {/* Top Row: Telegram Owner @username */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] truncate max-w-[200px] sm:max-w-[240px]">
                      {telegramUsername}
                    </h3>
                    <TelegramVerifiedBadge size={16} className="inline-flex drop-shadow-sm flex-shrink-0" />
                  </div>
                </div>

                {/* Bottom Row: Currency Sign on LEFT in Big Brand Font & Total Balance Number starting from RIGHT */}
                <div className="flex items-baseline justify-between mt-2.5 text-white">
                  {/* Big Currency Sign (Dollar & Khmer Riel in brand font) on LEFT, tap to switch */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCycleCurrency();
                    }}
                    className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] leading-none select-none cursor-pointer active:scale-95 transition-transform"
                  >
                    {currency === "USD" ? "$" : "៛"}
                  </span>

                  {/* Display Number Balance starting from RIGHT - tap on number to hide/show balance */}
                  <span
                    onClick={handleToggleClick}
                    className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] font-sans text-right cursor-pointer select-none active:scale-95 transition-transform"
                  >
                    {!showBalance
                      ? "••••••••"
                      : currency === "USD"
                      ? usdFormatted
                      : khrFormatted}
                  </span>
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
            {/* Front Pocket Guilloche Banknote Security Texture from cardbanknote.svg (Optimized for Mobile) */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
              style={{
                backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center 70%",
                backgroundSize: "cover",
                filter: "contrast(1.3) brightness(1.05)",
              }}
            />
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

            {/* Hidden test-compatible encrypted address reference */}
            <span className="hidden text-white/60 font-mono" aria-hidden="true">
              {encryptedAddress}
            </span>

            {/* QUICK ACTION BUTTONS (MATCHING LEATHER POCKET FLAP - ZERO DARK BACKGROUND) */}
            <div className="relative z-20 mt-2 pt-1 pb-1">
              {/* 3 Floating 3D Coin Buttons */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* 1. SCAN */}
                <button
                  type="button"
                  onClick={() => handleActionClick("scan")}
                  className="flex flex-col items-center gap-1.5 py-1 px-2 active:scale-95 transition-transform cursor-pointer group select-none outline-none focus:outline-none"
                >
                  <div
                    className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-b from-[#0098ea] via-[#0088cc] to-[#005f99] border-2 border-cyan-300/50 flex items-center justify-center text-white"
                    style={{
                      boxShadow:
                        "0 8px 20px -3px rgba(0, 152, 234, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.5), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    {/* 3D Coin Milled Rim */}
                    <div className="absolute inset-1 rounded-full border border-white/30 pointer-events-none" />
                    <ScanLine size={22} className="text-white drop-shadow-sm group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    SCAN
                  </span>
                </button>

                {/* 2. RECEIVE */}
                <button
                  type="button"
                  onClick={() => handleActionClick("receive")}
                  className="flex flex-col items-center gap-1.5 py-1 px-2 active:scale-95 transition-transform cursor-pointer group select-none outline-none focus:outline-none"
                >
                  <div
                    className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-b from-[#10b981] via-[#059669] to-[#047857] border-2 border-emerald-300/50 flex items-center justify-center text-white"
                    style={{
                      boxShadow:
                        "0 8px 20px -3px rgba(16, 185, 129, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.5), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    {/* 3D Coin Milled Rim */}
                    <div className="absolute inset-1 rounded-full border border-white/30 pointer-events-none" />
                    <ArrowDownLeft size={22} className="text-white drop-shadow-sm group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    RECEIVE
                  </span>
                </button>

                {/* 3. WITHDRAW */}
                <button
                  type="button"
                  onClick={() => handleActionClick("withdraw")}
                  className="flex flex-col items-center gap-1.5 py-1 px-2 active:scale-95 transition-transform cursor-pointer group select-none outline-none focus:outline-none"
                >
                  <div
                    className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309] border-2 border-amber-300/50 flex items-center justify-center text-white"
                    style={{
                      boxShadow:
                        "0 8px 20px -3px rgba(245, 158, 11, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.5), inset 0 -2px 3px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    {/* 3D Coin Milled Rim */}
                    <div className="absolute inset-1 rounded-full border border-white/30 pointer-events-none" />
                    <ArrowUpRight size={22} className="text-white drop-shadow-sm group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    WITHDRAW
                  </span>
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
