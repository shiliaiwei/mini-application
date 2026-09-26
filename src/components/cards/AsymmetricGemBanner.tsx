"use client";

import React from "react";
import { Sparkles, Zap, ShieldCheck } from "@/components/icons/KeylineIcons";

export const AsymmetricGemBanner: React.FC = () => {
  return (
    <div className="w-full space-y-3.5 select-none my-2.5">
      {/* ============================================================== */}
      {/* CARD 1: EMERALD TEAL - 3D FACETED DIAMOND                      */}
      {/* ============================================================== */}
      <div className="relative w-full overflow-visible">
        <div className="relative w-full rounded-[28px] overflow-hidden bg-gradient-to-r from-[#0c383d] via-[#104a50] to-[#176269] border-2 border-white/20 shadow-md shadow-teal-950/20 p-5 sm:p-6 text-white flex items-center justify-between">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-16 w-36 h-36 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Decorative Concave Cutout Mask in background (Clean, no extra border) */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#0c383d]/50 pointer-events-none" />

          {/* Wide Left Body Section */}
          <div className="relative z-10 flex-1 pr-16 sm:pr-24 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-teal-200">
              <Sparkles size={11} className="text-teal-300" />
              <span>Daily Gem Drop</span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
              Boost Mining Power
            </h3>
            <p className="text-xs text-teal-100/80 leading-relaxed line-clamp-2">
              Claim daily crystalline points to accelerate passive yield and tier rank.
            </p>
          </div>

          {/* 3D ICON 1: FACETED DIAMOND GEM */}
          <div className="absolute -top-5 right-2 sm:right-4 z-20 pointer-events-none">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
              <svg viewBox="0 0 100 100" className="w-full h-full transform hover:scale-105 transition-transform duration-300">
                <defs>
                  <linearGradient id="emTop" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a7f3d0" />
                    <stop offset="50%" stopColor="#5eead4" />
                    <stop offset="100%" stopColor="#2dd4bf" />
                  </linearGradient>
                  <linearGradient id="emCenter" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="emLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6ee7b7" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="emRight" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#047857" />
                    <stop offset="100%" stopColor="#064e3b" />
                  </linearGradient>
                  <linearGradient id="emBottom" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#022c22" />
                  </linearGradient>
                </defs>
                <polygon points="32,20 68,20 78,38 22,38" fill="url(#emTop)" stroke="#d1fae5" strokeWidth="0.75" />
                <polygon points="32,20 22,38 12,38" fill="url(#emLeft)" stroke="#a7f3d0" strokeWidth="0.5" />
                <polygon points="68,20 88,38 78,38" fill="url(#emRight)" stroke="#6ee7b7" strokeWidth="0.5" />
                <polygon points="22,38 78,38 50,88" fill="url(#emCenter)" stroke="#6ee7b7" strokeWidth="0.75" />
                <polygon points="12,38 22,38 50,88" fill="url(#emLeft)" stroke="#34d399" strokeWidth="0.5" />
                <polygon points="78,38 88,38 50,88" fill="url(#emRight)" stroke="#047857" strokeWidth="0.5" />
                <polygon points="35,22 65,22 60,26 40,26" fill="#ffffff" opacity="0.8" />
                <circle cx="68" cy="22" r="2" fill="#ffffff" />
                <path d="M68 18 L68 26 M64 22 L72 22" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CARD 2: ROYAL VIOLET - 3D 8-POINT CRYSTAL STAR                  */}
      {/* ============================================================== */}
      <div className="relative w-full overflow-visible">
        <div className="relative w-full rounded-[28px] overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#3b0764] border-2 border-white/20 shadow-md shadow-purple-950/20 p-5 sm:p-6 text-white flex items-center justify-between">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-16 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-fuchsia-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Decorative Concave Cutout Mask in background (Clean, no extra border) */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#1e1b4b]/50 pointer-events-none" />

          {/* Wide Left Body Section */}
          <div className="relative z-10 flex-1 pr-16 sm:pr-24 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-purple-200">
              <Zap size={11} className="text-purple-300" />
              <span>Prestige Multiplier</span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
              2.5x Points Compounding
            </h3>
            <p className="text-xs text-purple-100/80 leading-relaxed line-clamp-2">
              Multiply your hourly score compounding across all simulated balances.
            </p>
          </div>

          {/* 3D ICON 2: 3D CRYSTAL STAR */}
          <div className="absolute -top-5 right-2 sm:right-4 z-20 pointer-events-none">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.55)]">
              <div className="absolute inset-0 bg-purple-400/25 rounded-full blur-xl animate-pulse" />
              <svg viewBox="0 0 100 100" className="w-full h-full transform hover:scale-105 transition-transform duration-300">
                <defs>
                  <linearGradient id="starLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f3e8ff" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                  <linearGradient id="starMid" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#7e22ce" />
                  </linearGradient>
                  <linearGradient id="starDark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6b21a8" />
                    <stop offset="100%" stopColor="#3b0764" />
                  </linearGradient>
                  <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e9d5ff" />
                  </linearGradient>
                </defs>

                {/* 4 Diagonal Diamond Points */}
                <polygon points="50,50 68,32 50,42" fill="url(#starLight)" opacity="0.8" />
                <polygon points="50,50 68,32 58,50" fill="url(#starMid)" opacity="0.8" />
                <polygon points="50,50 68,68 58,50" fill="url(#starMid)" opacity="0.8" />
                <polygon points="50,50 68,68 50,58" fill="url(#starDark)" opacity="0.8" />
                <polygon points="50,50 32,68 50,58" fill="url(#starDark)" opacity="0.8" />
                <polygon points="50,50 32,68 42,50" fill="url(#starMid)" opacity="0.8" />
                <polygon points="50,50 32,32 42,50" fill="url(#starMid)" opacity="0.8" />
                <polygon points="50,50 32,32 50,42" fill="url(#starLight)" opacity="0.8" />

                {/* 4 Primary Major Beveled Rays */}
                {/* Top Point */}
                <polygon points="50,12 50,50 40,42" fill="url(#starLight)" stroke="#f3e8ff" strokeWidth="0.5" />
                <polygon points="50,12 50,50 60,42" fill="url(#starMid)" stroke="#d8b4fe" strokeWidth="0.5" />

                {/* Right Point */}
                <polygon points="88,50 50,50 58,40" fill="url(#starLight)" stroke="#d8b4fe" strokeWidth="0.5" />
                <polygon points="88,50 50,50 58,60" fill="url(#starDark)" stroke="#9333ea" strokeWidth="0.5" />

                {/* Bottom Point */}
                <polygon points="50,88 50,50 58,60" fill="url(#starDark)" stroke="#6b21a8" strokeWidth="0.5" />
                <polygon points="50,88 50,50 42,60" fill="url(#starMid)" stroke="#7e22ce" strokeWidth="0.5" />

                {/* Left Point */}
                <polygon points="12,50 50,50 42,40" fill="url(#starLight)" stroke="#e9d5ff" strokeWidth="0.5" />
                <polygon points="12,50 50,50 42,60" fill="url(#starMid)" stroke="#a855f7" strokeWidth="0.5" />

                {/* Center 3D Faceted Diamond Core */}
                <polygon points="50,38 62,50 50,62 38,50" fill="url(#coreGlow)" stroke="#ffffff" strokeWidth="0.75" />
                <polygon points="50,42 58,50 50,58 42,50" fill="#ffffff" opacity="0.9" />

                {/* Sparkle Glint */}
                <circle cx="50" cy="50" r="2.5" fill="#ffffff" />
                <path d="M50 36 L50 64 M36 50 L64 50" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CARD 3: AMBER GOLD - 3D BEVELED VAULT MEDALLION COIN           */}
      {/* ============================================================== */}
      <div className="relative w-full overflow-visible">
        <div className="relative w-full rounded-[28px] overflow-hidden bg-gradient-to-r from-[#451a03] via-[#78350f] to-[#92400e] border-2 border-white/20 shadow-md shadow-amber-950/20 p-5 sm:p-6 text-white flex items-center justify-between">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Decorative Concave Cutout Mask in background (Clean, no extra border) */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#451a03]/50 pointer-events-none" />

          {/* Wide Left Body Section */}
          <div className="relative z-10 flex-1 pr-16 sm:pr-24 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-amber-200">
              <ShieldCheck size={11} className="text-amber-300" />
              <span>Zero-Fee Exchange</span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
              Instant Liquidity Access
            </h3>
            <p className="text-xs text-amber-100/80 leading-relaxed line-clamp-2">
              Swap simulated USD and Cambodian Khmer Riel with guaranteed 0% slippage.
            </p>
          </div>

          {/* 3D ICON 3: 3D BEVELED VAULT COIN / MEDALLION */}
          <div className="absolute -top-5 right-2 sm:right-4 z-20 pointer-events-none">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.55)]">
              <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-xl animate-pulse" />
              <svg viewBox="0 0 100 100" className="w-full h-full transform hover:scale-105 transition-transform duration-300">
                <defs>
                  <linearGradient id="coinRim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="30%" stopColor="#facc15" />
                    <stop offset="70%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                  <linearGradient id="coinFace" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>
                  <linearGradient id="shieldLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#fde047" />
                  </linearGradient>
                  <linearGradient id="shieldDark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>

                {/* 3D Coin Outer Rim */}
                <circle cx="50" cy="50" r="38" fill="url(#coinRim)" stroke="#fef9c3" strokeWidth="1" />
                
                {/* 3D Coin Rim Groove */}
                <circle cx="50" cy="50" r="33" fill="none" stroke="#78350f" strokeWidth="1.2" opacity="0.6" />

                {/* 3D Coin Inner Face */}
                <circle cx="50" cy="50" r="31" fill="url(#coinFace)" stroke="#fde047" strokeWidth="0.75" />

                {/* Embossed 3D Vault Shield in Center */}
                {/* Left Shield Half (Light Bevel) */}
                <path
                  d="M50 28 L36 34 V50 C36 60 50 68 50 68 Z"
                  fill="url(#shieldLight)"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                />

                {/* Right Shield Half (Shadow Bevel) */}
                <path
                  d="M50 28 L64 34 V50 C64 60 50 68 50 68 Z"
                  fill="url(#shieldDark)"
                  stroke="#f59e0b"
                  strokeWidth="0.5"
                />

                {/* Inner Shield Star Symbol */}
                <polygon
                  points="50,38 52.5,45 60,45 54,49.5 56.5,56.5 50,52 43.5,56.5 46,49.5 40,45 47.5,45"
                  fill="#ffffff"
                  opacity="0.9"
                />

                {/* Top Specular Rim Reflection */}
                <path
                  d="M26 30 A34 34 0 0 1 74 30"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.75"
                />

                {/* Sparkle Glint */}
                <circle cx="70" cy="28" r="2" fill="#ffffff" />
                <path d="M70 23 L70 33 M65 28 L75 28" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
