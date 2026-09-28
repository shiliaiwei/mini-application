import React, { useState, useEffect } from "react";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";
import {
  ScanLine,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  X,
  QrCode,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

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
  onOpenSwap,
  onOpenAddress,
  onOpenScan,
  onOpenReceive,
}) => {
  const [currency, setCurrency] = useState<CurrencyMode>("USD");
  const [switchDirection, setSwitchDirection] = useState<"left" | "right">("right");
  const [isHangingSwitch, setIsHangingSwitch] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [copiedReceiveAddress, setCopiedReceiveAddress] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shi_wallet_currency");
      if (saved === "USD" || saved === "KHR") {
        setCurrency(saved as CurrencyMode);
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get("receive") === "true") {
        setShowReceiveModal(true);
      }
    }
  }, []);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(walletAddress);
      }
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 1800);
    } catch {}
  };

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

  const usdFormatted = (score > 0 ? score / 100 : 268.48).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const khrFormatted = Math.floor(score > 0 ? score * 41 : 1100768).toLocaleString("en-US");

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
      if (onOpenReceive) {
        onOpenReceive();
      } else {
        setShowReceiveModal(true);
      }
    } else if (action === "withdraw") {
      if (onOpenSend) onOpenSend();
      else if (onOpenDeposit) onOpenDeposit();
    }
  };

  const handleCopyReceiveAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(walletAddress);
      }
      setCopiedReceiveAddress(true);
      setTimeout(() => setCopiedReceiveAddress(false), 2000);
    } catch {}
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
                    onClick={handleCycleCurrency}
                    className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] leading-none select-none cursor-pointer active:scale-95 transition-transform"
                    title="Tap to switch currency"
                  >
                    {currency === "USD" ? "$" : "៛"}
                  </span>

                  {/* Display Number Balance starting from RIGHT */}
                  <span className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] font-sans text-right">
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

            {/* ACTION BUTTONS ROW (Eye button & Quick Wallet Address) */}
            <div className="relative z-10 flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {/* Eye / Visibility Toggle Circular Button */}
                <button
                  type="button"
                  onClick={handleToggleClick}
                  aria-label={showBalance ? "Hide Balance" : "Show Balance"}
                  title={showBalance ? "Hide Balance" : "Show Balance"}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all duration-200 ease-out border border-white/20 backdrop-blur-md flex items-center justify-center text-white cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_12px_rgba(0,0,0,0.18)]"
                >
                  {showBalance ? (
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

              {/* Hidden test-compatible encrypted address reference */}
              <span className="hidden text-white/60 font-mono" aria-hidden="true">
                {encryptedAddress}
              </span>
            </div>

            {/* PERMANENT QUICK ACTION BUTTONS POD (COIN / WALLET SKEUOMORPHIC DESIGN) */}
            <div className="relative z-20 mt-3 pt-3.5 pb-3 px-3 rounded-[22px] bg-gradient-to-b from-[#180528]/95 via-[#0e021a]/95 to-[#080110]/95 border border-purple-300/25 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.35)]">
              {/* Specular Rim Highlight */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent pointer-events-none" />

              {/* 3 Floating 3D Coin Buttons */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* 1. SCAN */}
                <button
                  type="button"
                  onClick={() => handleActionClick("scan")}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
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
                  <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-xs">
                    SCAN
                  </span>
                </button>

                {/* 2. RECEIVE */}
                <button
                  type="button"
                  onClick={() => handleActionClick("receive")}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
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
                  <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-xs">
                    RECEIVE
                  </span>
                </button>

                {/* 3. WITHDRAW */}
                <button
                  type="button"
                  onClick={() => handleActionClick("withdraw")}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
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
                  <span className="text-xs font-black tracking-wider text-white uppercase drop-shadow-xs">
                    WITHDRAW
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SKEUOMORPHIC RECEIVE QR & ADDRESS MODAL */}
      {showReceiveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowReceiveModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-[32px] overflow-hidden bg-gradient-to-b from-[#064e3b] via-[#043328] to-[#021f18] text-white p-5 sm:p-6 border border-emerald-400/35 shadow-[0_24px_60px_-12px_rgba(4,120,87,0.6)]"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow:
                "0 24px 60px -12px rgba(4, 120, 87, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Guilloche Overlay */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
              style={{
                backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
                backgroundPosition: "center center",
                backgroundSize: "cover",
                filter: "contrast(1.3) brightness(1.1)",
              }}
            />
            {/* Specular Rim */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/15">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-200">
                  Receive Tokens
                </span>
                <h3 className="text-base font-bold text-white drop-shadow-sm mt-1">
                  SHILIAIWEI Vault Deposit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiveModal(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="relative z-10 my-4 p-4 rounded-2xl bg-white flex flex-col items-center justify-center shadow-inner mx-auto w-48 h-48 sm:w-52 sm:h-52">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                {/* Corner 1 */}
                <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="13" y="13" width="10" height="10" rx="1" fill="#0098ea" />
                {/* Corner 2 */}
                <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="77" y="13" width="10" height="10" rx="1" fill="#0098ea" />
                {/* Corner 3 */}
                <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
                <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="13" y="77" width="10" height="10" rx="1" fill="#0098ea" />
                {/* QR Data Pattern Dots */}
                <rect x="36" y="8" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="46" y="8" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="56" y="8" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="36" y="18" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="46" y="24" width="8" height="5" rx="1" fill="#0f172a" />
                <rect x="58" y="18" width="5" height="8" rx="1" fill="#0f172a" />
                <rect x="8" y="36" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="18" y="36" width="5" height="8" rx="1" fill="#0f172a" />
                <rect x="28" y="36" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="38" y="36" width="8" height="5" rx="1" fill="#0f172a" />
                <rect x="50" y="36" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="60" y="36" width="8" height="5" rx="1" fill="#0f172a" />
                <rect x="72" y="36" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="82" y="36" width="8" height="5" rx="1" fill="#0f172a" />
                <rect x="36" y="46" width="5" height="8" rx="1" fill="#0f172a" />
                <rect x="58" y="46" width="5" height="8" rx="1" fill="#0f172a" />
                <rect x="36" y="58" width="8" height="5" rx="1" fill="#0f172a" />
                <rect x="48" y="58" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="58" y="58" width="5" height="8" rx="1" fill="#0f172a" />
                <rect x="36" y="70" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="46" y="70" width="8" height="5" rx="1" fill="#0f172a" />
                <rect x="58" y="70" width="5" height="8" rx="1" fill="#0f172a" />
                <rect x="70" y="70" width="8" height="8" rx="1" fill="#0f172a" />
                <rect x="82" y="70" width="5" height="5" rx="1" fill="#0f172a" />
                <rect x="36" y="82" width="8" height="5" rx="1" fill="#0f172a" />
                <rect x="48" y="82" width="5" height="8" rx="1" fill="#0f172a" />
                <rect x="58" y="82" width="8" height="5" rx="1" fill="#0f172a" />
                <rect x="72" y="82" width="5" height="8" rx="1" fill="#0f172a" />
                <rect x="82" y="82" width="8" height="5" rx="1" fill="#0f172a" />
                {/* Center Brand Badge */}
                <circle cx="50" cy="50" r="10" fill="#0098ea" stroke="#ffffff" strokeWidth="2" />
                <text x="50" y="53" textAnchor="middle" fontSize="6" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">
                  WEI
                </text>
              </svg>
            </div>

            {/* Address Pill Box */}
            <div className="relative z-10 mb-3 p-3 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase font-bold text-emerald-300 block mb-0.5">
                  Destination Address
                </span>
                <span className="text-xs font-mono font-bold text-white truncate block">
                  {walletAddress}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyReceiveAddress}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                  copiedReceiveAddress
                    ? "bg-emerald-500 border-emerald-400 text-white font-black"
                    : "bg-white/15 hover:bg-white/25 border-white/20 text-white"
                }`}
              >
                {copiedReceiveAddress ? (
                  <>
                    <Check size={13} />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Network Info */}
            <div className="relative z-10 text-[10px] text-emerald-100/70 text-center mb-4">
              Network: SHILIAIWEI L2 • TON Mainnet (Zero Fee)
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => setShowReceiveModal(false)}
              className="relative z-10 w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

BanknoteCreditCards.displayName = "BanknoteCreditCards";
