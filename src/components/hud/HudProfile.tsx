"use client";

import React from "react";
import Image from "next/image";
import { TelegramUser } from "@/types/telegram";
import { User, ShieldCheck, Sparkles, Copy, Check } from "lucide-react";

interface HudProfileProps {
  user: TelegramUser | null;
  theme?: "cyan" | "amber";
  onCopyId?: () => void;
  copiedId?: boolean;
}

export const HudProfile: React.FC<HudProfileProps> = ({
  user,
  theme = "cyan",
  onCopyId,
  copiedId = false,
}) => {
  const isCyan = theme === "cyan";
  const primaryColor = isCyan ? "#00f0ff" : "#ffb800";
  const textColor = isCyan ? "text-cyan-400" : "text-amber-400";
  const borderColor = isCyan ? "border-cyan-500/50" : "border-amber-500/50";
  const bgGlow = isCyan ? "bg-cyan-500/10" : "bg-amber-500/10";

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "TELEGRAM USER";

  const username = user?.username ? `@${user.username}` : "NO_USERNAME";
  const userId = user?.id ? String(user.id) : "DISCONNECTED";

  return (
    <div className="relative">
      {/* Outer Top Profile Bracket Box (Matches person icon box in reference image) */}
      <div className="flex items-start gap-3">
        {/* Avatar Frame with chamfered cut corners */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-14 h-14 rounded-md overflow-hidden relative border ${borderColor} ${bgGlow} flex items-center justify-center`}
            style={{
              clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
            }}
          >
            {user?.photo_url ? (
              <Image
                src={user.photo_url}
                alt={fullName}
                width={56}
                height={56}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <User className={`w-7 h-7 ${textColor} opacity-80`} />
            )}

            {/* Scanning line animation inside avatar */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scan-line pointer-events-none" />
          </div>

          {/* Micro status indicator */}
          <div
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#070a10] flex items-center justify-center"
            style={{ backgroundColor: user ? "#00ff88" : "#ff4444" }}
          />
        </div>

        {/* Profile Details (Matches text box beside person icon in image) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-sm font-bold text-white truncate tracking-wide">
              {fullName}
            </h3>
            {user?.is_premium && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Sparkles className="w-2.5 h-2.5" />
                PREMIUM
              </span>
            )}
          </div>

          <p className="text-xs font-mono text-slate-400 truncate mt-0.5">
            {username}
          </p>

          {/* ID readout with copy button */}
          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono">
            <span className="text-slate-500">ID:</span>
            <span className={`${textColor} font-semibold`}>{userId}</span>
            {user?.id && onCopyId && (
              <button
                type="button"
                onClick={onCopyId}
                className="text-slate-400 hover:text-white transition-colors p-0.5"
                title="Copy Telegram ID"
              >
                {copiedId ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification status pill */}
      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>TG OWNER SYNCHRONIZED</span>
        </span>
        <span className="text-emerald-400 font-semibold tracking-wider">
          AUTHENTICATED
        </span>
      </div>
    </div>
  );
};
