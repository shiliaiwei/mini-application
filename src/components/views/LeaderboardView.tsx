"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import { Trophy, RefreshCw, Crown } from "@/components/icons/KeylineIcons";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";
import { BrandFooter } from "@/components/brand/BrandFooter";

interface LeaderboardViewProps {
  userScore?: number;
  userSpendSeconds?: number;
  user?: TelegramUser | null;
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
  userScore = 0,
  userSpendSeconds = 0,
  user = null,
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
      {/* 3D Skeuomorphic Purple Leather Current User Standings Card */}
      <div
        className="relative rounded-[30px] p-5 overflow-hidden bg-gradient-to-b from-[#6420a7] via-[#4e1688] to-[#340b5c] text-white flex items-center justify-between"
        style={{
          boxShadow:
            "0 16px 36px -10px rgba(45, 10, 80, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Leather Grain Texture */}
        <div
          className="absolute inset-0 rounded-[30px] opacity-15 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(0,0,0,0.5) 1px, transparent 1px)`,
            backgroundSize: "6px 6px, 8px 8px",
          }}
        />

        {/* Perimeter Thread Stitching */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="7"
            y="7"
            width="calc(100% - 14px)"
            height="calc(100% - 14px)"
            rx="23"
            ry="23"
            fill="none"
            stroke="#e9d5ff"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            opacity="0.45"
            style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
          />
        </svg>

        {/* Guilloche Banknote Background Style with Suitable Contrast */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
          style={{
            backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover",
            filter: "contrast(1.35) brightness(1.1)",
          }}
        />

        {/* Specular Top Rim */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center text-white font-black text-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] flex-shrink-0">
            <span>#{userRank}</span>
          </div>
          <div>
            <span className="text-[10px] text-purple-200/90 font-medium uppercase tracking-wider block">
              YOUR GLOBAL RANK
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-black text-white font-display block drop-shadow-sm">
                {currentUserName}
              </span>
              {user && <TelegramVerifiedBadge size={14} />}
            </div>
            <span className="text-[11px] text-purple-200/80 font-medium block mt-0.5">
              Active: {formatTime(userSpendSeconds)}
            </span>
          </div>
        </div>

        <div className="relative z-10 text-right">
          <span className="text-[10px] text-purple-200/90 font-medium uppercase tracking-wider block">
            VAULT VALUE (RIEL)
          </span>
          <div className="text-lg sm:text-xl font-black text-white font-display drop-shadow-sm flex items-baseline justify-end gap-1">
            <span className="text-xl sm:text-2xl font-black text-white">៛</span>
            <span>{Math.floor(userScore * 41).toLocaleString()}</span>
          </div>
          <span className="text-[10px] text-purple-200/80 font-medium block mt-0.5">
            $ {(userScore / 100).toFixed(2)} • {userScore.toLocaleString()} WEI COIN
          </span>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="liquid-glass rounded-[32px] p-4 space-y-3 border border-slate-200 shadow-xs relative overflow-hidden">

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
            className="w-9 h-9 rounded-full text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors duration-300 ease-out cursor-pointer border border-slate-200 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
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
                className={`flex items-center justify-between p-3 rounded-full border transition-all duration-300 ease-out px-4 ${
                  isMe
                    ? "bg-sky-50 border-[#0098ea]/60 text-slate-900 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
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

                  {/* Player Avatar */}
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
                    <Image
                      src={p.photo_url || (p.telegram_id ? `/api/player/avatar?telegram_id=${p.telegram_id}&size=small` : "")}
                      alt={p.first_name}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
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
                  <span className="text-xs font-black text-[#0077b5] font-display block">
                    ៛ {Math.floor(Number(p.score) * 41).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold block">
                    $ {(Number(p.score) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consistent Brand Footer */}
      <BrandFooter height={16} className="mt-4 pb-2" />
    </div>
  );
};
