"use client";

import React from "react";
import { Smartphone, Send, ExternalLink } from "lucide-react";

interface TelegramGateScreenProps {
  onBypass: () => void;
}

export const TelegramGateScreen: React.FC<TelegramGateScreenProps> = ({
  onBypass,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-[#080c0a] text-white max-w-md mx-auto w-full select-none font-mono">
      {/* Top Banner */}
      <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-[#233827] pb-3">
        <span className="text-lime-400 font-bold uppercase">TELEGRAM GAME CORE</span>
        <span className="text-[10px] bg-[#16211b] border border-[#233827] px-2 py-0.5 rounded text-neutral-300">
          MOBILE ONLY
        </span>
      </div>

      {/* Center Prompt */}
      <div className="my-auto text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#111914] border-2 border-lime-400 mx-auto flex items-center justify-center text-lime-400 shadow-xl">
          <Smartphone className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-black text-white uppercase tracking-wider">
            Telegram Mobile Only
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
            This tap-to-earn game is designed exclusively for Telegram mobile devices to ensure accurate haptic response and secure account sync.
          </p>
        </div>

        {/* Telegram Action Button */}
        <div className="pt-2 space-y-2">
          <a
            href="https://t.me/srievibot/app"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            Open in Telegram (@srievibot)
          </a>

          <button
            type="button"
            onClick={onBypass}
            className="w-full py-2.5 px-3 rounded-xl bg-[#111914] border border-[#233827] text-neutral-400 hover:text-white text-[11px] uppercase tracking-wider transition-colors"
          >
            Continue in Browser Preview
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-neutral-500 pt-3 border-t border-[#233827]">
        BOT ON TELEGRAM CONCEPT • 1 TAP = 1 POINT
      </div>
    </div>
  );
};
