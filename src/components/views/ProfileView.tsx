"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { TelegramListGroup, TelegramListItem } from "@/components/common/TelegramListGroup";
import {
  User,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Globe,
  Smartphone,
  Share2,
  Lock,
} from "lucide-react";

interface ProfileViewProps {
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
  onTriggerHaptic: (style: "light" | "medium" | "heavy") => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  tgApp,
  onTriggerHaptic,
}) => {
  const [copied, setCopied] = useState(false);

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "Telegram User";

  const handleCopyId = () => {
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
          encodeURIComponent(`Join me on @srievibot Mini App!`)
      );
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Card */}
      <div className="liquid-glass-card rounded-2xl p-5 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Big Squircle Avatar */}
        <div className="relative inline-block mx-auto mb-3">
          <div className="w-20 h-20 rounded-3xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-2xl mx-auto flex items-center justify-center">
            {user?.photo_url ? (
              <Image
                src={user.photo_url}
                alt={fullName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Premium Badge Icon */}
          {user?.is_premium && (
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-[#161f2e]">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <h2 className="text-lg font-bold text-white tracking-tight">
          {fullName}
        </h2>
        <p className="text-xs text-sky-400 font-mono mt-0.5">
          {user?.username ? `@${user.username}` : "Verified Telegram Account"}
        </p>

        {/* Telegram ID pill */}
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs">
          <span className="text-slate-400 font-mono">TG ID:</span>
          <span className="font-mono font-bold text-white">{user?.id || "N/A"}</span>
          {user?.id && (
            <button
              type="button"
              onClick={handleCopyId}
              className="text-slate-400 hover:text-white transition-colors"
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

      {/* Account Info Groups */}
      <TelegramListGroup title="Account Telemetry">
        <TelegramListItem
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBgClass="squircle-green"
          title="Authentication"
          subtitle="Auto-synced via Telegram initData"
          showChevron={false}
        />

        <TelegramListItem
          icon={<Globe className="w-5 h-5" />}
          iconBgClass="squircle-blue"
          title="Language"
          subtitle={user?.language_code ? `Language code: ${user.language_code.toUpperCase()}` : "Auto"}
          showChevron={false}
        />

        <TelegramListItem
          icon={<Smartphone className="w-5 h-5" />}
          iconBgClass="squircle-purple"
          title="Client Platform"
          subtitle={tgApp?.platform || "Telegram Mobile"}
          showChevron={false}
        />

        <TelegramListItem
          icon={<Lock className="w-5 h-5" />}
          iconBgClass="squircle-indigo"
          title="Data Privacy"
          subtitle="Zero third-party cookies • Zero passwords stored"
          showChevron={false}
        />
      </TelegramListGroup>

      {/* Actions */}
      <button
        type="button"
        onClick={handleShare}
        className="w-full py-3.5 px-4 rounded-2xl liquid-glass-card text-sky-400 font-semibold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
      >
        <Share2 className="w-4 h-4" />
        Share My Referral Link
      </button>
    </div>
  );
};
