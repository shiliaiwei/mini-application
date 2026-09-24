"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { TelegramListGroup, TelegramListItem } from "@/components/common/TelegramListGroup";
import {
  BarChart3,
  History,
  Users,
  Database,
  ShieldCheck,
  Sparkles,
  Zap,
  Share2,
  Copy,
  Check,
} from "lucide-react";

interface HomeViewProps {
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
  onNavigate: (tab: "database" | "settings" | "profile") => void;
  dbOnline?: boolean;
  onTriggerHaptic: (style: "light" | "medium" | "heavy") => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  tgApp,
  onNavigate,
  dbOnline = true,
  onTriggerHaptic,
}) => {
  const [copied, setCopied] = useState(false);

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "Telegram User";

  const handleCopy = () => {
    if (user?.id) {
      navigator.clipboard.writeText(String(user.id));
      setCopied(true);
      onTriggerHaptic("light");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    onTriggerHaptic("medium");
    if (tgApp?.openTelegramLink) {
      tgApp.openTelegramLink(
        "https://t.me/share/url?url=" +
          encodeURIComponent("https://t.me/srievibot/app") +
          "&text=" +
          encodeURIComponent("Open this Telegram Mini App!")
      );
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top User Profile Liquid Glass Card */}
      <div className="liquid-glass-card rounded-2xl p-4 relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5">
          {/* Avatar with rounded squircle */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-white/15 flex items-center justify-center shadow-lg">
              {user?.photo_url ? (
                <Image
                  src={user.photo_url}
                  alt={fullName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Online Green Indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#161f2e]" />
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h2 className="text-base font-bold text-white truncate">
                {fullName}
              </h2>
              {user?.is_premium && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  PREMIUM
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 truncate mt-0.5">
              {user?.username ? `@${user.username}` : "Verified Telegram Owner"}
            </p>

            {/* ID & Copy */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span>ID: <strong className="text-slate-200">{user?.id || "LINKED"}</strong></span>
              {user?.id && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 hover:text-white transition-colors"
                  title="Copy ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-medium">Telegram Owner Auto-Synced</span>
          </div>
          <span className="text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
            {tgApp?.platform || "Mobile"}
          </span>
        </div>
      </div>

      {/* Grouped Telegram List Items (matches user uploaded Image 2) */}
      <TelegramListGroup title="Menu & Insights">
        <TelegramListItem
          icon={<BarChart3 className="w-5 h-5" />}
          iconBgClass="squircle-green"
          title="Analytics"
          subtitle="Real-time Mini App session telemetry"
          onClick={() => {
            onTriggerHaptic("light");
          }}
        />

        <TelegramListItem
          icon={<History className="w-5 h-5" />}
          iconBgClass="squircle-purple"
          title="My activity"
          subtitle="Telegram owner interaction logs"
          onClick={() => {
            onTriggerHaptic("light");
          }}
        />

        <TelegramListItem
          icon={<Users className="w-5 h-5" />}
          iconBgClass="squircle-pink"
          title="Invite friends"
          subtitle="Share bot & Mini App with contacts"
          onClick={handleShare}
        />
      </TelegramListGroup>

      {/* Connected Database Quick Card */}
      <TelegramListGroup title="Connected Infrastructure">
        <TelegramListItem
          icon={<Database className="w-5 h-5" />}
          iconBgClass="squircle-sky"
          title="Encrypted Cloud Database"
          subtitle="SHILIAIWEI Secure Vault"
          badge={
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                dbOnline
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {dbOnline ? "ONLINE" : "CONNECTING"}
            </span>
          }
          onClick={() => {
            onTriggerHaptic("medium");
            onNavigate("database");
          }}
        />
      </TelegramListGroup>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleShare}
          className="liquid-glass-card rounded-2xl py-3 px-3 flex items-center justify-center gap-2 text-sm font-semibold text-sky-400 active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Share Mini App
        </button>

        <button
          type="button"
          onClick={() => onTriggerHaptic("heavy")}
          className="liquid-glass-card rounded-2xl py-3 px-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-200 active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          Haptic Pulse
        </button>
      </div>
    </div>
  );
};
