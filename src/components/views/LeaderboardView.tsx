"use client";

import React, { useEffect, useState } from "react";
import { TelegramUser } from "@/types/telegram";
import { Trophy, RefreshCw, Crown } from "lucide-react";

interface LeaderboardViewProps {
  userScore: number;
  userSpendSeconds: number;
  user: TelegramUser | null;
  userRank?: number;
}

interface RealPlayer {
  rank: number;
  telegram_id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  score: number;
  spend_seconds: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  userScore,
  userSpendSeconds,
  user,
  userRank = 1,
}) => {
  const [players, setPlayers] = useState<RealPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const currentUserName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "You";

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data && data.players) {
        setPlayers(data.players);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-4 pb-24 font-body select-none text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* Current User Standings Card */}
      <div className="liquid-glass p-4 flex items-center justify-between border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0098ea] font-black text-lg shadow-sm relative overflow-hidden">
            {/* Banknote Sunburst Rosette Watermark (7168912.webp) */}
            <div className="absolute inset-0 bg-security-sunburst opacity-25 pointer-events-none" />
            <span className="relative z-10">#{userRank}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              YOUR GLOBAL RANK
            </span>
            <span className="text-sm font-black text-slate-900 font-display block">
              {currentUserName}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold block">
              Active: {formatTime(userSpendSeconds)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            VAULT VALUE
          </span>
          <div className="text-lg font-black text-[#16a34a] font-display">
            ${userScore.toLocaleString()}.00
          </div>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="liquid-glass p-4 space-y-3 border border-slate-200/90 shadow-sm relative overflow-hidden">
        {/* Flower Banknote Security Strip (1033454350116.webp) */}
        <div className="w-full h-2.5 border-strip-flower opacity-70 mb-2" />

        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider font-display">
              SHILIAIWEI Global Wealth Leaderboard
            </span>
          </div>

          <button
            type="button"
            onClick={fetchLeaderboard}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0098ea]" : ""}`} />
          </button>
        </div>

        {/* Players List */}
        <div className="space-y-1.5">
          {players.length === 0 && !loading && (
            <div className="text-center py-8 text-xs text-slate-500">
              No ranked holders yet. Be the first to mint!
            </div>
          )}

          {players.map((p) => {
            const isMe = String(p.telegram_id) === String(user?.id);
            const isTop1 = p.rank === 1;
            const isTop2 = p.rank === 2;
            const isTop3 = p.rank === 3;

            return (
              <div
                key={p.telegram_id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isMe
                    ? "bg-sky-50/80 border-[#0098ea]/40 text-slate-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      isTop1
                        ? "bg-amber-400 text-slate-900 shadow-sm"
                        : isTop2
                        ? "bg-slate-200 text-slate-800"
                        : isTop3
                        ? "bg-amber-700 text-white"
                        : "bg-white border border-slate-200 text-slate-600"
                    }`}
                  >
                    {isTop1 ? <Crown className="w-3.5 h-3.5" /> : `#${p.rank}`}
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {[p.first_name, p.last_name].filter(Boolean).join(" ") || `@${p.username}`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Active: {formatTime(p.spend_seconds)}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-xs font-black text-[#16a34a] font-display block">
                    ${Number(p.score).toLocaleString()}.00
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">
                    USD VAULT
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
