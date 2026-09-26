"use client";

import React from "react";
import { Gem, Zap, Coins, Crown, Flame, ShieldCheck } from "lucide-react";

export const AsymmetricGemBanner: React.FC = () => {
  return (
    <div className="w-full space-y-3.5 select-none my-2.5">
      {/* ============================================================== */}
      {/* CARD 1: EMERALD TEAL - GEM                                     */}
      {/* ============================================================== */}
      <div className="group relative w-full overflow-visible cursor-pointer">
        <div className="relative w-full rounded-[12px] overflow-hidden bg-gradient-to-r from-[#0c383d] via-[#104a50] to-[#176269] border-2 border-white/20 shadow-md shadow-teal-950/20 p-5 sm:p-6 text-white flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:shadow-teal-950/30 hover:border-white/30 active:scale-[0.99]">
          {/* Ambient Breathing Glow */}
          <div className="absolute top-0 right-16 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none animate-gem-glow" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#0c383d]/50 pointer-events-none" />

          {/* Dynamic Light Sweep Shimmer on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* Left Content */}
          <div className="relative z-10 flex-1 pr-16 sm:pr-24 space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight group-hover:text-teal-200 transition-colors duration-200">
              Boost Mining Power
            </h3>
            <p className="text-xs text-teal-100/80 leading-relaxed line-clamp-2">
              Claim daily crystalline points to accelerate passive yield and tier rank.
            </p>
          </div>

          {/* Floating 3D Framework Icon Badge */}
          <div className="absolute -top-3 sm:-top-4 right-3 sm:right-5 z-20 pointer-events-none animate-gem-float" style={{ animationDelay: "0s" }}>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-400/25 rounded-full blur-lg animate-gem-glow" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-300/35 via-teal-500/25 to-emerald-950/75 border-2 border-emerald-300/40 backdrop-blur-xl shadow-lg shadow-teal-950/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Gem size={32} className="text-emerald-300 filter drop-shadow-[0_2px_8px_rgba(52,211,153,0.6)] transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CARD 2: ROYAL VIOLET - ZAP                                     */}
      {/* ============================================================== */}
      <div className="group relative w-full overflow-visible cursor-pointer">
        <div className="relative w-full rounded-[12px] overflow-hidden bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#3b0764] border-2 border-white/20 shadow-md shadow-purple-950/20 p-5 sm:p-6 text-white flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/30 hover:border-white/30 active:scale-[0.99]">
          {/* Ambient Breathing Glow */}
          <div className="absolute top-0 right-16 w-36 h-36 bg-purple-400/25 rounded-full blur-2xl pointer-events-none animate-gem-glow" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-fuchsia-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#1e1b4b]/50 pointer-events-none" />

          {/* Dynamic Light Sweep Shimmer on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* Left Content */}
          <div className="relative z-10 flex-1 pr-16 sm:pr-24 space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight group-hover:text-purple-200 transition-colors duration-200">
              2.5x Points Compounding
            </h3>
            <p className="text-xs text-purple-100/80 leading-relaxed line-clamp-2">
              Multiply your hourly score compounding across all simulated balances.
            </p>
          </div>

          {/* Floating 3D Framework Icon Badge */}
          <div className="absolute -top-3 sm:-top-4 right-3 sm:right-5 z-20 pointer-events-none animate-gem-float" style={{ animationDelay: "0.6s" }}>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-lg animate-gem-glow" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-300/35 via-violet-500/25 to-purple-950/75 border-2 border-purple-300/40 backdrop-blur-xl shadow-lg shadow-purple-950/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Zap size={32} className="text-purple-300 filter drop-shadow-[0_2px_8px_rgba(192,132,252,0.6)] transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CARD 3: AMBER GOLD - COINS                                     */}
      {/* ============================================================== */}
      <div className="group relative w-full overflow-visible cursor-pointer">
        <div className="relative w-full rounded-[12px] overflow-hidden bg-gradient-to-r from-[#451a03] via-[#78350f] to-[#92400e] border-2 border-white/20 shadow-md shadow-amber-950/20 p-5 sm:p-6 text-white flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/30 hover:border-white/30 active:scale-[0.99]">
          {/* Ambient Breathing Glow */}
          <div className="absolute top-0 right-16 w-36 h-36 bg-amber-400/25 rounded-full blur-2xl pointer-events-none animate-gem-glow" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#451a03]/50 pointer-events-none" />

          {/* Dynamic Light Sweep Shimmer on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* Left Content */}
          <div className="relative z-10 flex-1 pr-16 sm:pr-24 space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight group-hover:text-amber-200 transition-colors duration-200">
              Instant Liquidity Access
            </h3>
            <p className="text-xs text-amber-100/80 leading-relaxed line-clamp-2">
              Swap simulated USD and Cambodian Khmer Riel with guaranteed 0% slippage.
            </p>
          </div>

          {/* Floating 3D Framework Icon Badge */}
          <div className="absolute -top-3 sm:-top-4 right-3 sm:right-5 z-20 pointer-events-none animate-gem-float" style={{ animationDelay: "1.2s" }}>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-lg animate-gem-glow" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-300/35 via-yellow-500/25 to-amber-950/75 border-2 border-amber-300/40 backdrop-blur-xl shadow-lg shadow-amber-950/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Coins size={32} className="text-amber-300 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)] transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CARD 4: SAPPHIRE BLUE - CROWN                                  */}
      {/* ============================================================== */}
      <div className="group relative w-full overflow-visible cursor-pointer">
        <div className="relative w-full rounded-[12px] overflow-hidden bg-gradient-to-r from-[#0f2942] via-[#1e3a8a] to-[#1d4ed8] border-2 border-white/20 shadow-md shadow-blue-950/20 p-5 sm:p-6 text-white flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/30 hover:border-white/30 active:scale-[0.99]">
          {/* Ambient Breathing Glow */}
          <div className="absolute top-0 right-16 w-36 h-36 bg-blue-400/25 rounded-full blur-2xl pointer-events-none animate-gem-glow" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#0f2942]/50 pointer-events-none" />

          {/* Dynamic Light Sweep Shimmer on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* Left Content */}
          <div className="relative z-10 flex-1 pr-16 sm:pr-24 space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight group-hover:text-blue-200 transition-colors duration-200">
              Automated Yield Staking
            </h3>
            <p className="text-xs text-blue-100/80 leading-relaxed line-clamp-2">
              Lock simulated reserves to earn passive hourly staking rewards automatically.
            </p>
          </div>

          {/* Floating 3D Framework Icon Badge */}
          <div className="absolute -top-3 sm:-top-4 right-3 sm:right-5 z-20 pointer-events-none animate-gem-float" style={{ animationDelay: "1.8s" }}>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-lg animate-gem-glow" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-300/35 via-sky-500/25 to-blue-950/75 border-2 border-blue-300/40 backdrop-blur-xl shadow-lg shadow-blue-950/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Crown size={32} className="text-blue-300 filter drop-shadow-[0_2px_8px_rgba(96,165,250,0.6)] transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CARD 5: RUBY CRIMSON - FLAME                                   */}
      {/* ============================================================== */}
      <div className="group relative w-full overflow-visible cursor-pointer">
        <div className="relative w-full rounded-[12px] overflow-hidden bg-gradient-to-r from-[#450a0a] via-[#7f1d1d] to-[#991b1b] border-2 border-white/20 shadow-md shadow-red-950/20 p-5 sm:p-6 text-white flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:shadow-red-950/30 hover:border-white/30 active:scale-[0.99]">
          {/* Ambient Breathing Glow */}
          <div className="absolute top-0 right-16 w-36 h-36 bg-rose-400/25 rounded-full blur-2xl pointer-events-none animate-gem-glow" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#450a0a]/50 pointer-events-none" />

          {/* Dynamic Light Sweep Shimmer on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* Left Content */}
          <div className="relative z-10 flex-1 pr-16 sm:pr-24 space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight group-hover:text-rose-200 transition-colors duration-200">
              Exclusive VIP Perks
            </h3>
            <p className="text-xs text-rose-100/80 leading-relaxed line-clamp-2">
              Unlock high-roller transaction limits and zero network execution delay.
            </p>
          </div>

          {/* Floating 3D Framework Icon Badge */}
          <div className="absolute -top-3 sm:-top-4 right-3 sm:right-5 z-20 pointer-events-none animate-gem-float" style={{ animationDelay: "2.4s" }}>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-lg animate-gem-glow" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-rose-300/35 via-red-500/25 to-rose-950/75 border-2 border-rose-300/40 backdrop-blur-xl shadow-lg shadow-rose-950/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Flame size={32} className="text-rose-300 filter drop-shadow-[0_2px_8px_rgba(251,113,133,0.6)] transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CARD 6: CYAN TEAL - SHIELDCHECK                                */}
      {/* ============================================================== */}
      <div className="group relative w-full overflow-visible cursor-pointer">
        <div className="relative w-full rounded-[12px] overflow-hidden bg-gradient-to-r from-[#083344] via-[#0e7490] to-[#0284c7] border-2 border-white/20 shadow-md shadow-cyan-950/20 p-5 sm:p-6 text-white flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/30 hover:border-white/30 active:scale-[0.99]">
          {/* Ambient Breathing Glow */}
          <div className="absolute top-0 right-16 w-36 h-36 bg-cyan-400/25 rounded-full blur-2xl pointer-events-none animate-gem-glow" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#083344]/50 pointer-events-none" />

          {/* Dynamic Light Sweep Shimmer on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* Left Content */}
          <div className="relative z-10 flex-1 pr-16 sm:pr-24 space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight group-hover:text-cyan-200 transition-colors duration-200">
              Quantum Security Shield
            </h3>
            <p className="text-xs text-cyan-100/80 leading-relaxed line-clamp-2">
              Hardware-grade end-to-end encrypted validation for all simulated transactions.
            </p>
          </div>

          {/* Floating 3D Framework Icon Badge */}
          <div className="absolute -top-3 sm:-top-4 right-3 sm:right-5 z-20 pointer-events-none animate-gem-float" style={{ animationDelay: "3.0s" }}>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-lg animate-gem-glow" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-300/35 via-teal-500/25 to-cyan-950/75 border-2 border-cyan-300/40 backdrop-blur-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <ShieldCheck size={32} className="text-cyan-300 filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.6)] transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
