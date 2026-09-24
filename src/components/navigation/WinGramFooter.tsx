"use client";

import React from "react";
import { Gem, Send, ArrowUp, Globe, MessageSquare } from "lucide-react";

interface WinGramFooterProps {
  onScrollToTop?: () => void;
  onOpenSupport?: () => void;
}

export const WinGramFooter: React.FC<WinGramFooterProps> = ({
  onScrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  onOpenSupport,
}) => {
  return (
    <footer className="bg-white/80 backdrop-blur-xl border-t border-slate-200/90 mt-8 pb-16 px-4 text-slate-500 text-xs font-body select-none">
      {/* Rings Banknote Security Guilloche Border Strip (103345550116.webp) */}
      <div className="w-full h-3 border-strip-rings opacity-80 mb-6" />

      <div className="max-w-xl mx-auto space-y-6">
        {/* Brand Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0098ea] flex items-center justify-center text-white shadow-sm">
              <Gem className="w-4 h-4 fill-white" />
            </div>
            <span className="text-base font-black tracking-wider text-slate-900 font-sans uppercase">
              SHILIAIWEI
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-sm">
            <Globe className="w-3.5 h-3.5 text-[#0098ea]" />
            <span>English</span>
          </div>
        </div>

        {/* 4 Navigation Link Columns */}
        <div className="grid grid-cols-4 gap-3 text-[11px] pt-2">
          <div className="space-y-2">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
              Support
            </span>
            <ul className="space-y-1.5 text-slate-500">
              <li className="hover:text-slate-900 cursor-pointer">Technical</li>
              <li className="hover:text-slate-900 cursor-pointer">Security</li>
              <li className="hover:text-slate-900 cursor-pointer">Affiliates</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
              Information
            </span>
            <ul className="space-y-1.5 text-slate-500">
              <li className="hover:text-slate-900 cursor-pointer">Rules</li>
              <li className="hover:text-slate-900 cursor-pointer">Tournaments</li>
              <li className="hover:text-slate-900 cursor-pointer">Bonuses</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
              Vault
            </span>
            <ul className="space-y-1.5 text-slate-500">
              <li className="hover:text-slate-900 cursor-pointer">Tap Earn</li>
              <li className="hover:text-slate-900 cursor-pointer">DEX Swap</li>
              <li className="hover:text-slate-900 cursor-pointer">Holders</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
              Ecosystem
            </span>
            <ul className="space-y-1.5 text-slate-500">
              <li className="hover:text-slate-900 cursor-pointer">Telegram Bot</li>
              <li className="hover:text-slate-900 cursor-pointer">Mini App</li>
              <li className="hover:text-slate-900 cursor-pointer">Web3 L2</li>
            </ul>
          </div>
        </div>

        {/* Support 24/7 Card (WinGram Style Mascot Card) */}
        <div className="p-4 rounded-2xl liquid-glass border border-slate-200/90 flex items-center justify-between gap-3 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#0098ea]/15 px-2 py-0.5 rounded-full text-[10px] text-[#0098ea] font-bold">
              <span>Support</span>
              <span className="bg-[#0098ea] text-white px-1 rounded text-[9px]">24/7</span>
            </div>
            <p className="text-xs text-slate-900 font-bold mt-1.5">
              Contact us if you have any questions
            </p>
            <button
              type="button"
              onClick={onOpenSupport}
              className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message</span>
            </button>
          </div>

          <div className="w-16 h-16 rounded-xl bg-[#0098ea] flex items-center justify-center text-white shadow-md">
            <Gem className="w-8 h-8 fill-white" />
          </div>
        </div>

        {/* Payment Badges & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
          {/* Crypto Tokens Badges */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <span className="w-6 h-6 rounded-full bg-[#0098ea] text-white flex items-center justify-center text-[10px] font-black">
              T
            </span>
            <span className="w-6 h-6 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-[10px] font-black">
              USDT
            </span>
            <span className="w-6 h-6 rounded-full bg-[#627eea] text-white flex items-center justify-center text-[10px] font-black">
              ETH
            </span>
            <span className="w-6 h-6 rounded-full bg-[#f7931a] text-white flex items-center justify-center text-[10px] font-black">
              BTC
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
              +20
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Scroll to Top Button */}
            <button
              type="button"
              onClick={onScrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>To the top</span>
            </button>

            {/* Telegram Community Button */}
            <a
              href="https://t.me/srievibot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-[#0098ea]" />
              <span>Telegram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
