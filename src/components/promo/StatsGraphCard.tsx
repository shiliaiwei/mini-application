"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

/* ──────────────────────────────────────────────────────────── */
/* Types                                                        */
/* ──────────────────────────────────────────────────────────── */
interface ScorePoint { t: string; pts: number }
interface GameStat  { game: string; pts: number; color: string }

interface StatsGraphCardProps {
  score: number;
  onClick?: () => void;
}

/* ──────────────────────────────────────────────────────────── */
/* Tiny custom tooltip                                         */
/* ──────────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/60 rounded-xl px-2.5 py-1.5 shadow-lg text-[10px] font-black text-slate-900">
      <p className="text-[9px] text-slate-400 font-medium">{label}</p>
      <p className="text-[#0098ea]">{payload[0]?.value?.toLocaleString()} PTS</p>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/60 rounded-xl px-2.5 py-1.5 shadow-lg text-[10px] font-black text-slate-900">
      <p className="text-[9px] text-slate-400 font-medium">{label}</p>
      <p>{payload[0]?.value?.toLocaleString()} PTS</p>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────── */
/* Game color map                                              */
/* ──────────────────────────────────────────────────────────── */
const GAME_COLORS: Record<string, string> = {
  Spin:   "#fbbf24",
  Word:   "#34d399",
  Guess:  "#60a5fa",
  Row5:   "#f472b6",
  NMatch: "#a78bfa",
  Flip:   "#fb923c",
};

/* ──────────────────────────────────────────────────────────── */
/* Main Component                                              */
/* ──────────────────────────────────────────────────────────── */
type FilterType = "area" | "bar";

export const StatsGraphCard: React.FC<StatsGraphCardProps> = ({ score, onClick }) => {
  const [filter, setFilter] = useState<FilterType>("area");
  const [scoreHistory, setScoreHistory] = useState<ScorePoint[]>([]);
  const prevScore = useRef(score);
  const tick = useRef(0);

  /* Build time-series from localStorage + live score ticks */
  useEffect(() => {
    // Seed from localStorage if available
    try {
      const saved = localStorage.getItem("shi_score_history");
      if (saved) {
        const parsed: ScorePoint[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScoreHistory(parsed.slice(-20));
          return;
        }
      }
    } catch {}

    // Bootstrap 8 synthetic past points based on current score
    const now = Date.now();
    const base = Math.max(0, score);
    const seed: ScorePoint[] = Array.from({ length: 8 }, (_, i) => {
      const frac = (i + 1) / 8;
      const d = new Date(now - (8 - i) * 30000);
      const label = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
      return { t: label, pts: Math.round(base * frac * (0.8 + Math.random() * 0.4)) };
    });
    setScoreHistory(seed);
  }, []);

  /* Push new point every 8s when score changes */
  useEffect(() => {
    if (score === prevScore.current) return;
    prevScore.current = score;
    tick.current += 1;

    setScoreHistory((prev) => {
      const now = new Date();
      const label = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const updated = [...prev, { t: label, pts: score }].slice(-20);
      try { localStorage.setItem("shi_score_history", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [score]);

  /* Game-breakdown stats from localStorage */
  const gameStats: GameStat[] = (() => {
    const raw: Record<string, number> = {};
    try {
      const s = localStorage.getItem("shi_game_breakdown");
      if (s) Object.assign(raw, JSON.parse(s));
    } catch {}
    // Fallback: distribute score across games proportionally
    if (!Object.keys(raw).length && score > 0) {
      const weights = [0.35, 0.2, 0.2, 0.12, 0.08, 0.05];
      const names = Object.keys(GAME_COLORS);
      names.forEach((n, i) => { raw[n] = Math.round(score * weights[i]); });
    }
    return Object.entries(GAME_COLORS).map(([game, color]) => ({
      game,
      pts: raw[game] || 0,
      color,
    }));
  })();

  /* Delta since last tick */
  const delta = scoreHistory.length >= 2
    ? scoreHistory[scoreHistory.length - 1].pts - scoreHistory[scoreHistory.length - 2].pts
    : 0;
  const trend = delta > 0 ? "+" : delta < 0 ? "" : "~";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
      className="sm:col-span-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3 text-white shadow-xs flex flex-col justify-between min-h-[240px] border border-blue-400/30 cursor-pointer active:scale-98 transition-all hover:shadow-md text-left select-none"
    >
      {/* TOP ROW: Title + Filter Tabs */}
      <div className="relative z-10 flex items-start justify-between gap-2 mb-2">
        <div>
          <h2 className="text-sm font-black tracking-tight text-white leading-none">Vault Stats</h2>
          <p className="text-[10px] text-blue-200 font-medium mt-0.5">Real-time score graph</p>
        </div>
        <div className="flex gap-1 bg-white/10 rounded-lg p-0.5 flex-shrink-0">
          {(["area", "bar"] as FilterType[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={(e) => { e.stopPropagation(); setFilter(f); }}
              className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wide transition-all cursor-pointer ${
                filter === f ? "bg-white text-[#0098ea] shadow-sm" : "text-white/70 hover:text-white"
              }`}
            >
              {f === "area" ? "Line" : "Bar"}
            </button>
          ))}
        </div>
      </div>

      {/* SCORE + DELTA */}
      <div className="relative z-10 flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-black text-yellow-300 font-mono leading-none">
          {score.toLocaleString()}
        </span>
        {delta !== 0 && (
          <span className={`text-[11px] font-black ${delta > 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {trend}{Math.abs(delta).toLocaleString()}
          </span>
        )}
      </div>

      {/* CHART */}
      <div className="relative z-10 flex-1 w-full min-h-0" style={{ height: 100 }}>
        {filter === "area" ? (
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={scoreHistory} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="sgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ffffff" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 8, fontWeight: 700 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pts" stroke="#ffffff" strokeWidth={2} fill="url(#sgGrad)" dot={false} activeDot={{ r: 4, fill: "#fbbf24", stroke: "#fff", strokeWidth: 1.5 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={gameStats} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="game" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 8, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="pts" radius={[4, 4, 0, 0]} maxBarSize={24}>
                {gameStats.map((entry) => (
                  <Cell key={entry.game} fill={entry.color} opacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* BOTTOM LEGEND (bar mode) or Mini Stats (area mode) */}
      {filter === "bar" ? (
        <div className="relative z-10 flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
          {gameStats.map((g) => (
            <div key={g.game} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
              <span className="text-[9px] text-white/70 font-bold">{g.game}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10 flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
            <span className="text-[9px] text-white/60 font-bold">{scoreHistory.length} data pts</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 flex-shrink-0" />
            <span className="text-[9px] text-white/60 font-bold">Live</span>
          </div>
        </div>
      )}
    </div>
  );
};
