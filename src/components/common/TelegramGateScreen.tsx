"use client";

import React from "react";
import { Smartphone, Send, AlertCircle } from "lucide-react";

export const TelegramGateScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-[#080c0a] text-white max-w-md mx-auto w-full select-none font-mono">
      {/* Top Banner */}
      <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-[#233827] pb-3">
        <span className="text-lime-400 font-bold uppercase">@srievibot</span>
        <span className="text-[10px] bg-[#16211b] border border-[#233827] px-2 py-0.5 rounded text-neutral-300">
          TELEGRAM REQUIRED
        </span>
      </div>

      {/* Center Notice */}
      <div className="my-auto text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#111914] border-2 border-lime-400 mx-auto flex items-center justify-center text-lime-400 shadow-xl">
          <Smartphone className="w-10 h-10" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-lg font-black text-white uppercase tracking-wider">
            Telegram Sync Required
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
            Only users synchronized with Telegram can play this game and record points on the global leaderboard.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#111914] border border-[#233827] text-left text-xs text-neutral-300 space-y-1.5">
          <div className="flex items-center gap-2 text-lime-400 font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>HOW TO PLAY:</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-normal">
            1. Open Telegram on your mobile device.<br />
            2. Search for <strong className="text-white">@srievibot</strong>.<br />
            3. Tap the bottom-left <strong className="text-white">Open App</strong> button.<br />
            4. Your Telegram account will sync automatically.
          </p>
        </div>

        {/* Telegram Action Button */}
        <div className="pt-2">
          <a
            href="https://t.me/srievibot/app"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            Open in Telegram (@srievibot)
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-neutral-500 pt-3 border-t border-[#233827]">
        REAL TELEGRAM IDENTITY • REAL-TIME LEADERBOARD
      </div>
    </div>
  );
};
