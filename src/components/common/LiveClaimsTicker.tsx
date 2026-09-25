"use client";

import React, { useState, useEffect } from "react";
import { RECENT_USER_CLAIMS, UserClaimEvent } from "@/data/userClaimsData";
import { Sparkles } from "@/components/icons/KeylineIcons";

export const LiveClaimsTicker: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % RECENT_USER_CLAIMS.length);
        setFade(true);
      }, 250);
    }, 4500); // Transitions smoothly every 4.5 seconds

    return () => clearInterval(timer);
  }, []);

  const event: UserClaimEvent = RECENT_USER_CLAIMS[index];

  return (
    <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 shadow-2xs text-xs font-sans select-none overflow-hidden transition-all">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Live indicator dot */}
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        {/* Ticker Content with smooth fade */}
        <div
          className={`flex items-center gap-1.5 min-w-0 truncate transition-opacity duration-300 ${
            fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          }`}
        >
          <span className="font-mono font-bold text-slate-900 flex-shrink-0">
            {event.userHandle}
          </span>
          <span className="text-slate-500 truncate hidden sm:inline">
            {event.actionKm} ({event.actionEn})
          </span>
          <span className="text-slate-500 truncate sm:hidden">
            {event.actionKm}
          </span>
        </div>
      </div>

      {/* Claim Reward Pill */}
      <div className="flex items-center gap-1 pl-2 flex-shrink-0">
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black font-mono">
          {event.rewardText}
        </span>
        <span className="text-[10px] font-medium text-slate-400 hidden xs:inline">
          {event.timeAgoKm}
        </span>
      </div>
    </div>
  );
};
