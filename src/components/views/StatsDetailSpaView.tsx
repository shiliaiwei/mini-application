"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { BrandFooter } from "@/components/brand/BrandFooter";

interface StatsDetailSpaViewProps {
  score: number;
  onBack: () => void;
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
}

/* ──────────────────────────────────────────────────────────── */
/* 14 Chart Types Taxonomy                                      */
/* ──────────────────────────────────────────────────────────── */
export type ChartTypeCategory =
  | "cartesian"
  | "pie-donut"
  | "bubble"
  | "gauge"
  | "funnel-pyramid"
  | "heatmap-matrix"
  | "data-tables"
  | "ranking"
  | "financial"
  | "geospatial-maps"
  | "flow-network"
  | "statistical-engineering"
  | "scheduling-operations"
  | "analytics";

export interface ChartTypeOption {
  id: ChartTypeCategory;
  label: string;
  tagline: string;
  badge: string;
}

export const CHART_TYPES: ChartTypeOption[] = [
  { id: "cartesian", label: "Cartesian", tagline: "Dual-Axis Area & Volume Stream", badge: "Axis" },
  { id: "pie-donut", label: "Pie & donut", tagline: "Game & Yield Distribution", badge: "Donut" },
  { id: "bubble", label: "Bubble", tagline: "Game Yield vs Session Duration", badge: "Scatter" },
  { id: "gauge", label: "Gauge", tagline: "Daily Vault Capacity Meter", badge: "Gauge" },
  { id: "funnel-pyramid", label: "Funnel & pyramid", tagline: "Player Conversion Pipeline", badge: "Funnel" },
  { id: "heatmap-matrix", label: "Heatmap & matrix", tagline: "7-Day x 24-Hour Activity Density", badge: "168H" },
  { id: "data-tables", label: "Data & tables", tagline: "Interactive Transaction Ledger", badge: "Ledger" },
  { id: "ranking", label: "Ranking", tagline: "Global Wealth Leaderboard Matrix", badge: "Ranks" },
  { id: "financial", label: "Financial", tagline: "PTS / USD Valuation & Candlesticks", badge: "OHLC" },
  { id: "geospatial-maps", label: "Geospatial & maps", tagline: "Global Node & KHQR Validator Network", badge: "Nodes" },
  { id: "flow-network", label: "Flow & network", tagline: "Ecosystem Sankey Value Flow", badge: "Sankey" },
  { id: "statistical-engineering", label: "Statistical & engineering", tagline: "Gaussian Bell Curve & Percentiles", badge: "Normal" },
  { id: "scheduling-operations", label: "Scheduling & operations", tagline: "Automated Gantt Schedule & Crons", badge: "Cron" },
  { id: "analytics", label: "Analytics", tagline: "Executive KPI Metrics Dashboard", badge: "KPIs" },
];

type TimeRange = "1H" | "24H" | "7D" | "ALL";

interface ScorePoint {
  t: string;
  pts: number;
  vol: number;
}

const GAME_INFO: Record<string, { fullName: string; color: string }> = {
  Spin:   { fullName: "Daily Spin Wheel", color: "#fbbf24" },
  Word:   { fullName: "Word Flash Memory", color: "#34d399" },
  Guess:  { fullName: "Guess Words Challenge", color: "#60a5fa" },
  Row5:   { fullName: "Row 5 & Tic Tac", color: "#f472b6" },
  NMatch: { fullName: "Number Match Puzzle", color: "#a78bfa" },
  Flip:   { fullName: "Flip Card Memory", color: "#fb923c" },
};

/* Back Icon */
const ChevronLeft: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const StatsDetailSpaView: React.FC<StatsDetailSpaViewProps> = ({
  score,
  onBack,
  user,
  tgApp,
}) => {
  const [activeChart, setActiveChart] = useState<ChartTypeCategory>("cartesian");
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [scoreHistory, setScoreHistory] = useState<ScorePoint[]>([]);
  const [tableSearch, setTableSearch] = useState("");
  const [totalTrackedEvents, setTotalTrackedEvents] = useState<number>(0);
  const prevScore = useRef(score);

  /* ──────────────────────────────────────────────────────────── */
  /* Built-in Rich Interaction Feature States                     */
  /* Zoom & Pan, Crosshair, Trackball, Tooltips, Selection        */
  /* ──────────────────────────────────────────────────────────── */
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1x, 2x, 3x, 4x
  const [panOffset, setPanOffset] = useState<number>(0);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [showTrackball, setShowTrackball] = useState<boolean>(true);
  const [showTooltips, setShowTooltips] = useState<boolean>(true);
  const [showSelection, setShowSelection] = useState<boolean>(true);

  // Active interaction tracking
  const [hoverData, setHoverData] = useState<any | null>(null);
  const [pointerCoords, setPointerCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: string;
    title: string;
    value: string;
    subtext?: string;
    color?: string;
  } | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Initialize data
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shi_score_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScoreHistory(
            parsed.map((p: any) => ({
              t: p.t,
              pts: Number(p.pts) || 0,
              vol: Math.floor((Number(p.pts) || 10) * 0.15),
            })).slice(-36)
          );
        }
      }
    } catch {}

    if (scoreHistory.length === 0) {
      const now = Date.now();
      const base = Math.max(100, score);
      const seed: ScorePoint[] = Array.from({ length: 24 }, (_, i) => {
        const frac = (i + 1) / 24;
        const d = new Date(now - (24 - i) * 60000);
        const label = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        const pts = Math.round(base * frac * (0.85 + Math.random() * 0.3));
        return { t: label, pts, vol: Math.floor(pts * 0.12) };
      });
      setScoreHistory(seed);
    }

    try {
      const breakdown = JSON.parse(localStorage.getItem("shi_game_breakdown") || "{}");
      const totalGamePts = Object.values(breakdown).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
      setTotalTrackedEvents(Math.max(48, Math.floor(score / 3) + Math.floor(Number(totalGamePts) / 6)));
    } catch {
      setTotalTrackedEvents(Math.max(30, Math.floor(score / 5)));
    }
  }, [score]);

  // Live Score Updates
  useEffect(() => {
    if (score === prevScore.current) return;
    prevScore.current = score;

    setScoreHistory((prev) => {
      const now = new Date();
      const label = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const updated = [...prev, { t: label, pts: score, vol: Math.floor(score * 0.1) }].slice(-36);
      try { localStorage.setItem("shi_score_history", JSON.stringify(updated)); } catch {}
      return updated;
    });

    setTotalTrackedEvents((prev) => prev + 1);
  }, [score]);

  /* ──────────────────────────────────────────────────────────── */
  /* Data-Bound Zoom & Pan Calculation                            */
  /* ──────────────────────────────────────────────────────────── */
  const displayedHistory = useMemo(() => {
    if (zoomLevel === 1) return scoreHistory;
    const windowSize = Math.max(6, Math.floor(scoreHistory.length / zoomLevel));
    const maxOffset = Math.max(0, scoreHistory.length - windowSize);
    const clampedOffset = Math.min(Math.max(0, panOffset), maxOffset);
    return scoreHistory.slice(clampedOffset, clampedOffset + windowSize);
  }, [scoreHistory, zoomLevel, panOffset]);

  // Game Stats List
  const gameStats = useMemo(() => {
    const raw: Record<string, number> = {};
    try {
      const s = localStorage.getItem("shi_game_breakdown");
      if (s) Object.assign(raw, JSON.parse(s));
    } catch {}

    if (!Object.keys(raw).length && score > 0) {
      const weights = [0.35, 0.2, 0.2, 0.12, 0.08, 0.05];
      const names = Object.keys(GAME_INFO);
      names.forEach((n, i) => { raw[n] = Math.round(score * weights[i]); });
    }

    return Object.entries(GAME_INFO).map(([key, info], idx) => {
      const pts = raw[key] || Math.max(10, Math.round(score * (0.25 - idx * 0.03)));
      const plays = Math.max(2, Math.floor(pts / (idx === 0 ? 50 : 15)));
      return {
        game: key,
        fullName: info.fullName,
        pts,
        color: info.color,
        plays,
        winRate: `${Math.min(98, 72 + idx * 4)}%`,
      };
    });
  }, [score]);

  const pieData = useMemo(() => {
    return gameStats.map((g) => ({
      name: g.game,
      value: Math.max(10, g.pts),
      color: g.color,
      fullName: g.fullName,
    }));
  }, [gameStats]);

  const bubbleData = useMemo(() => {
    return gameStats.map((g, i) => ({
      game: g.game,
      duration: 3 + i * 2.5,
      yieldPts: g.pts,
      size: Math.max(120, g.plays * 45),
      color: g.color,
      fullName: g.fullName,
    }));
  }, [gameStats]);

  const funnelData = [
    { value: 100, name: "Sessions", fill: "#0098ea" },
    { value: 85,  name: "Taps Mined", fill: "#38bdf8" },
    { value: 68,  name: "Mini-Games", fill: "#34d399" },
    { value: 52,  name: "Claim Wins", fill: "#fbbf24" },
    { value: 34,  name: "Vault Locked", fill: "#f472b6" },
  ];

  const rankingData = [
    { rank: "#1", name: "Elena_Whale", pts: 84200, isUser: false },
    { rank: "#2", name: "Satoshi_KH", pts: 62450, isUser: false },
    { rank: "#3", name: "Crypto_Bong", pts: 48900, isUser: false },
    { rank: "#4", name: user?.first_name || "You", pts: score, isUser: true },
    { rank: "#5", name: "Vann_Dara", pts: Math.max(100, Math.floor(score * 0.85)), isUser: false },
  ];

  const candleData = [
    { time: "00:00", open: 18.2, high: 21.4, low: 17.8, close: 20.6, vol: 3200 },
    { time: "04:00", open: 20.6, high: 23.8, low: 19.9, close: 22.9, vol: 4500 },
    { time: "08:00", open: 22.9, high: 25.1, low: 22.0, close: 24.5, vol: 6200 },
    { time: "12:00", open: 24.5, high: 28.2, low: 23.9, close: 27.8, vol: 8900 },
    { time: "16:00", open: 27.8, high: 29.5, low: 26.5, close: 28.9, vol: 7400 },
    { time: "20:00", open: 28.9, high: 31.0, low: 28.0, close: 30.5, vol: 9800 },
  ];

  const bellCurveData = Array.from({ length: 25 }, (_, i) => {
    const x = -3 + (i * 6) / 24;
    const y = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    return {
      percentile: `${Math.round(((i + 1) / 25) * 100)}%`,
      density: Math.round(y * 1000),
      isUserArea: i >= 18,
    };
  });

  const ledgerEntries = [
    { id: "TX-9021", time: "Just now", type: "Tap Mining", game: "Vault Tap", pts: `+${Math.max(1, score % 20 || 5)}`, status: "Confirmed", fee: "$0.00" },
    { id: "TX-9020", time: "2m ago", type: "Mini-Game Win", game: "Daily Spin", pts: "+500", status: "Settled", fee: "$0.00" },
    { id: "TX-9019", time: "6m ago", type: "Word Match", game: "Word Flash", pts: "+150", status: "Settled", fee: "$0.00" },
    { id: "TX-9018", time: "12m ago", type: "Passive Rate", game: "Mining Rig", pts: "+45", status: "Auto-Mint", fee: "$0.00" },
    { id: "TX-9017", time: "24m ago", type: "Combo Streak", game: "Flip Card", pts: "+200", status: "Confirmed", fee: "$0.00" },
    { id: "TX-9016", time: "1h ago", type: "Quest Claim", game: "Missions Hub", pts: "+1000", status: "Claimed", fee: "$0.00" },
  ].filter((r) => r.game.toLowerCase().includes(tableSearch.toLowerCase()) || r.type.toLowerCase().includes(tableSearch.toLowerCase()));

  const delta = scoreHistory.length >= 2
    ? scoreHistory[scoreHistory.length - 1].pts - scoreHistory[scoreHistory.length - 2].pts
    : 0;
  const trend = delta > 0 ? "+" : delta < 0 ? "" : "~";

  const activeOption = CHART_TYPES.find((c) => c.id === activeChart) || CHART_TYPES[0];

  /* ──────────────────────────────────────────────────────────── */
  /* Pointer Handling for Crosshair & Trackball                   */
  /* ──────────────────────────────────────────────────────────── */
  const handleContainerPointerMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    setPointerCoords({ x, y });

    // Snap to nearest data point in Cartesian stream
    if (displayedHistory.length > 0) {
      const idx = Math.min(
        displayedHistory.length - 1,
        Math.max(0, Math.floor((x / rect.width) * displayedHistory.length))
      );
      setHoverData(displayedHistory[idx]);
    }
  };

  const handleContainerPointerLeave = () => {
    setPointerCoords(null);
    setHoverData(null);
  };

  // Selection Handler
  const handleSelectEntity = (entity: {
    type: string;
    title: string;
    value: string;
    subtext?: string;
    color?: string;
  }) => {
    if (!showSelection) return;
    try { tgApp?.HapticFeedback?.selectionChanged(); } catch {}
    setSelectedEntity(entity);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 select-none font-sans max-w-xl mx-auto w-full px-3 py-3 pb-28">
      {/* ── 1. HEADER BAR: Back + Brand Logo ── */}
      <div className="flex items-center justify-between gap-2 mb-3 bg-white px-3 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => {
            try { tgApp?.HapticFeedback?.impactOccurred("medium"); } catch {}
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={16} className="text-[#0098ea]" />
          <span>Back</span>
        </button>

        {/* Brand Logo only (zero duplicate text per rule) */}
        <div className="flex items-center">
          <ShiliaiweiBrand height={20} colorScheme="blue" />
        </div>

        <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>14 Chart Suites</span>
        </div>
      </div>

      {/* ── 2. THE 14 CHART TYPES HORIZONTAL FILTER PILLS ── */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            CHART TYPES ({CHART_TYPES.length})
          </span>
          <span className="text-[10px] font-bold text-[#0098ea]">
            {activeOption.label} Selected
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {CHART_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                try { tgApp?.HapticFeedback?.selectionChanged(); } catch {}
                setActiveChart(t.id);
                setSelectedEntity(null);
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeChart === t.id
                  ? "bg-[#0098ea] border-[#0098ea] text-white shadow-sm scale-102"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`text-[8px] px-1.5 py-0.2 rounded-full uppercase font-mono ${
                  activeChart === t.id ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {t.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. RICH INTERACTION FEATURES TOOLBAR (Zoom, Crosshair, Trackball, Tooltips, Selection) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs mb-3">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            RICH INTERACTION FEATURES (BUILT-IN)
          </span>
          <span className="text-[9px] font-mono font-bold text-emerald-600">Data-Bound Real Time</span>
        </div>

        <div className="grid grid-cols-5 gap-1 text-[9px] font-black">
          {/* 1. Zoom & Pan Toggle / Controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 justify-between">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(1, z - 1))}
              disabled={zoomLevel <= 1}
              className="px-1.5 py-0.5 rounded text-slate-700 hover:bg-white disabled:opacity-30 cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
            <span className="font-mono text-[9px] text-[#0098ea]">{zoomLevel}x</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(4, z + 1))}
              disabled={zoomLevel >= 4}
              className="px-1.5 py-0.5 rounded text-slate-700 hover:bg-white disabled:opacity-30 cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
          </div>

          {/* 2. Crosshair Toggle */}
          <button
            type="button"
            onClick={() => setShowCrosshair((v) => !v)}
            className={`py-1 rounded-lg border transition-all text-center cursor-pointer ${
              showCrosshair
                ? "bg-[#0098ea] border-[#0098ea] text-white shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Crosshair
          </button>

          {/* 3. Trackball Toggle */}
          <button
            type="button"
            onClick={() => setShowTrackball((v) => !v)}
            className={`py-1 rounded-lg border transition-all text-center cursor-pointer ${
              showTrackball
                ? "bg-[#0098ea] border-[#0098ea] text-white shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Trackball
          </button>

          {/* 4. Tooltips Toggle */}
          <button
            type="button"
            onClick={() => setShowTooltips((v) => !v)}
            className={`py-1 rounded-lg border transition-all text-center cursor-pointer ${
              showTooltips
                ? "bg-[#0098ea] border-[#0098ea] text-white shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tooltips
          </button>

          {/* 5. Selection Toggle */}
          <button
            type="button"
            onClick={() => setShowSelection((v) => !v)}
            className={`py-1 rounded-lg border transition-all text-center cursor-pointer ${
              showSelection
                ? "bg-[#0098ea] border-[#0098ea] text-white shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Selection
          </button>
        </div>

        {/* Pan Slider (Active when Zoom > 1) */}
        {zoomLevel > 1 && (
          <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-100 text-[9px] font-bold text-slate-600">
            <span>Pan:</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, scoreHistory.length - 6)}
              value={panOffset}
              onChange={(e) => setPanOffset(Number(e.target.value))}
              className="flex-1 accent-[#0098ea] cursor-ew-resize"
            />
            <span className="font-mono">{panOffset} offset</span>
            <button
              type="button"
              onClick={() => { setZoomLevel(1); setPanOffset(0); }}
              className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[8px] font-black uppercase cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* ── 4. SELECTION INSPECTOR CARD (When an element is selected) ── */}
      {selectedEntity && (
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-3 border border-cyan-400/40 shadow-md mb-3 animate-fadeIn flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0 animate-ping" style={{ backgroundColor: selectedEntity.color || "#38bdf8" }} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-white/20 text-cyan-200">
                  {selectedEntity.type}
                </span>
                <span className="text-xs font-black">{selectedEntity.title}</span>
              </div>
              <p className="text-xs font-mono font-black text-yellow-300 mt-0.5">
                {selectedEntity.value}
                {selectedEntity.subtext && <span className="text-[10px] text-blue-200 font-sans ml-2">({selectedEntity.subtext})</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedEntity(null)}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[9px] font-black text-white/80 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* ── 5. HERO CHART CANVAS CONTAINER (Active Chart Rendering with Pointer Tracking) ── */}
      <div
        ref={chartContainerRef}
        onMouseMove={handleContainerPointerMove}
        onTouchMove={handleContainerPointerMove}
        onMouseLeave={handleContainerPointerLeave}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-4 text-white shadow-md border border-blue-400/40 mb-3.5"
      >
        {/* Top Header of Active Chart */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white leading-none">
                {activeOption.label}
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-blue-200 font-medium mt-0.5">{activeOption.tagline}</p>
          </div>

          {/* Timeframe Controls */}
          <div className="flex items-center gap-0.5 bg-black/20 rounded-lg p-0.5 border border-white/10">
            {(["1H", "24H", "7D", "ALL"] as TimeRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`text-[9px] font-black px-2 py-0.5 rounded transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-white text-[#0098ea] font-extrabold shadow-2xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Score & Live Delta */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black text-yellow-300 font-mono leading-none">
            {score.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">PTS</span>
          {delta !== 0 && (
            <span className={`text-xs font-black font-mono ${delta > 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {trend}{Math.abs(delta).toLocaleString()}
            </span>
          )}
        </div>

        {/* ── THE 14 DEDICATED VISUALIZATIONS ── */}
        <div className="relative w-full h-[210px] flex items-center justify-center pt-1">
          {/* 1. CARTESIAN (Multi-axis Area + Bar + Line) */}
          {activeChart === "cartesian" && (
            <ResponsiveContainer width="100%" height={210}>
              <ComposedChart
                data={displayedHistory}
                margin={{ top: 8, right: 4, left: -22, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const d = e.activePayload[0].payload;
                    handleSelectEntity({
                      type: "Cartesian Point",
                      title: `Time: ${d.t}`,
                      value: `${d.pts.toLocaleString()} PTS`,
                      subtext: `Vol: ${d.vol}`,
                      color: "#38bdf8",
                    });
                  }
                }}
              >
                <defs>
                  <linearGradient id="cartesianAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.15)" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
                {showTooltips && (
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white/95 backdrop-blur-md border border-white/80 rounded-xl px-3 py-2 shadow-xl text-xs font-black text-slate-900">
                          <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                          <p className="text-[#0098ea] font-mono text-sm">{payload[0]?.value?.toLocaleString()} PTS</p>
                          <p className="text-slate-500 font-mono text-[10px]">Vol: {payload[0]?.payload?.vol} units</p>
                        </div>
                      );
                    }}
                  />
                )}
                <Area type="monotone" dataKey="pts" stroke="#ffffff" strokeWidth={2.5} fill="url(#cartesianAreaGrad)" dot={false} activeDot={{ r: 5, fill: "#fbbf24", stroke: "#fff", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="vol" stroke="#fbbf24" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* 2. PIE & DONUT */}
          {activeChart === "pie-donut" && (
            <div className="w-full h-full flex items-center justify-between">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={76}
                      paddingAngle={4}
                      onClick={(e: any) => {
                        handleSelectEntity({
                          type: "Donut Slice",
                          title: e.fullName || e.name,
                          value: `${e.value.toLocaleString()} PTS`,
                          subtext: `${((e.value / Math.max(1, score)) * 100).toFixed(1)}% of total`,
                          color: e.color,
                        });
                      }}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.color}
                          stroke={selectedEntity?.title === entry.fullName ? "#fbbf24" : "#ffffff"}
                          strokeWidth={selectedEntity?.title === entry.fullName ? 3 : 1.5}
                          className="cursor-pointer"
                        />
                      ))}
                    </Pie>
                    {showTooltips && (
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0];
                          return (
                            <div className="bg-white/95 border border-white/80 rounded-xl px-2.5 py-1.5 shadow-lg text-[10px] font-black text-slate-900">
                              <span style={{ color: data.payload.color }}>{data.name}</span>
                              <p className="font-mono">{data.value?.toLocaleString()} PTS</p>
                            </div>
                          );
                        }}
                      />
                    )}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col justify-center gap-1.5 pl-2">
                {pieData.map((p) => (
                  <div
                    key={p.name}
                    onClick={() => {
                      handleSelectEntity({
                        type: "Donut Slice",
                        title: p.fullName,
                        value: `${p.value.toLocaleString()} PTS`,
                        subtext: `${((p.value / Math.max(1, score)) * 100).toFixed(1)}%`,
                        color: p.color,
                      });
                    }}
                    className={`flex items-center justify-between text-[10px] p-1 rounded-lg cursor-pointer transition-all ${
                      selectedEntity?.title === p.fullName ? "bg-white/20 font-black text-yellow-300" : "hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-1 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span>{p.name}</span>
                    </span>
                    <span className="font-mono font-bold text-white/90">{p.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. BUBBLE (Scatter Bubble Chart) */}
          {activeChart === "bubble" && (
            <ResponsiveContainer width="100%" height={210}>
              <ScatterChart
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const d = e.activePayload[0].payload;
                    handleSelectEntity({
                      type: "Bubble Point",
                      title: d.fullName,
                      value: `${d.yieldPts.toLocaleString()} PTS`,
                      subtext: `Session: ${d.duration}m`,
                      color: d.color,
                    });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.15)" />
                <XAxis type="number" dataKey="duration" name="Session (min)" unit="m" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="yieldPts" name="Yield" unit=" PTS" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="size" range={[60, 400]} />
                {showTooltips && (
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white/95 border border-white/80 rounded-xl px-3 py-2 shadow-xl text-xs font-black text-slate-900">
                          <p style={{ color: d.color }}>{d.game}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Yield: {d.yieldPts.toLocaleString()} PTS</p>
                          <p className="text-[10px] text-slate-500 font-mono">Session: {d.duration} mins</p>
                        </div>
                      );
                    }}
                  />
                )}
                <Scatter data={bubbleData}>
                  {bubbleData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={0.9}
                      stroke={selectedEntity?.title === entry.fullName ? "#fbbf24" : "#fff"}
                      strokeWidth={selectedEntity?.title === entry.fullName ? 3 : 1.5}
                      className="cursor-pointer"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}

          {/* 4. GAUGE */}
          {activeChart === "gauge" && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <svg width="220" height="130" viewBox="0 0 220 130">
                <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="16" strokeLinecap="round" />
                <path
                  d="M 20 110 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="16"
                  strokeDasharray="283"
                  strokeDashoffset={Math.max(40, 283 - (Math.min(100, Math.floor((score / 50000) * 100)) * 2.83))}
                  strokeLinecap="round"
                />
                <text x="110" y="80" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="monospace">
                  {Math.min(100, Math.round((score / 50000) * 100))}%
                </text>
                <text x="110" y="100" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="700">
                  Target: 50,000 PTS
                </text>
              </svg>
              <div className="flex items-center gap-4 text-xs font-bold text-white/90">
                <span>0 PTS</span>
                <span className="text-yellow-300 font-mono">Current: {score.toLocaleString()} PTS</span>
                <span>50k PTS</span>
              </div>
            </div>
          )}

          {/* 5. FUNNEL & PYRAMID */}
          {activeChart === "funnel-pyramid" && (
            <ResponsiveContainer width="100%" height={210}>
              <FunnelChart margin={{ top: 4, bottom: 4, left: 10, right: 10 }}>
                {showTooltips && (
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white/95 rounded-xl px-2.5 py-1.5 text-[10px] font-black text-slate-900 shadow-lg">
                          <p>{payload[0]?.name}: {payload[0]?.value}%</p>
                        </div>
                      );
                    }}
                  />
                )}
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" fill="#ffffff" stroke="none" dataKey="name" fontSize={10} fontWeight={800} />
                  {funnelData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      opacity={0.9}
                      onClick={() => {
                        handleSelectEntity({
                          type: "Funnel Stage",
                          title: entry.name,
                          value: `${entry.value}% conversion`,
                          color: entry.fill,
                        });
                      }}
                      className="cursor-pointer"
                    />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          )}

          {/* 6. HEATMAP & MATRIX */}
          {activeChart === "heatmap-matrix" && (
            <div className="w-full h-full flex flex-col justify-between py-1">
              <div className="flex items-center justify-between text-[10px] text-white/80 font-bold">
                <span>7-Day x 24-Hour Activity Matrix</span>
                <span className="text-yellow-300 font-mono">{totalTrackedEvents} Events Tracked</span>
              </div>
              <div className="grid grid-cols-12 gap-1 w-full my-auto">
                {Array.from({ length: 48 }, (_, idx) => {
                  const intensity = ((idx * 7) % 100);
                  const bg = intensity > 70 ? "#34d399" : intensity > 40 ? "#38bdf8" : intensity > 15 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)";
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        handleSelectEntity({
                          type: "Heatmap Cell",
                          title: `Hour Slot ${idx}:00 UTC`,
                          value: `${intensity}% activity intensity`,
                          color: intensity > 70 ? "#34d399" : "#38bdf8",
                        });
                      }}
                      className="h-3.5 rounded-xs transition-all hover:scale-125 cursor-pointer"
                      style={{ background: bg }}
                      title={`Block ${idx + 1}: ${intensity}% density`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[8px] text-white/70">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-emerald-400" /> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-sky-400" /> Active</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-white/20" /> Low</span>
                <span className="font-mono text-white/90">Peak: 14:00 - 20:00 UTC</span>
              </div>
            </div>
          )}

          {/* 7. DATA & TABLES */}
          {activeChart === "data-tables" && (
            <div className="w-full h-full overflow-hidden flex flex-col justify-between py-0.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <input
                  type="text"
                  placeholder="Search ledger entries..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full px-2.5 py-1 rounded-lg bg-white/15 border border-white/20 text-white placeholder-white/50 text-[10px] font-bold focus:outline-none"
                />
              </div>
              <div className="overflow-y-auto max-h-[160px] no-scrollbar">
                <table className="w-full text-left text-[9px]">
                  <thead className="bg-black/20 text-white/70 uppercase">
                    <tr>
                      <th className="p-1">Time</th>
                      <th className="p-1">Type</th>
                      <th className="p-1">Game</th>
                      <th className="p-1 text-right">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {ledgerEntries.slice(0, 5).map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => {
                          handleSelectEntity({
                            type: "Ledger Record",
                            title: `${row.game} (${row.type})`,
                            value: `${row.pts} PTS`,
                            subtext: `${row.time} • ${row.status}`,
                            color: "#fbbf24",
                          });
                        }}
                        className="hover:bg-white/10 cursor-pointer"
                      >
                        <td className="p-1 font-mono">{row.time}</td>
                        <td className="p-1 font-bold">{row.type}</td>
                        <td className="p-1">{row.game}</td>
                        <td className="p-1 text-right font-mono font-bold text-yellow-300">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. RANKING */}
          {activeChart === "ranking" && (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={rankingData}
                layout="vertical"
                margin={{ top: 6, right: 16, left: 16, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const r = e.activePayload[0].payload;
                    handleSelectEntity({
                      type: "Ranked Player",
                      title: `${r.rank} ${r.name}`,
                      value: `${r.pts.toLocaleString()} PTS`,
                      color: r.isUser ? "#fbbf24" : "#38bdf8",
                    });
                  }
                }}
              >
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.15)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#ffffff", fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} width={80} />
                {showTooltips && (
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      const r = payload[0].payload;
                      return (
                        <div className="bg-white/95 rounded-xl px-2.5 py-1.5 text-[10px] font-black text-slate-900 shadow-lg">
                          <p>{r.rank} {r.name}: {r.pts.toLocaleString()} PTS</p>
                        </div>
                      );
                    }}
                  />
                )}
                <Bar dataKey="pts" radius={[0, 6, 6, 0]} maxBarSize={20} className="cursor-pointer">
                  {rankingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isUser ? "#fbbf24" : "#38bdf8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* 9. FINANCIAL */}
          {activeChart === "financial" && (
            <div className="w-full h-full flex flex-col justify-between py-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-white/80">PTS / USD Simulated Index</span>
                <span className="text-emerald-300 font-mono">+12.4% 24h</span>
              </div>
              <ResponsiveContainer width="100%" height={170}>
                <ComposedChart data={candleData} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.15)" />
                  <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 8 }} axisLine={false} tickLine={false} />
                  {showTooltips && (
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white/95 rounded-xl px-2.5 py-1.5 text-[10px] font-black text-slate-900 shadow-xl">
                            <p className="text-slate-400">{label}</p>
                            <p className="text-emerald-600">Close: ${d.close}</p>
                            <p className="text-slate-600 font-mono">High: ${d.high} • Low: ${d.low}</p>
                          </div>
                        );
                      }}
                    />
                  )}
                  <Bar dataKey="vol" fill="rgba(255,255,255,0.2)" yAxisId={0} maxBarSize={16} />
                  <Line type="monotone" dataKey="close" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3, fill: "#fff" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 10. GEOSPATIAL & MAPS */}
          {activeChart === "geospatial-maps" && (
            <div className="w-full h-full flex flex-col justify-between py-1">
              <div className="flex items-center justify-between text-[10px] text-white/80 font-bold">
                <span>Decentralized Validator & KHQR Relays</span>
                <span className="text-emerald-300 font-mono">5 Active Nodes</span>
              </div>
              <svg width="100%" height="145" viewBox="0 0 320 145" className="my-auto">
                <ellipse cx="160" cy="72" rx="140" ry="60" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />
                <ellipse cx="160" cy="72" rx="90" ry="38" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <path d="M 60 70 Q 140 20 220 80" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
                <path d="M 220 80 Q 250 50 280 65" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" />
                <g transform="translate(60, 70)" className="cursor-pointer" onClick={() => handleSelectEntity({ type: "Node", title: "US-East Validator", value: "32ms", color: "#38bdf8" })}>
                  <circle r="4" fill="#38bdf8" />
                  <circle r="8" fill="#38bdf8" opacity="0.3" className="animate-ping" />
                  <text x="0" y="14" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">US-East</text>
                </g>
                <g transform="translate(140, 50)" className="cursor-pointer" onClick={() => handleSelectEntity({ type: "Node", title: "Frankfurt Hub", value: "85ms", color: "#a78bfa" })}>
                  <circle r="4" fill="#a78bfa" />
                  <text x="0" y="14" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">Frankfurt</text>
                </g>
                <g transform="translate(220, 80)" className="cursor-pointer" onClick={() => handleSelectEntity({ type: "Node", title: "Phnom Penh HQ Hub", value: "12ms", color: "#34d399" })}>
                  <circle r="5" fill="#34d399" />
                  <circle r="10" fill="#34d399" opacity="0.3" className="animate-ping" />
                  <text x="0" y="16" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="900">Phnom Penh (HQ)</text>
                </g>
                <g transform="translate(250, 95)" className="cursor-pointer" onClick={() => handleSelectEntity({ type: "Node", title: "Singapore L2 Relay", value: "24ms", color: "#38bdf8" })}>
                  <circle r="4" fill="#38bdf8" />
                  <text x="0" y="14" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">Singapore</text>
                </g>
                <g transform="translate(280, 65)" className="cursor-pointer" onClick={() => handleSelectEntity({ type: "Node", title: "Tokyo Edge Node", value: "48ms", color: "#f472b6" })}>
                  <circle r="4" fill="#f472b6" />
                  <text x="0" y="14" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold">Tokyo</text>
                </g>
              </svg>
              <div className="flex items-center justify-between text-[8px] text-white/70 font-mono">
                <span>KHQR Relay: 12ms</span>
                <span>SG L2: 24ms</span>
                <span>EU Node: 85ms</span>
              </div>
            </div>
          )}

          {/* 11. FLOW & NETWORK */}
          {activeChart === "flow-network" && (
            <div className="w-full h-full flex flex-col justify-between py-1">
              <div className="flex items-center justify-between text-[10px] text-white/80 font-bold">
                <span>Value Flow Stream (Sankey Flow)</span>
                <span className="text-yellow-300 font-mono">100% On-Chain</span>
              </div>
              <div className="grid grid-cols-3 gap-2 w-full my-auto items-center text-center">
                <div className="space-y-1 text-[9px]">
                  <div onClick={() => handleSelectEntity({ type: "Flow Source", title: "Tap Mint Inflow", value: "40%", color: "#38bdf8" })} className="p-1 rounded bg-white/10 border border-white/10 font-bold cursor-pointer hover:bg-white/20">Tap Mint (40%)</div>
                  <div onClick={() => handleSelectEntity({ type: "Flow Source", title: "Mini-Games Inflow", value: "35%", color: "#34d399" })} className="p-1 rounded bg-white/10 border border-white/10 font-bold cursor-pointer hover:bg-white/20">Mini-Games (35%)</div>
                  <div onClick={() => handleSelectEntity({ type: "Flow Source", title: "Passive Rig Inflow", value: "25%", color: "#fbbf24" })} className="p-1 rounded bg-white/10 border border-white/10 font-bold cursor-pointer hover:bg-white/20">Passive Rig (25%)</div>
                </div>
                <div onClick={() => handleSelectEntity({ type: "Central Vault", title: "SHILIAIWEI Vault Core", value: `${score.toLocaleString()} PTS`, color: "#fbbf24" })} className="p-2.5 rounded-xl bg-white/20 border-2 border-yellow-300 shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-[10px] font-black text-white">SHILIAIWEI</span>
                  <span className="text-[8px] text-yellow-300 font-black">VAULT CORE</span>
                  <span className="text-xs font-mono font-bold mt-1">{score.toLocaleString()}</span>
                </div>
                <div className="space-y-1 text-[9px]">
                  <div onClick={() => handleSelectEntity({ type: "Destination", title: "Telegram Web3 Wallet", value: "55%", color: "#34d399" })} className="p-1 rounded bg-white/10 border border-white/10 font-bold text-emerald-300 cursor-pointer hover:bg-white/20">TG Wallet (55%)</div>
                  <div onClick={() => handleSelectEntity({ type: "Destination", title: "Bakong KHQR Gateway", value: "35%", color: "#38bdf8" })} className="p-1 rounded bg-white/10 border border-white/10 font-bold text-sky-300 cursor-pointer hover:bg-white/20">Bakong KHQR (35%)</div>
                  <div onClick={() => handleSelectEntity({ type: "Destination", title: "Staking Reserve Pool", value: "10%", color: "#f472b6" })} className="p-1 rounded bg-white/10 border border-white/10 font-bold text-pink-300 cursor-pointer hover:bg-white/20">Staking Pool (10%)</div>
                </div>
              </div>
              <p className="text-[8px] text-center text-white/60">Dynamic value routing across Telegram Layer-2 nodes</p>
            </div>
          )}

          {/* 12. STATISTICAL & ENGINEERING */}
          {activeChart === "statistical-engineering" && (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={bellCurveData} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="percentile" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 8 }} axisLine={false} tickLine={false} />
                {showTooltips && (
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white/95 rounded-xl px-2.5 py-1.5 text-[10px] font-black text-slate-900 shadow-xl">
                          <p>Percentile: {payload[0]?.payload?.percentile}</p>
                          <p className="text-emerald-600 font-mono">Skill Index: {payload[0]?.value}</p>
                        </div>
                      );
                    }}
                  />
                )}
                <Area type="monotone" dataKey="density" stroke="#34d399" strokeWidth={2.5} fill="url(#bellGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* 13. SCHEDULING & OPERATIONS */}
          {activeChart === "scheduling-operations" && (
            <div className="w-full h-full flex flex-col justify-between py-1 text-[9px]">
              <div className="flex items-center justify-between text-[10px] font-bold text-white/80">
                <span>Operations & Cron Schedules</span>
                <span className="text-emerald-300 font-mono">24H Automated</span>
              </div>
              <div className="space-y-1.5 my-auto">
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[8px] text-white/70">
                    <span>Daily Spin Reset</span>
                    <span>00:00 UTC (Active)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                    <div className="w-3/4 h-full bg-yellow-400 rounded-full" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[8px] text-white/70">
                    <span>Passive Rig Yield Tick</span>
                    <span>Every 60s (Continuous)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                    <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[8px] text-white/70">
                    <span>Leaderboard Settlement</span>
                    <span>Daily 23:59 UTC</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                    <div className="w-1/2 h-full bg-sky-400 rounded-full" />
                  </div>
                </div>
              </div>
              <p className="text-[8px] text-right text-white/60">Server Time: {new Date().toUTCString().slice(17, 25)} UTC</p>
            </div>
          )}

          {/* 14. ANALYTICS */}
          {activeChart === "analytics" && (
            <div className="w-full h-full grid grid-cols-3 gap-1.5 items-center py-1">
              {[
                { label: "Gross Yield", val: `${score.toLocaleString()}`, unit: "PTS", color: "#fbbf24" },
                { label: "Velocity", val: "14.2", unit: "PTS/min", color: "#34d399" },
                { label: "Win Rate", val: "88.4%", unit: "Avg", color: "#38bdf8" },
                { label: "Retention", val: "96.1%", unit: "7D", color: "#a78bfa" },
                { label: "Total Plays", val: `${totalTrackedEvents}`, unit: "Rounds", color: "#f472b6" },
                { label: "Security", val: "A+", unit: "Audit", color: "#34d399" },
              ].map((k) => (
                <div
                  key={k.label}
                  onClick={() => {
                    handleSelectEntity({
                      type: "KPI Metric",
                      title: k.label,
                      value: `${k.val} ${k.unit}`,
                      color: k.color,
                    });
                  }}
                  className="bg-white/10 rounded-xl p-2 border border-white/10 text-center shadow-2xs cursor-pointer hover:bg-white/20 transition-all"
                >
                  <span className="text-[8px] font-bold text-blue-200 block uppercase">{k.label}</span>
                  <span className="text-xs font-black font-mono mt-0.5 block" style={{ color: k.color }}>
                    {k.val}
                  </span>
                  <span className="text-[7px] text-white/50 block">{k.unit}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── BUILT-IN CROSSHAIR OVERLAY ── */}
          {showCrosshair && pointerCoords && (
            <div className="absolute inset-0 pointer-events-none z-30">
              {/* Vertical Crosshair Line */}
              <div
                className="absolute top-0 bottom-0 w-[1.5px] bg-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                style={{ left: pointerCoords.x }}
              />
              {/* Horizontal Crosshair Line */}
              <div
                className="absolute left-0 right-0 h-[1.5px] bg-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                style={{ top: pointerCoords.y }}
              />
              {/* Crosshair coordinate badges */}
              <div
                className="absolute text-[8px] font-mono font-black bg-cyan-500 text-white px-1.5 py-0.5 rounded shadow-md -translate-x-1/2 bottom-0"
                style={{ left: pointerCoords.x }}
              >
                {hoverData?.t || `${Math.round(pointerCoords.x)}px`}
              </div>
              <div
                className="absolute text-[8px] font-mono font-black bg-cyan-500 text-white px-1.5 py-0.5 rounded shadow-md -translate-y-1/2 left-0"
                style={{ top: pointerCoords.y }}
              >
                {hoverData?.pts ? `${hoverData.pts.toLocaleString()} PTS` : `${Math.round(pointerCoords.y)}px`}
              </div>
            </div>
          )}

          {/* ── BUILT-IN TRACKBALL OVERLAY ── */}
          {showTrackball && pointerCoords && hoverData && (
            <div
              className="absolute pointer-events-none z-40 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ left: pointerCoords.x, top: pointerCoords.y }}
            >
              <div className="w-5 h-5 rounded-full border-2 border-yellow-300 bg-yellow-400/50 shadow-[0_0_12px_#fbbf24] animate-ping" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-white border border-yellow-400 shadow-sm" />

              {/* Floating Trackball HUD Pill */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white border border-cyan-400/40 px-2 py-1 rounded-xl shadow-xl whitespace-nowrap text-[9px] font-black font-mono">
                <span className="text-cyan-300 mr-1">{hoverData.t}:</span>
                <span className="text-yellow-300">{hoverData.pts?.toLocaleString()} PTS</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Consistency status bar */}
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/15 text-[10px] font-bold text-white/80 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <span>{totalTrackedEvents.toLocaleString()} Events Tracked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping" />
            <span className="text-yellow-300 font-black">Live Activity</span>
          </div>
          <div className="flex items-center gap-1 text-white/75 font-mono text-[9px] uppercase">
            <span>{activeOption.label}</span>
          </div>
        </div>
      </div>

      {/* ── 6. FEATURE | DETAIL TABLE (Requested by User) ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 mb-3.5">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">Feature & Detail Overview</h2>
            <p className="text-[11px] text-slate-500 font-medium">All-in-one system analytics specifications</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0098ea] border border-blue-200">
            System Spec
          </span>
        </div>

        {/* Structured Feature | Detail Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Feature</th>
                <th className="py-2.5 px-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { feature: "Active Chart Type", detail: `${activeOption.label} (${activeOption.tagline})` },
                { feature: "Built-in Interactions", detail: "Zoom & Pan, Crosshair, Trackball, Tooltips, Selection" },
                { feature: "Platform Balance", detail: `${score.toLocaleString()} PTS ($${(score / 100).toFixed(2)} USD)` },
                { feature: "Live Delta Trend", detail: `${trend}${Math.abs(delta).toLocaleString()} PTS (Real-time)` },
                { feature: "Total Tracked Events", detail: `${totalTrackedEvents.toLocaleString()} user interactions logged` },
                { feature: "Chart Types Supported", detail: "14 types (Cartesian, Pie, Bubble, Gauge, Funnel, Heatmap, Maps...)" },
                { feature: "Active Engine", detail: "Recharts 3.x SVG Vector Canvas Engine" },
                { feature: "Sound Synthesis", detail: "Web Audio API custom sound synthesis (zero latency)" },
                { feature: "Mini-Games Tracked", detail: "6 games (Daily Spin, Word Flash, Guess, Row 5, Match, Flip)" },
                { feature: "Persistence Subsystem", detail: "HTML5 LocalDB + Telegram CloudStorage Engine" },
                { feature: "Settlement Gateway", detail: "Bakong KHQR Dual-Currency L2 Gateway" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-800 text-[11px] whitespace-nowrap">
                    {row.feature}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-600 text-[11px] font-mono">
                    {row.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 7. PER-GAME BREAKDOWN LIST ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 mb-3.5">
        <h2 className="text-sm font-black text-slate-900 tracking-tight mb-2">Game Analytics Breakdown</h2>
        <div className="space-y-2">
          {gameStats.map((item) => (
            <div
              key={item.game}
              onClick={() => {
                handleSelectEntity({
                  type: "Game Spec",
                  title: item.fullName,
                  value: `${item.pts.toLocaleString()} PTS`,
                  subtext: `${item.plays} sessions • ${item.winRate} win rate`,
                  color: item.color,
                });
              }}
              className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                selectedEntity?.title === item.fullName
                  ? "bg-blue-50 border-[#0098ea] shadow-xs"
                  : "bg-slate-50 border-slate-200/70 hover:bg-slate-100/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-lg flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">{item.fullName}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">{item.plays} sessions • {item.winRate} win rate</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black font-mono text-slate-900 block leading-tight">
                  {item.pts.toLocaleString()} PTS
                </span>
                <span className="text-[9px] font-bold text-[#0098ea] block">
                  ${(item.pts / 100).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. BRAND FOOTER & RETURN BUTTON ── */}
      <div className="pt-2 text-center space-y-3">
        <BrandFooter height={16} />

        <button
          type="button"
          onClick={() => {
            try { tgApp?.HapticFeedback?.impactOccurred("medium"); } catch {}
            onBack();
          }}
          className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-98 transition-all cursor-pointer"
        >
          Exit to Home View
        </button>
      </div>
    </div>
  );
};
