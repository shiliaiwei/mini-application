"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface ScorePoint {
  t: string;
  pts: number;
}

interface StatsGraphCardProps {
  score: number;
  onClick?: () => void;
}

/**
 * Streamlined Home Stats Card
 * Clean overview preview with live trendline.
 * Tapping opens the dedicated Full-Page Stats SPA with complete Feature | Detail table and deep graphs.
 */
export const StatsGraphCard: React.FC<StatsGraphCardProps> = ({ score, onClick }) => {
  const [scoreHistory, setScoreHistory] = useState<ScorePoint[]>([]);
  const [totalTrackedEvents, setTotalTrackedEvents] = useState<number>(0);
  const prevScore = useRef(score);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shi_score_history");
      if (saved) {
        const parsed: ScorePoint[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScoreHistory(parsed.slice(-16));
        }
      }
    } catch {}

    if (scoreHistory.length === 0) {
      const now = Date.now();
      const base = Math.max(0, score);
      const seed: ScorePoint[] = Array.from({ length: 12 }, (_, i) => {
        const frac = (i + 1) / 12;
        const d = new Date(now - (12 - i) * 60000);
        const label = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        return { t: label, pts: Math.round(base * frac * (0.85 + Math.random() * 0.3)) };
      });
      setScoreHistory(seed);
    }

    try {
      const breakdown = JSON.parse(localStorage.getItem("shi_game_breakdown") || "{}");
      const totalGamePts = Object.values(breakdown).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
      setTotalTrackedEvents(Math.max(24, Math.floor(score / 5) + Math.floor(Number(totalGamePts) / 10)));
    } catch {
      setTotalTrackedEvents(Math.max(16, Math.floor(score / 6)));
    }
  }, [score]);

  useEffect(() => {
    if (score === prevScore.current) return;
    prevScore.current = score;

    setScoreHistory((prev) => {
      const now = new Date();
      const label = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const updated = [...prev, { t: label, pts: score }].slice(-16);
      try { localStorage.setItem("shi_score_history", JSON.stringify(updated)); } catch {}
      return updated;
    });

    setTotalTrackedEvents((prev) => prev + 1);
  }, [score]);

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
      aria-label="Open Full Stats Detail SPA"
      className="sm:col-span-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-3.5 text-white shadow-xs flex flex-col justify-between min-h-[220px] border border-blue-400/30 cursor-pointer active:scale-[0.98] transition-all hover:shadow-lg group text-left select-none"
    >
      {/* ── TOP ROW: Title ("Stats" only per rule) + "Feature Detail →" Link Badge ── */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-black tracking-tight text-white leading-none">Stats</h2>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Feature Detail Callout Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white text-[10px] font-black uppercase tracking-wider transition-all group-hover:bg-white group-hover:text-[#0077b5]">
          <span>Feature Detail</span>
          <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      </div>

      {/* ── SCORE & DELTA ── */}
      <div className="relative z-10 flex items-baseline gap-2 mb-1.5">
        <span className="text-2xl sm:text-3xl font-black text-yellow-300 font-mono leading-none">
          {score.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">PTS</span>
        {delta !== 0 && (
          <span className={`text-[10px] font-black font-mono ${delta > 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {trend}{Math.abs(delta).toLocaleString()}
          </span>
        )}
      </div>

      {/* ── LIVE PREVIEW TRENDLINE CHART (Clean Recharts Area) ── */}
      <div className="relative z-10 w-full h-[95px] flex items-center justify-center pointer-events-none">
        <ResponsiveContainer width="100%" height={95}>
          <AreaChart data={scoreHistory} margin={{ top: 4, right: 0, left: -26, bottom: 0 }}>
            <defs>
              <linearGradient id="homeCardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.12)" vertical={false} />
            <Area
              type="monotone"
              dataKey="pts"
              stroke="#ffffff"
              strokeWidth={2}
              fill="url(#homeCardAreaGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#fbbf24", stroke: "#fff", strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── FOOTER: Consistent 3-Metric Status Row (Tap for Full SPA) ── */}
      <div className="relative z-10 flex items-center justify-between pt-2 mt-1 border-t border-white/15 text-[9px] font-bold text-white/80 select-none">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
          <span>{totalTrackedEvents.toLocaleString()} Events Tracked</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping" />
          <span className="text-yellow-300 font-black">Live Activity</span>
        </div>

        <div className="flex items-center gap-0.5 text-white font-black group-hover:underline">
          <span>Tap to View SPA</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
};
