import React from "react";
import { Gem, Zap, Coins, Crown, Flame, ShieldCheck } from "@/components/icons/KeylineIcons";

interface GemCardConfig {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  accentColor: string;
  accentGlow: string;
  icon: React.ReactNode;
  delay: string;
}

const CARDS: GemCardConfig[] = [
  {
    id: "mining",
    title: "Boost Mining Power",
    description: "Claim daily crystalline boosts to accelerate passive yield and tier progress.",
    badgeText: "+ BOOST YIELD",
    accentColor: "#34d399",
    accentGlow: "rgba(52, 211, 153, 0.35)",
    icon: <Gem size={26} className="text-emerald-300 filter drop-shadow-[0_2px_8px_rgba(52,211,153,0.7)]" />,
    delay: "0s",
  },
  {
    id: "compounding",
    title: "2.5x WEI Coin Compounding",
    description: "Multiply your hourly WEI Coin compounding across all simulated balances.",
    badgeText: "+ ACTIVATE 2.5X",
    accentColor: "#c084fc",
    accentGlow: "rgba(192, 132, 252, 0.35)",
    icon: <Zap size={26} className="text-purple-300 filter drop-shadow-[0_2px_8px_rgba(192,132,252,0.7)]" />,
    delay: "0.4s",
  },
  {
    id: "liquidity",
    title: "Instant Liquidity Access",
    description: "Swap simulated USD and Cambodian Khmer Riel with guaranteed 0% slippage.",
    badgeText: "+ SWAP NOW",
    accentColor: "#fbbf24",
    accentGlow: "rgba(251, 191, 36, 0.35)",
    icon: <Coins size={26} className="text-amber-300 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.7)]" />,
    delay: "0.8s",
  },
  {
    id: "staking",
    title: "Automated Yield Staking",
    description: "Lock simulated reserves to earn passive hourly staking rewards automatically.",
    badgeText: "+ AUTO STAKE",
    accentColor: "#60a5fa",
    accentGlow: "rgba(96, 165, 250, 0.35)",
    icon: <Crown size={26} className="text-blue-300 filter drop-shadow-[0_2px_8px_rgba(96,165,250,0.7)]" />,
    delay: "1.2s",
  },
  {
    id: "vip",
    title: "Exclusive VIP Perks",
    description: "Unlock high-roller transaction limits and zero network execution delay.",
    badgeText: "+ VIP ACCESS",
    accentColor: "#fb7185",
    accentGlow: "rgba(251, 113, 133, 0.35)",
    icon: <Flame size={26} className="text-rose-300 filter drop-shadow-[0_2px_8px_rgba(251,113,133,0.7)]" />,
    delay: "1.6s",
  },
  {
    id: "security",
    title: "Quantum Security Shield",
    description: "Hardware-grade end-to-end encrypted validation for all simulated transactions.",
    badgeText: "+ VERIFIED",
    accentColor: "#22d3ee",
    accentGlow: "rgba(34, 211, 238, 0.35)",
    icon: <ShieldCheck size={26} className="text-cyan-300 filter drop-shadow-[0_2px_8px_rgba(34,211,238,0.7)]" />,
    delay: "2.0s",
  },
];

export const AsymmetricGemBanner: React.FC = React.memo(() => {
  return (
    <div className="w-full space-y-3.5 select-none my-2.5">
      {CARDS.map((card) => (
        <div key={card.id} className="group relative w-full overflow-visible cursor-pointer">
          {/* Soft Backdrop Ambient Glow */}
          <div
            className="absolute -inset-1 rounded-[34px] blur-xl opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-40"
            style={{ backgroundColor: card.accentColor }}
          />

          {/* 3D Skeuomorphic Purple Leather Pocket Container */}
          <div
            className="relative w-full rounded-[28px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#6420a7] via-[#4e1688] to-[#340b5c] transition-all duration-300 active:scale-[0.99] group-hover:shadow-[0_20px_40px_-10px_rgba(50,12,85,0.65)]"
            style={{
              boxShadow:
                "0 16px 36px -10px rgba(45, 10, 80, 0.55), 0 8px 18px -6px rgba(30, 5, 55, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.32), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Simulated Leather Grain Texture Overlay */}
            <div
              className="absolute inset-0 rounded-[28px] opacity-15 pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(0,0,0,0.5) 1px, transparent 1px)`,
                backgroundSize: "6px 6px, 8px 8px",
              }}
            />

            {/* Perimeter Simulated Thread Stitching (Light Lavender Dashed Line) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="7"
                y="7"
                width="calc(100% - 14px)"
                height="calc(100% - 14px)"
                rx="22"
                ry="22"
                fill="none"
                stroke="#e9d5ff"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                strokeLinecap="round"
                opacity="0.45"
                style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
              />
            </svg>

            {/* 3D Top Specular Rim Highlight */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

            {/* Content Flex Container */}
            <div className="relative z-10 flex items-center justify-between gap-4">
              {/* Left Column: Title, Description, and Frosted Glass Pill */}
              <div className="flex-1 space-y-2 pr-2">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] group-hover:text-purple-200 transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="text-xs text-purple-100/85 leading-relaxed line-clamp-2">
                    {card.description}
                  </p>
                </div>

                {/* Translucent Frosted Glass Action Pill Button */}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 group-hover:bg-white/25 border border-white/20 backdrop-blur-md text-white font-semibold text-[11px] tracking-wider uppercase shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_2px_8px_rgba(0,0,0,0.2)] transition-all">
                    {card.badgeText}
                  </span>
                </div>
              </div>

              {/* Right Column: 3D Frosted Glass Icon Badge */}
              <div className="shrink-0 relative pointer-events-none">
                {/* Ambient Icon Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-70 animate-pulse"
                  style={{ backgroundColor: card.accentGlow }}
                />

                {/* Frosted Glass Badge Frame */}
                <div
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  style={{
                    boxShadow:
                      "0 8px 20px -4px rgba(0, 0, 0, 0.35), inset 0 1.5px 2px rgba(255, 255, 255, 0.4)",
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

AsymmetricGemBanner.displayName = "AsymmetricGemBanner";
