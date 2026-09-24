"use client";

import React, { useEffect, useState, useCallback } from "react";
import { TelegramUser } from "@/types/telegram";
import { Trophy, RefreshCw, Crown } from "@/components/icons/KeylineIcons";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";

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

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data && data.players) {
        setPlayers(data.players);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (!ignore && data?.players) {
          setPlayers(data.players);
        }
      } catch {}
      if (!ignore) setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-3.5 pb-28 font-body select-none text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* Current User Standings Card */}
      <div className="liquid-glass p-3.5 flex items-center justify-between border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0098ea] font-black text-lg shadow-xs relative overflow-hidden flex-shrink-0">
            <span>#{userRank}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">
              YOUR GLOBAL RANK
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-slate-900 font-display block">
                {currentUserName}
              </span>
              {user && <TelegramVerifiedBadge size={14} />}
            </div>
            <span className="text-[11px] text-slate-600 font-semibold block">
              Active: {formatTime(userSpendSeconds)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">
            VAULT VALUE
          </span>
          <div className="text-base sm:text-lg font-black text-[#14532d] font-display">
            ${(userScore / 100).toFixed(2)} USD
          </div>
          <span className="text-[10px] text-slate-600 font-bold block">
            {userScore.toLocaleString()} PTS
          </span>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="liquid-glass p-3.5 space-y-3 border border-slate-200 shadow-xs relative overflow-hidden">

        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider font-display">
              SHILIAIWEI Global Wealth Leaderboard
            </span>
          </div>

          <button
            type="button"
            onClick={fetchLeaderboard}
            disabled={loading}
            aria-label="Refresh Leaderboard"
            className="w-9 h-9 rounded-lg text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-[#0098ea]" : ""} />
          </button>
        </div>

        {/* Players List */}
        <div className="space-y-1.5">
          {players.length === 0 && !loading && (
            <div className="text-center py-8 text-xs text-slate-600">
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
                    ? "bg-sky-50 border-[#0098ea]/60 text-slate-900 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      isTop1
                        ? "bg-amber-400 text-slate-950 shadow-xs"
                        : isTop2
                        ? "bg-slate-300 text-slate-900"
                        : isTop3
                        ? "bg-amber-700 text-white"
                        : "bg-white border border-slate-200 text-slate-700"
                    }`}
                  >
                    {isTop1 ? <Crown size={16} className="text-slate-950" /> : `#${p.rank}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {[p.first_name, p.last_name].filter(Boolean).join(" ") || `@${p.username}`}
                      </span>
                      <TelegramVerifiedBadge size={13} />
                    </div>
                    <span className="text-[10px] text-slate-600 block">
                      Active: {formatTime(p.spend_seconds)}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-xs font-black text-[#14532d] font-display block">
                    ${(Number(p.score) / 100).toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-600 font-bold block">
                    {Number(p.score).toLocaleString()} PTS
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
