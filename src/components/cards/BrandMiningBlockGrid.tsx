"use client";

import React, { useState, useEffect } from "react";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { WeiCoinBadge } from "@/components/brand/WeiCoinBadge";
import {
  TrendingUp,
  Zap,
  ShieldCheck,
  Send,
  ArrowUpRight,
  Repeat,
  Compass,
  Building,
  KeylineGamepad,
  RefreshCw,
} from "@/components/icons/KeylineIcons";

export interface BrandMiningBlockGridProps {
  score?: number;
  usdBalance?: number;
  khrBalance?: number;
  spendSeconds?: number;
  tapPower?: number;
  className?: string;
  onGoToProfile?: () => void;
}

type ExplorerTab = "trending" | "recipes" | "concepts";

export const BrandMiningBlockGrid: React.FC<BrandMiningBlockGridProps> = ({
  score = 0,
  usdBalance = 0,
  khrBalance = 0,
  spendSeconds = 0,
  tapPower = 1,
  className = "",
  onGoToProfile,
}) => {
  const [activeTab, setActiveTab] = useState<ExplorerTab>("trending");
  const [activeRecipe, setActiveRecipe] = useState<number | null>(null);
  const [activeConcept, setActiveConcept] = useState<number | null>(null);
  const [pulseIndex, setPulseIndex] = useState(0);

  // Live block ticker simulation (purely client state)
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 6);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // 24H simulated market trend graph data (7 points)
  const graphPoints = [
    { x: 10, y: 34, price: "$0.0089" },
    { x: 50, y: 28, price: "$0.0092" },
    { x: 90, y: 30, price: "$0.0091" },
    { x: 130, y: 18, price: "$0.0096" },
    { x: 170, y: 20, price: "$0.0095" },
    { x: 210, y: 10, price: "$0.0099" },
    { x: 250, y: 12, price: "$0.0100" },
  ];
  const pathD = graphPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );
  const areaD = `${pathD} L 250 44 L 10 44 Z`;

  // How-to Recipes Data
  const howToRecipes = [
    {
      id: 1,
      title: "Connect",
      category: "Wallet Lifecycle",
      desc: "Initiate decentralized Web3 session with auto-detection of Telegram WebApp provider and secp256k1 keypair resolution.",
      action: "provider.request({ method: 'eth_requestAccounts' })",
    },
    {
      id: 2,
      title: "Disconnect",
      category: "Session Management",
      desc: "Safely terminate active peer session, invalidate ephemeral challenge nonces, and flush local session storage.",
      action: "session.terminate({ flushCache: true })",
    },
    {
      id: 3,
      title: "Send a Transaction",
      category: "Transfers",
      desc: "Sign & broadcast atomic L2 transfer payload on-chain with deterministic recipient resolution and nonce verification.",
      action: "transferLedger({ to: recipient, amount: weiAmount })",
    },
    {
      id: 4,
      title: "Sign Data",
      category: "Cryptography",
      desc: "Cryptographic payload verification using Secp256k1 canonical signature scheme and EIP-712 structured typed data.",
      action: "secp256k1.sign(canonicalHash, privateKey)",
    },
    {
      id: 5,
      title: "Gasless Transfers",
      category: "Relayer Engine",
      desc: "Execute meta-transactions sponsored by the master relayer pool, eliminating gas friction for new Web3 users.",
      action: "relayTransaction({ payload, sponsor: 'KWD_MASTER' })",
    },
    {
      id: 6,
      title: "Embedded Requests",
      category: "In-App RPC",
      desc: "Process native JSON-RPC queries directly within the Telegram Mini App iframe without external browser popups.",
      action: "rpcClient.call('wei_getAccountBalance', [address])",
    },
    {
      id: 7,
      title: "Filter Wallets",
      category: "Client Negotiation",
      desc: "Query and filter supported hardware capabilities, Telegram client versions, and secure biometric enclaves.",
      action: "filterProviders({ supportsCloudStorage: true })",
    },
    {
      id: 8,
      title: "WalletConnect Support",
      category: "Interoperability",
      desc: "Dual-bridge integration enabling external mobile wallet connection via universal QR codes and deep-links.",
      action: "walletConnect.pair({ uri: wcSessionUri })",
    },
  ];

  // Core Concepts Data
  const coreConcepts = [
    {
      id: 1,
      title: "Architecture",
      tag: "Dual-Layer Engine",
      desc: "Hybrid off-chain L2 state machine backed by Neon PostgreSQL pooler and Telegram CloudStorage consensus.",
    },
    {
      id: 2,
      title: "Bridges",
      tag: "Atomic Relayers",
      desc: "Cross-ledger atomic swap channels connecting WEI COIN with Bakong KHQR, US Dollar pegs, and EVM ecosystems.",
    },
    {
      id: 3,
      title: "Sessions",
      tag: "Zero-Trust State",
      desc: "Stateful cryptographic sessions guarded by incrementing nonces, HMAC validation, and ephemeral timeouts.",
    },
    {
      id: 4,
      title: "Universal Links",
      tag: "Native Routing",
      desc: "Seamless deep-linking across t.me/ and https:// protocol endpoints for one-tap payments and QR verification.",
    },
    {
      id: 5,
      title: "Manifest",
      tag: "App Schema",
      desc: "Strict Web3 application manifest declaring required permissions, icons, and contract whitelist endpoints.",
    },
    {
      id: 6,
      title: "Registry",
      tag: "Decentralized Index",
      desc: "Tamper-evident on-chain catalog tracking approved tokens, game mode distribution contracts, and validator nodes.",
    },
    {
      id: 7,
      title: "Feature Negotiation",
      tag: "Handshake Protocol",
      desc: "Dynamic client-server handshake detecting native haptics, WebCrypto support, and hardware acceleration.",
    },
    {
      id: 8,
      title: "Security Model",
      tag: "Zero-Knowledge & HMAC",
      desc: "Strict multi-tier defense: secp256k1 signature validation, IP rate-limiting, and Telegram initData verification.",
    },
  ];

  return (
    <div className={`w-full space-y-3 select-none font-sans ${className}`}>
      {/* 4-BLOCK MARKET TRENDING METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full">
        {/* BLOCK 1: WEI MARKET PRICE & 24H TREND */}
        <div
          className="relative rounded-[20px] sm:rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between text-white overflow-hidden shadow-xs transition-transform active:scale-[0.98] min-h-[96px] sm:min-h-[104px] bg-[#0080c8]"
          style={{
            boxShadow:
              "0 8px 18px -4px rgba(0, 128, 200, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 3px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90">
              MARKET PRICE
            </span>
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-400/25 text-emerald-100 border border-emerald-300/30">
              +12.8%
            </span>
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-white leading-tight block tracking-tight font-mono">
              $0.0100
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium text-cyan-100/90 mt-0.5 block truncate">
              41.00 KHR / 1 WEI
            </span>
          </div>
        </div>

        {/* BLOCK 2: 24H VOLUME & DEPTH */}
        <div
          className="relative rounded-[20px] sm:rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between text-white overflow-hidden shadow-xs transition-transform active:scale-[0.98] min-h-[96px] sm:min-h-[104px] bg-[#00875a]"
          style={{
            boxShadow:
              "0 8px 18px -4px rgba(0, 135, 90, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 3px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90">
              24H VOLUME
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-[8px] font-mono text-emerald-100">LIVE</span>
            </div>
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-white leading-tight block tracking-tight font-mono">
              $1.42M
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium text-emerald-100/80 mt-0.5 block truncate">
              Pool: $5.84M USD
            </span>
          </div>
        </div>

        {/* BLOCK 3: BIG LOGO COIN WEI */}
        <div
          className="relative rounded-[20px] sm:rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between text-white overflow-hidden shadow-xs transition-transform active:scale-[0.98] min-h-[96px] sm:min-h-[104px] bg-[#b45309]"
          style={{
            boxShadow:
              "0 8px 18px -4px rgba(180, 83, 9, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 3px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90">
              COIN WEI
            </span>
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
              NATIVE
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <WeiCoinBadge size="sm" variant="badge-only" />
              <span className="text-xs sm:text-sm font-black text-white font-mono tracking-tight">
                WEI COIN
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium text-amber-100/90 block truncate">
              L2 Standard Asset
            </span>
          </div>
        </div>

        {/* BLOCK 4: POW MINING & SCARCITY */}
        <div
          className="relative rounded-[20px] sm:rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between text-white overflow-hidden shadow-xs transition-transform active:scale-[0.98] min-h-[96px] sm:min-h-[104px] bg-[#7428dd]"
          style={{
            boxShadow:
              "0 8px 18px -4px rgba(116, 40, 221, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 3px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90">
              POW MINING
            </span>
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
              HALVING
            </span>
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-white leading-tight block tracking-tight font-mono">
              0.00010000
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium text-purple-200/80 mt-0.5 block truncate">
              Proof-of-Work Genesis
            </span>
          </div>
        </div>
      </div>

      {/* 3 DISTINCT CURRENCY BLOCK STORES (INDEPENDENT LEDGERS) */}
      <div className="rounded-[22px] p-3 sm:p-3.5 bg-gradient-to-b from-[#140a24] via-[#0d0519] to-[#080210] border border-white/10 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-200">
              3 Distinct Currency Block Stores
            </span>
          </div>
          <span className="text-[9px] font-mono text-white/50">
            Independent Balance Stores
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* STORE 1: WEI COIN */}
          <div className="rounded-xl p-2.5 bg-gradient-to-b from-[#0284c7]/20 via-[#0098ea]/15 to-[#0369a1]/25 border border-cyan-400/30 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-mono font-bold text-cyan-300 uppercase">
                STORE 01 • L2
              </span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-bold">
                WEI
              </span>
            </div>
            <span className="text-sm sm:text-base font-black text-white font-mono block leading-tight">
              {score.toLocaleString()}
            </span>
            <span className="text-[7.5px] font-mono text-cyan-200/70 mt-1 block truncate">
              Earn: +{tapPower} WEI/Tap
            </span>
          </div>

          {/* STORE 2: US DOLLAR */}
          <div className="rounded-xl p-2.5 bg-gradient-to-b from-[#059669]/20 via-[#047857]/15 to-[#065f46]/25 border border-emerald-400/30 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-mono font-bold text-emerald-300 uppercase">
                STORE 02 • VAULT
              </span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-bold">
                USD
              </span>
            </div>
            <span className="text-sm sm:text-base font-black text-emerald-300 font-mono block leading-tight">
              ${usdBalance.toFixed(2)}
            </span>
            <span className="text-[7.5px] font-mono text-emerald-200/70 mt-1 block truncate">
              Earn: +$0.05/Hr Yield
            </span>
          </div>

          {/* STORE 3: KHMER RIEL */}
          <div className="rounded-xl p-2.5 bg-gradient-to-b from-[#9333ea]/20 via-[#7e22ce]/15 to-[#6b21a8]/25 border border-purple-400/30 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-mono font-bold text-purple-300 uppercase">
                STORE 03 • BAKONG
              </span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30 font-bold">
                KHR
              </span>
            </div>
            <span className="text-sm sm:text-base font-black text-purple-300 font-mono block leading-tight">
              {Math.floor(khrBalance).toLocaleString()} ៛
            </span>
            <span className="text-[7.5px] font-mono text-purple-200/70 mt-1 block truncate">
              Earn: +5,000 ៛/Daily
            </span>
          </div>
        </div>
      </div>

      {/* BIG LOGO COIN WEI & PROTOCOL UTILITY SHOWCASE CARD */}
      <div
        className="relative rounded-[26px] p-4 sm:p-5 overflow-hidden text-white bg-gradient-to-br from-[#180e2b] via-[#100720] to-[#080211] border border-amber-400/25"
        style={{
          boxShadow:
            "0 14px 34px -8px rgba(24, 6, 45, 0.6), inset 0 2px 2px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
          {/* BIG LOGO COIN WEI MEDALLION */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Ambient Gold Glow Ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, transparent 70%)",
                filter: "blur(12px)",
                transform: "scale(1.3)",
              }}
            />

            {/* Milled Gold Coin Disc */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center relative p-1 text-center shadow-xl"
              style={{
                background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 45%, #b45309 80%, #78350f 100%)",
                border: "2px solid #fffbeb",
                boxShadow: "0 6px 16px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -3px 6px rgba(0,0,0,0.5)",
              }}
            >
              {/* Inner Concentric Rim */}
              <div
                className="w-full h-full rounded-full flex flex-col items-center justify-center relative border border-amber-900/60"
                style={{
                  background: "radial-gradient(circle at center, #d97706 0%, #92400e 65%, #451a03 100%)",
                }}
              >
                {/* Official WEI Badge Emblem */}
                <div className="mb-0.5">
                  <WeiCoinBadge size="sm" variant="badge-only" />
                </div>
                <span className="text-sm sm:text-base font-black text-white font-mono tracking-tight drop-shadow-md">
                  WEI
                </span>
                <span className="text-[7px] font-black text-amber-200 uppercase tracking-widest font-mono">
                  COIN
                </span>
              </div>
            </div>
          </div>

          {/* PROTOCOL UTILITY & CORE ECONOMIC SCOPE */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                Native Utility Token
              </span>
              <span className="text-[10px] text-cyan-300 font-mono">
                PoW Genesis Standard
              </span>
            </div>

            {/* Exact User Utility Mandate */}
            <p className="text-xs sm:text-sm font-semibold text-white/95 leading-relaxed">
              Used to pay fees, participate in validation, voting, and governance. Initially distributed via Proof-of-Work mining.
            </p>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              <div className="px-2 py-1 rounded-xl bg-white/10 border border-white/15 text-center">
                <span className="text-[9px] uppercase font-bold text-amber-200 block">
                  Pay Fees
                </span>
                <span className="text-[8px] text-white/70 block">
                  Zero gas friction
                </span>
              </div>

              <div className="px-2 py-1 rounded-xl bg-white/10 border border-white/15 text-center">
                <span className="text-[9px] uppercase font-bold text-cyan-200 block">
                  Validation
                </span>
                <span className="text-[8px] text-white/70 block">
                  Node consensus
                </span>
              </div>

              <div className="px-2 py-1 rounded-xl bg-white/10 border border-white/15 text-center">
                <span className="text-[9px] uppercase font-bold text-purple-200 block">
                  Voting
                </span>
                <span className="text-[8px] text-white/70 block">
                  Governance votes
                </span>
              </div>

              <div className="px-2 py-1 rounded-xl bg-white/10 border border-white/15 text-center">
                <span className="text-[9px] uppercase font-bold text-emerald-200 block">
                  PoW Mining
                </span>
                <span className="text-[8px] text-white/70 block">
                  Fair distribution
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-WAY SECTION SELECTOR: [MARKET TRENDS] | [HOW-TO RECIPES] | [CORE CONCEPTS] */}
      <div className="flex items-center justify-between p-1 rounded-2xl bg-slate-900/90 border border-white/15 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("trending")}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "trending"
              ? "bg-[#0098ea] text-white shadow-sm border border-cyan-300/40"
              : "text-white/60 hover:text-white"
          }`}
        >
          Market Trends
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recipes")}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "recipes"
              ? "bg-[#10b981] text-white shadow-sm border border-emerald-300/40"
              : "text-white/60 hover:text-white"
          }`}
        >
          How-to Recipes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("concepts")}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "concepts"
              ? "bg-[#a855f7] text-white shadow-sm border border-purple-300/40"
              : "text-white/60 hover:text-white"
          }`}
        >
          Core Concepts
        </button>
      </div>

      {/* TAB 1: 24H MARKET TRENDING GRAPH & REAL-TIME CHART */}
      {activeTab === "trending" && (
        <div
          className="relative rounded-[24px] p-3.5 sm:p-4 overflow-hidden bg-gradient-to-b from-[#151c38] via-[#0f142b] to-[#090b18] text-white border border-cyan-400/20"
          style={{
            boxShadow:
              "0 14px 32px -8px rgba(10, 16, 40, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.25), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent pointer-events-none" />

          <div className="space-y-2.5">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-200">
                  Market Trending
                </span>
                <span className="text-[10px] text-cyan-100/70 font-mono">
                  24H Real-Time Curve
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Current: $0.0100 USD</span>
              </div>
            </div>

            {/* Graph & Stats Split View */}
            <div className="flex items-center justify-between gap-3 pt-0.5">
              {/* Left Side: Animated SVG Area Graph */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[9px] font-mono text-cyan-200/70 mb-1">
                  <span>00:00 UTC</span>
                  <span>12:00 UTC</span>
                  <span>Now ($0.0100)</span>
                </div>
                <div className="h-12 w-full relative">
                  <svg
                    viewBox="0 0 260 48"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="marketTrendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#0098ea" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="10" y1="12" x2="250" y2="12" stroke="#ffffff" strokeOpacity="0.1" strokeDasharray="3 3" />
                    <line x1="10" y1="28" x2="250" y2="28" stroke="#ffffff" strokeOpacity="0.1" strokeDasharray="3 3" />

                    {/* Gradient Fill */}
                    <path d={areaD} fill="url(#marketTrendGradient)" />

                    {/* Trendline */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: "drop-shadow(0 2px 4px rgba(0,240,255,0.4))" }}
                    />

                    {/* Points */}
                    {graphPoints.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r={i === 6 ? 4 : 2}
                        fill={i === 6 ? "#ffffff" : "#00f0ff"}
                        stroke={i === 6 ? "#0098ea" : "none"}
                        strokeWidth={1.5}
                        className={i === 6 ? "animate-pulse" : ""}
                      />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Right Side: Key Market Metrics */}
              <div className="w-32 shrink-0 space-y-1.5 pl-3 border-l border-white/15 text-right">
                <div>
                  <span className="text-[9px] uppercase font-bold text-cyan-200/70 block">
                    24h High / Low
                  </span>
                  <span className="text-xs font-black text-white font-mono">
                    $0.0102 / $0.0089
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-cyan-200/70 block">
                    Total Minted
                  </span>
                  <span className="text-xs font-black text-emerald-300 font-mono">
                    {(1000000 + pulseIndex * 250).toLocaleString()} WEI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOW-TO RECIPES (8 DEVELOPER RECIPES) */}
      {activeTab === "recipes" && (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">
              How-to Recipes (8 Core Handlers)
            </span>
            <span className="text-[10px] text-white/50 font-mono">Tap recipe to inspect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {howToRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setActiveRecipe(activeRecipe === recipe.id ? null : recipe.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer select-none text-left ${
                  activeRecipe === recipe.id
                    ? "bg-slate-900 border-emerald-400 text-white shadow-lg"
                    : "bg-slate-900/70 border-white/10 hover:border-white/20 text-white/90"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      #{recipe.id}
                    </span>
                    <span className="text-xs font-bold text-white tracking-tight">
                      {recipe.title}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase font-mono text-white/50">
                    {recipe.category}
                  </span>
                </div>

                <p className="text-[11px] text-white/70 leading-relaxed mb-1.5">
                  {recipe.desc}
                </p>

                {activeRecipe === recipe.id && (
                  <div className="mt-2 p-2 rounded-xl bg-black/60 border border-emerald-400/30 font-mono text-[10px] text-emerald-300 overflow-x-auto">
                    <code>{recipe.action}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CORE CONCEPTS (8 ARCHITECTURE CONCEPTS) */}
      {activeTab === "concepts" && (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#a855f7]">
              Core Concepts (Web3 Protocol Model)
            </span>
            <span className="text-[10px] text-white/50 font-mono">Architecture & Standards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {coreConcepts.map((concept) => (
              <div
                key={concept.id}
                onClick={() => setActiveConcept(activeConcept === concept.id ? null : concept.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer select-none text-left ${
                  activeConcept === concept.id
                    ? "bg-slate-900 border-purple-400 text-white shadow-lg"
                    : "bg-slate-900/70 border-white/10 hover:border-white/20 text-white/90"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-purple-400/20 text-purple-300 border border-purple-400/30">
                      {concept.id}
                    </span>
                    <span className="text-xs font-bold text-white tracking-tight">
                      {concept.title}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase font-mono text-purple-300/80">
                    {concept.tag}
                  </span>
                </div>

                <p className="text-[11px] text-white/70 leading-relaxed">
                  {concept.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

BrandMiningBlockGrid.displayName = "BrandMiningBlockGrid";
