"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import { Trophy, Timer, User as UserIcon, RefreshCw } from "lucide-react";

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
    <div className="space-y-4 pb-20 select-none font-mono">
      {/* Header Card */}
      <div className="game-card rounded-2xl p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#16211b] border-2 border-lime-400 mx-auto flex items-center justify-center text-lime-400 mb-2">
          <Trophy className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          Global Leaderboard
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Real Players Ranked by Tap Score and Active Time
        </p>
      </div>

      {/* Current User Live Card */}
      <div className="game-card-active rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-lime-400 text-black font-black flex items-center justify-center text-xs">
            #{userRank}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{currentUserName}</span>
              <span className="text-[10px] text-lime-400 uppercase">(You)</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3 text-lime-400" />
                {formatTime(userSpendSeconds)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-black text-lime-400">
            {userScore.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400 uppercase">
            POINTS
          </div>
        </div>
      </div>

      {/* Leaderboard Table List (Real Database Data Only, Zero Demo Data) */}
      <div className="game-card rounded-2xl overflow-hidden divide-y divide-[#233827]">
        <div className="p-2.5 bg-[#16211b] flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-wider">
          <span className="w-12">RANK</span>
          <span className="flex-1">PLAYER</span>
          <span className="w-20 text-center">SPEND TIME</span>
          <span className="w-20 text-right">SCORE</span>
        </div>

        {loading && players.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-400 animate-pulse">
            LOADING REAL PLAYER RANKINGS...
          </div>
        ) : players.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-400">
            No other players registered yet. You are currently rank #1. Keep tapping to build your score.
          </div>
        ) : (
          players.map((entry) => {
            const isSelf = user?.id && String(entry.telegram_id) === String(user.id);
            const displayName = [entry.first_name, entry.last_name]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={entry.telegram_id}
                className={`p-3 flex items-center justify-between text-xs ${
                  isSelf ? "bg-[#16211b]" : ""
                }`}
              >
                {/* Rank */}
                <div className="w-12">
                  <span
                    className={`font-black ${
                      entry.rank === 1
                        ? "text-lime-400"
                        : entry.rank === 2
                        ? "text-white"
                        : entry.rank === 3
                        ? "text-lime-600"
                        : "text-neutral-500"
                    }`}
                  >
                    #{entry.rank}
                  </span>
                </div>

                {/* Player Name */}
                <div className="flex-1 min-w-0 pr-2">
                  <span className="font-bold text-white truncate block">
                    {displayName || (entry.username ? `@${entry.username}` : "Player")}
                    {isSelf && (
                      <span className="text-[10px] text-lime-400 ml-1">(You)</span>
                    )}
                  </span>
                </div>

                {/* Spend Time */}
                <div className="w-20 text-center text-neutral-400 text-[11px]">
                  {formatTime(entry.spend_seconds || 0)}
                </div>

                {/* Score */}
                <div className="w-20 text-right font-bold text-lime-400">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Refresh Button */}
      <button
        type="button"
        onClick={fetchLeaderboard}
        disabled={loading}
        className="w-full py-2.5 px-3 rounded-xl bg-[#111914] border border-[#233827] text-neutral-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-lime-400" : ""}`} />
        Refresh Leaderboard Rankings
      </button>
    </div>
  );
};
