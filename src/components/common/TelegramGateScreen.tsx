"use client";

import React from "react";
import { Smartphone, Send, AlertCircle } from "lucide-react";

export const TelegramGateScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 guilloche-bg bg-white text-slate-900 max-w-md mx-auto w-full select-none font-body">
      {/* Top Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-3">
        <span className="text-lime-700 font-bold uppercase tracking-wider">@srievibot</span>
        <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold">
          TELEGRAM REQUIRED
        </span>
      </div>

      {/* Center Notice */}
      <div className="my-auto text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-white border-2 border-lime-700 mx-auto flex items-center justify-center text-lime-700 shadow-xl">
          <Smartphone className="w-10 h-10" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider font-display">
            Telegram Sync Required
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            Only users synchronized with Telegram can play this game and record points on the global leaderboard.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center gap-2 text-lime-700 font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>HOW TO PLAY:</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            1. Open Telegram on your mobile device.<br />
            2. Search for <strong className="text-slate-900">@srievibot</strong>.<br />
            3. Tap the bottom-left <strong className="text-slate-900">Open App</strong> button.<br />
            4. Your Telegram account will sync automatically.
          </p>
        </div>

        {/* Telegram Action Button */}
        <div className="pt-2">
          <a
            href="https://t.me/srievibot/app"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-lime-700 hover:bg-lime-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
            Open in Telegram (@srievibot)
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-200 uppercase font-semibold">
        REAL TELEGRAM IDENTITY • REAL-TIME LEADERBOARD
      </div>
    </div>
  );
};
