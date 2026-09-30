import React, { useState, useEffect } from "react";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import {
  ScanLine,
  ArrowUpRight,
} from "@/components/icons/KeylineIcons";

interface BanknoteCreditCardsProps {
  score: number;
  usdBalance?: number;
  khrBalance?: number;
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

type CurrencyMode = "WEI" | "USD" | "KHR";

export const BanknoteCreditCards: React.FC<BanknoteCreditCardsProps> = React.memo(({
  score,
  usdBalance,
  khrBalance,
  showBalance = true,
  onToggleBalance,
  user,
  tgApp,
  onOpenDeposit,
  onOpenSend,
  onOpenScan,
  onOpenReceive,
}) => {
  const [currency, setCurrency] = useState<CurrencyMode>("WEI");
  const [switchDirection, setSwitchDirection] = useState<"left" | "right">("right");
  const [isHangingSwitch, setIsHangingSwitch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shi_wallet_currency");
      if (saved === "WEI" || saved === "USD" || saved === "KHR") {
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
    : user?.id
    ? `@vault_${user.id}`
    : "@vault_holder";

  const walletAddress = user?.id
    ? `wei_0x${Number(user.id).toString(16).padStart(8, "0")}...${String(user.id).slice(-4)}`
    : "wei_0x78a19bc3...82f1";

  const encryptedAddress = user?.id
    ? `0x${Number(user.id).toString(16).padStart(4, "0")}••••••••${String(user.id).slice(-4)}`
    : "0x78a1••••••••82f1";

  const weiFormatted = score.toLocaleString("en-US");

  const usdFormatted = (usdBalance !== undefined ? usdBalance : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const khrFormatted = Math.floor(khrBalance !== undefined ? khrBalance : 0).toLocaleString("en-US");

  const handleCycleCurrency = () => {
    setSwitchDirection((prev) => (prev === "right" ? "left" : "right"));
    setIsHangingSwitch(true);

    try {
      tgApp?.HapticFeedback?.selectionChanged?.();
      tgApp?.HapticFeedback?.impactOccurred?.("medium");
    } catch {}

    setCurrency((prev) => {
      let next: CurrencyMode = "USD";
      if (prev === "WEI") next = "USD";
      else if (prev === "USD") next = "KHR";
      else if (prev === "KHR") next = "WEI";
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
    } else if (action === "receive") {
      if (onOpenReceive) onOpenReceive();
    } else if (action === "withdraw") {
      if (onOpenSend) onOpenSend();
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
                  currency === "WEI"
                    ? "linear-gradient(135deg, #0284c7 0%, #0098ea 35%, #0369a1 70%, #0c4a6e 100%)"
                    : currency === "USD"
                    ? "linear-gradient(135deg, #059669 0%, #047857 35%, #065f46 70%, #064e3b 100%)"
                    : "linear-gradient(135deg, #c084fc 0%, #a855f7 35%, #7e22ce 70%, #4c1d95 100%)",
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
              <div className="relative z-10 space-y-2">
                {/* Top Row: Telegram Owner @username & Wei Coin Brand Logo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] truncate max-w-[170px] sm:max-w-[210px]">
                      {telegramUsername}
                    </h3>
                    <TelegramVerifiedBadge size={16} className="inline-flex drop-shadow-sm flex-shrink-0" />
                  </div>
                  <ShiliaiweiBrand colorScheme="white" height={16} className="opacity-95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] flex-shrink-0" />
                </div>

                {/* Middle Row: Transparent Monospace Encrypted Address */}
                <div className="flex items-center text-[11px] font-mono text-white/60 tracking-wider">
                  <span>{encryptedAddress}</span>
                </div>

                {/* Bottom Row: Currency Sign on LEFT in Big Brand Font & Total Balance Number starting from RIGHT */}
                <div className="flex items-baseline justify-between mt-2.5 text-white">
                  {/* Big Currency Sign (WEI Badge, Dollar, or Khmer Riel in brand font) on LEFT, tap to switch */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCycleCurrency();
                    }}
                    className="cursor-pointer active:scale-95 transition-transform flex items-center"
                  >
                    {currency === "WEI" ? (
                      <span className="px-2 py-0.5 rounded-md bg-white text-[#0098ea] font-black text-sm tracking-tight shadow-sm">
                        WEI
                      </span>
                    ) : (
                      <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] leading-none select-none">
                        {currency === "USD" ? "$" : "៛"}
                      </span>
                    )}
                  </div>

                  {/* Display Number Balance starting from RIGHT - tap on number to hide/show balance */}
                  <span
                    onClick={handleToggleClick}
                    className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] font-sans text-right cursor-pointer select-none active:scale-95 transition-transform"
                  >
                    {!showBalance
                      ? "••••••••"
                      : currency === "WEI"
                      ? weiFormatted
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


            {/* QUICK ACTION BUTTONS (MATCHING LEATHER POCKET FLAP - ZERO DARK BACKGROUND) */}
            <div className="relative z-20 mt-2 pt-1 pb-1">
              {/* 3 Floating 3D Premium Coin Buttons */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* 1. SCAN */}
                <button
                  type="button"
                  onClick={() => handleActionClick("scan")}
                  className="flex flex-col items-center gap-1.5 py-1 px-2 active:scale-90 active:translate-y-0.5 transition-all duration-200 cursor-pointer group select-none outline-none focus:outline-none"
                >
                  <div
                    className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-b from-[#00b4d8] via-[#0098ea] to-[#006097] border-2 border-cyan-200/60 flex items-center justify-center text-white"
                    style={{
                      boxShadow:
                        "0 10px 24px -4px rgba(0, 152, 234, 0.7), inset 0 2px 3px rgba(255, 255, 255, 0.6), inset 0 -3px 5px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {/* 3D Coin Milled Rim */}
                    <div className="absolute inset-1 rounded-full border border-white/40 pointer-events-none" />
                    <ScanLine size={21} className="text-white drop-shadow-sm group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    SCAN
                  </span>
                </button>

                {/* 2. WEI COIN (OFFICIAL WEI LOGO BADGE - PREVIOUSLY RECEIVE) */}
                <button
                  type="button"
                  onClick={() => handleActionClick("receive")}
                  className="flex flex-col items-center gap-1.5 py-1 px-2 active:scale-90 active:translate-y-0.5 transition-all duration-200 cursor-pointer group select-none outline-none focus:outline-none"
                >
                  <div
                    className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-b from-[#0098ea] via-[#0077b5] to-[#004e7c] border-2 border-sky-200/70 flex items-center justify-center text-white"
                    style={{
                      boxShadow:
                        "0 10px 24px -4px rgba(0, 152, 234, 0.75), inset 0 2px 3px rgba(255, 255, 255, 0.65), inset 0 -3px 5px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {/* 3D Coin Milled Rim */}
                    <div className="absolute inset-1 rounded-full border border-white/40 pointer-events-none" />
                    {/* Official WEI Badge */}
                    <div className="px-1.5 py-0.5 rounded bg-white text-[#0098ea] font-black text-[11px] sm:text-xs tracking-tight shadow-xs group-hover:scale-110 transition-transform">
                      WEI
                    </div>
                  </div>
                  <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    WEI COIN
                  </span>
                </button>

                {/* 3. WITHDRAW */}
                <button
                  type="button"
                  onClick={() => handleActionClick("withdraw")}
                  className="flex flex-col items-center gap-1.5 py-1 px-2 active:scale-90 active:translate-y-0.5 transition-all duration-200 cursor-pointer group select-none outline-none focus:outline-none"
                >
                  <div
                    className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-b from-[#fbbf24] via-[#f59e0b] to-[#b45309] border-2 border-amber-200/60 flex items-center justify-center text-white"
                    style={{
                      boxShadow:
                        "0 10px 24px -4px rgba(245, 158, 11, 0.7), inset 0 2px 3px rgba(255, 255, 255, 0.6), inset 0 -3px 5px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {/* 3D Coin Milled Rim */}
                    <div className="absolute inset-1 rounded-full border border-white/40 pointer-events-none" />
                    <ArrowUpRight size={21} className="text-white drop-shadow-sm group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    WITHDRAW
                  </span>
                </button>
              </div>

              {/* 3 DISTINCT CURRENCY BLOCK STORES DISPLAY */}
              <div className="mt-3 pt-2.5 border-t border-white/15 grid grid-cols-3 gap-1.5 text-center">
                <div
                  onClick={() => {
                    setCurrency("WEI");
                    try {
                      tgApp?.HapticFeedback?.selectionChanged?.();
                    } catch {}
                  }}
                  className={`p-1.5 rounded-xl border cursor-pointer active:scale-95 transition-all ${
                    currency === "WEI"
                      ? "bg-cyan-500/25 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.35)]"
                      : "bg-black/25 border-cyan-400/20 hover:border-cyan-400/40"
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider text-cyan-200/80 font-bold block font-mono">
                    WEI STORE
                  </span>
                  <span className="text-xs font-black text-white font-mono block">
                    {score.toLocaleString()}
                  </span>
                  <span className="text-[7.5px] font-mono text-cyan-300/80 block mt-0.5">
                    Mining Tap
                  </span>
                </div>

                <div
                  onClick={() => {
                    setCurrency("USD");
                    try {
                      tgApp?.HapticFeedback?.selectionChanged?.();
                    } catch {}
                  }}
                  className={`p-1.5 rounded-xl border cursor-pointer active:scale-95 transition-all ${
                    currency === "USD"
                      ? "bg-emerald-500/25 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
                      : "bg-black/25 border-emerald-400/20 hover:border-emerald-400/40"
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider text-emerald-200/80 font-bold block font-mono">
                    USD STORE
                  </span>
                  <span className="text-xs font-black text-emerald-300 font-mono block">
                    ${(usdBalance !== undefined ? usdBalance : 0).toFixed(2)}
                  </span>
                  <span className="text-[7.5px] font-mono text-emerald-300/80 block mt-0.5">
                    Fiat Vault
                  </span>
                </div>

                <div
                  onClick={() => {
                    setCurrency("KHR");
                    try {
                      tgApp?.HapticFeedback?.selectionChanged?.();
                    } catch {}
                  }}
                  className={`p-1.5 rounded-xl border cursor-pointer active:scale-95 transition-all ${
                    currency === "KHR"
                      ? "bg-purple-500/25 border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.35)]"
                      : "bg-black/25 border-purple-400/20 hover:border-purple-400/40"
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider text-purple-200/80 font-bold block font-mono">
                    KHR STORE
                  </span>
                  <span className="text-xs font-black text-purple-300 font-mono block">
                    {Math.floor(khrBalance !== undefined ? khrBalance : 0).toLocaleString()} ៛
                  </span>
                  <span className="text-[7.5px] font-mono text-purple-300/80 block mt-0.5">
                    Bakong Grant
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BanknoteCreditCards.displayName = "BanknoteCreditCards";
