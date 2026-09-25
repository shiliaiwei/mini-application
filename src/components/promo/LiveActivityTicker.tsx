"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck } from "@/components/icons/KeylineIcons";

interface LiveEvent {
  id: string;
  user: string;
  action: string;
  reward: string;
  timeAgo: string;
}

const SEED_EVENTS: LiveEvent[] = [
  { id: "e1", user: "Dara K.", action: "claimed Official MoEYS Bonus", reward: "+100 PTS", timeAgo: "Just now" },
  { id: "e2", user: "Sreynich P.", action: "minted points in Tap Vault", reward: "+250 PTS", timeAgo: "1m ago" },
  { id: "e3", user: "Piseth V.", action: "completed Daily Quiz Challenge", reward: "+500 PTS", timeAgo: "2m ago" },
  { id: "e4", user: "Chanthy M.", action: "claimed Skills Fund Airdrop", reward: "+100 PTS", timeAgo: "3m ago" },
  { id: "e5", user: "Kimheng T.", action: "unlocked Level 4 Obsidian Vault", reward: "+1,000 PTS", timeAgo: "4m ago" },
  { id: "e6", user: "Bopha L.", action: "won Dice Duel Battle", reward: "+300 PTS", timeAgo: "6m ago" },
  { id: "e7", user: "Vannak S.", action: "claimed MPWT Sponsor Reward", reward: "+100 PTS", timeAgo: "7m ago" },
];

export const LiveActivityTicker: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SEED_EVENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const event = SEED_EVENTS[index];

  return (
    <div
      className={`w-full bg-slate-900/90 text-white rounded-xl px-3 py-1.5 border border-slate-800 shadow-xs flex items-center justify-between text-xs select-none overflow-hidden ${className}`}
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 text-amber-400">
          <Sparkles size={12} />
        </span>
        <div className="truncate text-[11px]">
          <span className="font-black text-amber-300 mr-1.5">{event.user}</span>
          <span className="text-slate-300 mr-1.5">{event.action}</span>
          <span className="font-mono font-black text-emerald-400">{event.reward}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 pl-2 text-[10px] text-slate-400 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{event.timeAgo}</span>
      </div>
    </div>
  );
};
