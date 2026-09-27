"use client";

import React, { useState } from "react";
import {
  Send,
  CircleAlert,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  ArrowUpRight,
} from "@/components/icons/KeylineIcons";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { BrandFooter } from "@/components/brand/BrandFooter";

interface TelegramGateScreenProps {
  onBypass?: () => void;
  isDev?: boolean;
}

export const TelegramGateScreen: React.FC<TelegramGateScreenProps> = ({
  onBypass,
  isDev = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const botUrl = "https://t.me/srievibot";
  const botDeepLink = "tg://resolve?domain=srievibot";

  const handleCopyLink = () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(botUrl);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleOpenTelegram = () => {
    if (typeof window !== "undefined") {
      // Attempt deep link first for native app launch, fallback to web
      window.location.href = botDeepLink;
      setTimeout(() => {
        window.open(botUrl, "_blank", "noopener,noreferrer");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-white text-slate-900 max-w-lg mx-auto w-full select-none font-body relative overflow-x-hidden">
      {/* App Background */}
      <div className="absolute inset-0 bg-app-background opacity-[0.06] pointer-events-none z-0" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[#0098ea] font-black uppercase tracking-wider text-xs font-display">
              @srievibot
            </span>
          </div>
          <span className="text-[10px] bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-bold uppercase tracking-wider">
            Web Port Restricted
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="my-auto py-6 space-y-4 relative z-10">
        {/* 3D Skeuomorphic Telegram Guard Pocket */}
        <div
          className="relative rounded-[28px] p-5 overflow-hidden bg-gradient-to-b from-[#0077b5] via-[#005f94] to-[#004770] text-white"
          style={{
            boxShadow:
              "0 16px 36px -10px rgba(0, 71, 112, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 6px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Leather Grain Texture */}
          <div
            className="absolute inset-0 rounded-[28px] opacity-15 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(0,0,0,0.5) 1px, transparent 1px)`,
              backgroundSize: "6px 6px, 8px 8px",
            }}
          />

          {/* Perimeter Thread Stitching */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="7"
              y="7"
              width="calc(100% - 14px)"
              height="calc(100% - 14px)"
              rx="21"
              ry="21"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              opacity="0.5"
              style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
            />
          </svg>

          {/* Guilloche Banknote Pattern */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
            style={{
              backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              filter: "contrast(1.35) brightness(1.1)",
            }}
          />

          {/* Specular Top Rim */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <div className="relative z-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck size={32} className="text-white drop-shadow-sm" />
            </div>

            <div>
              <span className="text-[10px] text-sky-200 uppercase font-black tracking-widest block font-sans">
                TELEGRAM WEBAPP PROTOCOL
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display mt-0.5">
                Telegram Bot Access Only
              </h1>
            </div>

            <p className="text-xs text-sky-100/90 leading-relaxed max-w-xs mx-auto font-sans">
              This application is an encrypted Web3 Mini App built exclusively for Telegram. Direct web browser access is restricted.
            </p>
          </div>
        </div>

        {/* Diagnostics & Security Card */}
        <div className="p-4 rounded-[28px] liquid-glass border border-slate-200 text-xs text-slate-700 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold font-display">
              <CircleAlert size={15} className="text-[#0098ea]" />
              <span>CONNECTION TELEMETRY</span>
            </div>
            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Browser Port Closed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-medium block">Client Type</span>
              <span className="font-bold text-slate-800">External Web Browser</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-medium block">Required Client</span>
              <span className="font-bold text-[#0077b5]">Telegram Bot</span>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] leading-relaxed">
            <span className="text-[10px] text-slate-500 font-medium block">Access Instructions</span>
            <span className="text-slate-700">
              Launch via <strong className="text-slate-900">@srievibot</strong> on Telegram to sync your encrypted wallet, mint WEI Coin, and access the leaderboard.
            </span>
          </div>
        </div>

        {/* Interactive QR Code Section for Desktop Visitors */}
        <div className="p-4 rounded-[28px] liquid-glass border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode size={16} className="text-[#0098ea]" />
              <span className="text-xs font-bold text-slate-900 font-display">
                Scan with Mobile Camera
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowQrCode(!showQrCode)}
              className="text-[11px] font-bold text-[#0077b5] hover:underline cursor-pointer"
            >
              {showQrCode ? "Collapse QR" : "Show QR Code"}
            </button>
          </div>

          {showQrCode && (
            <div className="pt-2 flex flex-col items-center space-y-2">
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm inline-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="w-36 h-36 mx-auto"
                >
                  <rect width="100" height="100" fill="#ffffff" />
                  {/* Top-Left Finder */}
                  <rect x="10" y="10" width="24" height="24" rx="4" fill="#0f172a" />
                  <rect x="14" y="14" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="18" y="18" width="8" height="8" rx="1" fill="#0098ea" />
                  {/* Top-Right Finder */}
                  <rect x="66" y="10" width="24" height="24" rx="4" fill="#0f172a" />
                  <rect x="70" y="14" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="74" y="18" width="8" height="8" rx="1" fill="#0098ea" />
                  {/* Bottom-Left Finder */}
                  <rect x="10" y="66" width="24" height="24" rx="4" fill="#0f172a" />
                  <rect x="14" y="70" width="16" height="16" rx="2" fill="#ffffff" />
                  <rect x="18" y="74" width="8" height="8" rx="1" fill="#0098ea" />
                  {/* QR Data Matrix simulation */}
                  <rect x="42" y="12" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="52" y="12" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="42" y="24" width="8" height="6" rx="1" fill="#0f172a" />
                  <rect x="54" y="24" width="6" height="8" rx="1" fill="#0f172a" />
                  <rect x="12" y="42" width="6" height="8" rx="1" fill="#0f172a" />
                  <rect x="24" y="42" width="8" height="6" rx="1" fill="#0f172a" />
                  <rect x="36" y="42" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="58" y="42" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="70" y="42" width="8" height="6" rx="1" fill="#0f172a" />
                  <rect x="84" y="42" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="36" y="56" width="8" height="6" rx="1" fill="#0f172a" />
                  <rect x="56" y="56" width="6" height="8" rx="1" fill="#0f172a" />
                  <rect x="70" y="56" width="8" height="6" rx="1" fill="#0f172a" />
                  <rect x="42" y="70" width="8" height="6" rx="1" fill="#0f172a" />
                  <rect x="54" y="70" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="68" y="70" width="6" height="8" rx="1" fill="#0f172a" />
                  <rect x="80" y="70" width="8" height="6" rx="1" fill="#0f172a" />
                  <rect x="42" y="82" width="6" height="8" rx="1" fill="#0f172a" />
                  <rect x="56" y="82" width="8" height="6" rx="1" fill="#0f172a" />
                  <rect x="72" y="82" width="6" height="6" rx="1" fill="#0f172a" />
                  <rect x="82" y="82" width="8" height="6" rx="1" fill="#0f172a" />
                  {/* Center Badge */}
                  <circle cx="50" cy="50" r="10" fill="#0098ea" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x="50"
                    y="53"
                    textAnchor="middle"
                    fontSize="6"
                    fontWeight="900"
                    fill="#ffffff"
                    fontFamily="sans-serif"
                  >
                    WEI
                  </text>
                </svg>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Point your mobile phone camera at this QR code to launch @srievibot.
              </span>
            </div>
          )}
        </div>

        {/* Telegram Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleOpenTelegram}
            className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#0098ea] to-[#0077b5] hover:from-[#0088cc] hover:to-[#00669e] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease-out shadow-md shadow-sky-950/20 active:scale-98 cursor-pointer"
          >
            <Send className="w-4 h-4 text-white" />
            <span>Open in Telegram (@srievibot)</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700 font-bold">Bot Link Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Bot Link (https://t.me/srievibot)</span>
              </>
            )}
          </button>

          {/* Local Production Test Bypass (Strictly visible only when isDev is true on local host) */}
          {onBypass && isDev && (
            <button
              type="button"
              onClick={onBypass}
              className="w-full py-2 px-3 rounded-full bg-white hover:bg-slate-50 border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 text-[11px] font-semibold tracking-wider transition-colors cursor-pointer mt-1"
            >
              Local Production Test: Bypass to Mini App
            </button>
          )}
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="relative z-10 pt-4 pb-2">
        <BrandFooter height={16} />
      </footer>
    </div>
  );
};
