"use client";

import React from "react";
import { Smartphone, Send, AlertCircle } from "lucide-react";

interface TelegramGateScreenProps {
  onBypass?: () => void;
}

export const TelegramGateScreen: React.FC<TelegramGateScreenProps> = ({ onBypass }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 app-bg-white text-slate-900 max-w-md mx-auto w-full select-none font-body relative overflow-hidden">
      {/* Flowing Vertical Banknote Security Ribbon (ca18d734-2fb8-483c-8a5a-a4ea71fcb4cf.webp) */}
      <div className="absolute inset-0 bg-security-ribbon opacity-[0.05] pointer-events-none z-0" />

      {/* Top Banner */}
      <div className="relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
          <span className="text-[#0098ea] font-bold uppercase tracking-wider">@srievibot</span>
          <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-semibold">
            TELEGRAM VERIFICATION
          </span>
        </div>
        {/* Flower Banknote Security Strip (1033454350116.webp) */}
        <div className="w-full h-2 border-strip-flower opacity-70 border-b border-slate-200/80" />
      </div>

      {/* Center Notice */}
      <div className="my-auto text-center space-y-4 relative z-10">
        <div className="w-20 h-20 rounded-full bg-white border-2 border-[#0098ea] mx-auto flex items-center justify-center text-[#0098ea] shadow-lg relative overflow-hidden">
          {/* Radial Rosette Watermark (7168912.webp) */}
          <div className="absolute inset-0 bg-security-sunburst opacity-30 pointer-events-none" />
          <Smartphone className="w-10 h-10 relative z-10" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider font-display">
            Telegram Vault Sync Required
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Connect via official @srievibot on Telegram to mint simulated assets and record your standing on the global wealth leaderboard.
          </p>
        </div>

        <div className="p-3.5 rounded-xl liquid-glass border border-slate-200/90 text-left text-xs text-slate-700 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-[#0098ea] font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>ACCESS INSTRUCTIONS:</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            1. Open Telegram on your mobile or desktop device.<br />
            2. Launch <strong className="text-slate-900">@srievibot</strong> and tap the <strong className="text-slate-900">Open App</strong> button.<br />
            3. Your wallet identity and ledger balances sync automatically.
          </p>
        </div>

        {/* Telegram Action Buttons */}
        <div className="pt-2 space-y-2">
          <a
            href="https://t.me/srievibot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-[#0098ea] hover:bg-[#0088cc] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
            Open in Telegram (@srievibot)
          </a>

          {onBypass && (
            <button
              type="button"
              onClick={onBypass}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs tracking-wider transition-colors shadow-sm"
            >
              Continue in Browser Preview Mode
            </button>
          )}
        </div>
      </div>

      {/* Footer System Brand */}
      <div className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-widest border-t border-slate-200 pt-3">
        SHILIAIWEI PROTOCOL • END-TO-END ENCRYPTED
      </div>
    </div>
  );
};
