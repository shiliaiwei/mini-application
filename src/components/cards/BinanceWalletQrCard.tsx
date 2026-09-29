"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ArrowDownLeft,
} from "@/components/icons/KeylineIcons";
import { cryptoQrService, CryptoQrResult, formatChunkedAddress } from "@/lib/wallet/cryptoQr";
import { TelegramWebApp } from "@/types/telegram";

interface BinanceWalletQrCardProps {
  address: string;
  currency?: "WEI" | "ETH" | "BTC";
  tgApp?: TelegramWebApp | null;
  onOpenWithdraw?: () => void;
}

export const BinanceWalletQrCard: React.FC<BinanceWalletQrCardProps> = ({
  address,
  currency = "WEI",
  tgApp,
  onOpenWithdraw,
}) => {
  const [qrResult, setQrResult] = useState<CryptoQrResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let mounted = true;
    cryptoQrService
      .generateWalletQr(address, {
        currency,
        width: 260,
        darkColor: "#0b0e11",
        lightColor: "#ffffff",
      })
      .then((res) => {
        if (mounted) {
          setQrResult(res);
        }
      })
      .catch((err) => {
        console.error("Failed to generate wallet QR code:", err);
      });

    return () => {
      mounted = false;
    };
  }, [address, currency]);

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(address);
      }
      tgApp?.HapticFeedback?.notificationOccurred?.("success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSaveImage = () => {
    if (!qrResult?.dataUrl) return;
    setDownloading(true);
    try {
      const a = document.createElement("a");
      a.href = qrResult.dataUrl;
      a.download = `weicoin-vault-${address.slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      tgApp?.HapticFeedback?.notificationOccurred?.("success");
    } catch {}
    setTimeout(() => setDownloading(false), 1500);
  };

  // Chunk address into groups of 4 for Binance-style readability
  const formattedAddress = formatChunkedAddress(address, 4).join(" ") || address;

  return (
    <div className="w-full max-w-md mx-auto space-y-3.5 animate-fadeIn select-none font-sans text-white">
      {/* 1. BINANCE STYLE FRAMELESS DEPOSIT CONTAINER */}
      <div
        className="relative w-full rounded-[32px] overflow-hidden p-5 sm:p-6 border border-[#2b313a] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)]"
        style={{
          background: "linear-gradient(180deg, #181a20 0%, #0e1014 100%)",
        }}
      >
        {/* Subtle Guilloche Banknote Security Overlay */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-15"
          style={{
            backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
            backgroundPosition: "center center",
            backgroundSize: "cover",
          }}
        />

        {/* Binance Yellow Header Accent Band */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#f0b90b] to-transparent pointer-events-none" />

        {/* Header: Asset & Network Selector */}
        <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            {/* Coin Logo */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f0b90b] via-[#fcd535] to-[#f0b90b] p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#181a20] flex items-center justify-center">
                <span className="text-xs font-black text-[#f0b90b] tracking-tighter">
                  WEI
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white tracking-wide">
                  Deposit WEI COIN
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-[#f0b90b] font-bold">
                  L2
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                SHILIAIWEI Web3 Vault
              </span>
            </div>
          </div>

          {/* Network Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-300">
              Zero Gas
            </span>
          </div>
        </div>

        {/* 2. TRENDING FRAMELESS QR CODE BOX WITH EMBEDDED TOKEN LOGO */}
        <div className="relative z-10 my-4 text-center">
          <div className="relative inline-block p-4 rounded-3xl bg-white shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
            {/* 4 Corner Framing Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#f0b90b] rounded-tl-lg pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#f0b90b] rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#f0b90b] rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#f0b90b] rounded-br-lg pointer-events-none" />

            {/* Rendered Vector SVG or Spinner */}
            {qrResult?.svg ? (
              <div
                className="w-48 h-48 sm:w-52 sm:h-52 mx-auto flex items-center justify-center relative overflow-hidden"
                dangerouslySetInnerHTML={{ __html: qrResult.svg }}
              />
            ) : (
              <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Embedded Center Medallion (Binance Standard) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#181a20] border-2 border-white shadow-md flex items-center justify-center pointer-events-none">
              <span className="text-[11px] font-black text-[#f0b90b]">
                W
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Scan with Telegram, Binance, or Web3 Wallet
          </p>
        </div>

        {/* 3. DEPOSIT ADDRESS BAR (CHUNKED & COPYABLE) */}
        <div className="relative z-10 mb-4 p-3.5 rounded-2xl bg-[#0b0e11] border border-white/10 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Deposit Address (អាសយដ្ឋានទទួល)
            </span>
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
              <Zap size={11} />
              <span>Instant Credit</span>
            </div>
          </div>

          <div
            onClick={handleCopy}
            className="font-mono text-xs font-bold text-white break-all tracking-wide cursor-pointer hover:text-amber-300 transition-colors py-1"
          >
            {formattedAddress}
          </div>
        </div>

        {/* 4. ACTION BUTTONS: COPY ADDRESS & SAVE QR */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={handleCopy}
            className={`py-3 rounded-full border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all ${
              copied
                ? "bg-[#10b981] border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                : "bg-[#f0b90b] hover:bg-[#dfaa06] border-amber-300 text-slate-950 shadow-[0_0_16px_rgba(240,185,11,0.4)]"
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Address</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSaveImage}
            disabled={downloading}
            className="py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
          >
            <ArrowDownLeft size={14} />
            <span>{downloading ? "Saving..." : "Save QR Image"}</span>
          </button>
        </div>

        {/* 5. BINANCE DEPOSIT SPECS TABLE */}
        <div className="relative z-10 rounded-2xl bg-white/[0.04] p-3 border border-white/5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Minimum Deposit</span>
            <span className="font-bold text-white">1 WEI COIN</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Expected Arrival</span>
            <span className="font-bold text-emerald-400">1 Confirmation (Instant)</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Contract Standard</span>
            <span className="font-bold text-white font-mono">secp256k1 & Double-Entry</span>
          </div>
        </div>

        {/* 6. BINANCE YELLOW SAFETY WARNING BANNER */}
        <div className="relative z-10 mt-3 p-3 rounded-2xl bg-[#f0b90b]/10 border border-[#f0b90b]/30 flex items-start gap-2">
          <ShieldCheck size={16} className="text-[#f0b90b] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-[#f0b90b]/90 font-medium">
            Send only WEI COIN to this deposit address. Sending any other tokens or transferring via unsupported networks may result in permanent loss.
          </p>
        </div>

        {/* Quick Link to Withdraw */}
        {onOpenWithdraw && (
          <div className="relative z-10 mt-3 text-center">
            <button
              type="button"
              onClick={onOpenWithdraw}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer transition-colors"
            >
              Need to send funds instead? Go to Withdraw
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

BinanceWalletQrCard.displayName = "BinanceWalletQrCard";
