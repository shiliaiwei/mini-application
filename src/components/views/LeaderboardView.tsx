"use client";

import React from "react";
import { TelegramUser } from "@/types/telegram";
import { Trophy, Timer, User as UserIcon } from "lucide-react";

interface LeaderboardViewProps {
  userScore: number;
  userSpendSeconds: number;
  user: TelegramUser | null;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  timeSpent: string;
  isCurrentUser?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  userScore,
  userSpendSeconds,
  user,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const currentUserName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "You";

  // Simulated global top players with time spent tapping
  const leaders: LeaderboardEntry[] = [
    { rank: 1, name: "CryptoWhale", score: 142850, timeSpent: "58m 20s" },
    { rank: 2, name: "NeonStriker", score: 98400, timeSpent: "42m 15s" },
    { rank: 3, name: "Alex_Ton", score: 76210, timeSpent: "35m 40s" },
    { rank: 4, name: "Dmitry_Tap", score: 54100, timeSpent: "28m 10s" },
    { rank: 5, name: "SarahKWD", score: 41200, timeSpent: "21m 55s" },
    { rank: 6, name: "PixelRunner", score: 29800, timeSpent: "17m 30s" },
    { rank: 7, name: "Sovan_KH", score: 18400, timeSpent: "12m 10s" },
  ];

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Header Card */}
      <div className="game-card rounded-2xl p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#16211b] border-2 border-lime-400 mx-auto flex items-center justify-center text-lime-400 mb-2">
          <Trophy className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
          Global Leaderboard
        </h2>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">
          Ranked by Total Tap Score and Active Spend Time
        </p>
      </div>

      {/* Current User Live Card */}
      <div className="game-card-active rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-lime-400 text-black font-black flex items-center justify-center font-mono text-sm">
            #8
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <span>{currentUserName}</span>
              <span className="text-[10px] text-lime-400 uppercase">(You)</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3 text-lime-400" />
                {formatTime(userSpendSeconds)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-black text-lime-400 font-mono">
            {userScore.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono uppercase">
            POINTS
          </div>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="game-card rounded-2xl overflow-hidden divide-y divide-[#233827]">
        <div className="p-2.5 bg-[#16211b] flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
          <span className="w-12">RANK</span>
          <span className="flex-1">PLAYER</span>
          <span className="w-20 text-center">SPEND TIME</span>
          <span className="w-16 text-right">SCORE</span>
        </div>

        {leaders.map((entry) => (
          <div
            key={entry.rank}
            className="p-3 flex items-center justify-between text-xs font-mono"
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

            {/* Player */}
            <div className="flex-1 min-w-0 pr-2">
              <span className="font-bold text-white truncate block">
                {entry.name}
              </span>
            </div>

            {/* Spend Time */}
            <div className="w-20 text-center text-neutral-400 text-[11px]">
              {entry.timeSpent}
            </div>

            {/* Score */}
            <div className="w-16 text-right font-bold text-lime-400">
              {entry.score.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
