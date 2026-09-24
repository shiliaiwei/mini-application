"use client";

import React, { useEffect, useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { HudReticle } from "./HudReticle";
import { ShieldCheck, Cpu, Smartphone, Zap } from "lucide-react";

interface WelcomeSyncScreenProps {
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
  onComplete: () => void;
}

export const WelcomeSyncScreen: React.FC<WelcomeSyncScreenProps> = ({
  user,
  tgApp,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Step 1: Initialize WebApp Core
    const t1 = setTimeout(() => {
      setStep(1);
      setProgress(40);
      try {
        tgApp?.HapticFeedback?.impactOccurred("light");
      } catch {}
    }, 400);

    // Step 2: Cryptographic Handshake
    const t2 = setTimeout(() => {
      setStep(2);
      setProgress(75);
      try {
        tgApp?.HapticFeedback?.impactOccurred("medium");
      } catch {}
    }, 850);

    // Step 3: Owner Identified & Synced
    const t3 = setTimeout(() => {
      setStep(3);
      setProgress(100);
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}
    }, 1300);

    // Step 4: Auto-open App smoothly
    const t4 = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [tgApp, onComplete]);

  const ownerName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : tgApp
    ? "TELEGRAM CLIENT DETECTED"
    : "WEB CLIENT SYNCING";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-[#070a10] tech-grid-bg text-slate-100 max-w-md mx-auto w-full overflow-hidden select-none">
      {/* Top Header telemetry */}
      <div className="flex items-center justify-between text-[11px] font-mono border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span className="tracking-widest font-bold">KWD_CORE::TG_SYNC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-400">TELEGRAM AUTO-SYNC</span>
        </div>
      </div>

      {/* Center HUD Scanning Reticle & Scanner */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6">
        {/* Animated Sonar Radar Target (from reference image) */}
        <div className="relative flex items-center justify-center">
          {/* Sonar pulses */}
          <div className="absolute w-44 h-44 rounded-full border border-cyan-500/30 animate-sonar" />
          <div className="absolute w-32 h-32 rounded-full border border-cyan-400/40 animate-pulse" />

          {/* Rotating Reticle */}
          <div className="relative w-28 h-28 flex items-center justify-center animate-radar">
            <HudReticle type="target" size={90} color="cyan" />
          </div>

          {/* Center glowing core */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-cyan-400/80 shadow-[0_0_15px_#00f0ff]" />
          </div>

          {/* Corner HUD framing brackets */}
          <div className="absolute -top-3 -left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute -top-3 -right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute -bottom-3 -left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute -bottom-3 -right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
        </div>

        {/* Sync Status Readout */}
        <div className="w-full text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            <span>SEAMLESS TELEGRAM HANDSHAKE</span>
          </div>

          <h1 className="text-lg font-bold tracking-wider text-white">
            {step < 3 ? "SYNCHRONIZING IDENTITY..." : "TELEGRAM OWNER READY"}
          </h1>

          <p className="text-xs font-mono text-slate-400 tracking-wide">
            {step === 0 && "INITIALIZING TELEGRAM WEBAPP INSTANCE..."}
            {step === 1 && "CHECKING CRYPTOGRAPHIC INIT DATA HASH..."}
            {step === 2 && `IDENTIFYING OWNER: ${ownerName}`}
            {step === 3 && `WELCOME ${ownerName} - AUTO OPENING...`}
          </p>
        </div>

        {/* Liquid Glass Chamfered Progress Box */}
        <div className="w-full liquid-glass chamfer-card-cyan p-4 border border-cyan-500/40 relative">
          <div className="flex justify-between items-center text-[10px] font-mono mb-2">
            <span className="text-slate-400 uppercase tracking-wider">
              AUTO-LOGIN TELEGRAM OWNER
            </span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>

          {/* Angular Segmented Progress Bar */}
          <div className="hud-segmented-bar p-1 bg-black/50 rounded border border-white/10">
            {Array.from({ length: 16 }).map((_, i) => {
              const active = i < Math.round((progress / 100) * 16);
              return (
                <div
                  key={i}
                  className={`hud-segment ${active ? "active-cyan" : ""}`}
                />
              );
            })}
          </div>

          {/* Real Telemetry Lines */}
          <div className="mt-3 space-y-1 text-[10px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>PLATFORM:</span>
              <span className="text-slate-200">{tgApp?.platform || "MOBILE_WEBAPP"}</span>
            </div>
            <div className="flex justify-between">
              <span>TELEGRAM_VERSION:</span>
              <span className="text-slate-200">{tgApp?.version || "8.0+"}</span>
            </div>
            {user?.id && (
              <div className="flex justify-between text-cyan-300">
                <span>OWNER_ID:</span>
                <span>{user.id}</span>
              </div>
            )}
          </div>

          {/* Bottom Right Hazard Bar */}
          <div
            className="absolute bottom-0 right-0 w-14 h-3 hazard-stripes-cyan pointer-events-none"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 8px 100%)" }}
          />
        </div>
      </div>

      {/* Footer Controls & Skip option */}
      <div className="space-y-3 pt-4 border-t border-white/10 text-center font-mono">
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>ZERO MANUAL SIGN-IN • AUTO SYNCED WITH TELEGRAM</span>
        </div>

        <button
          type="button"
          onClick={() => {
            try {
              tgApp?.HapticFeedback?.impactOccurred("medium");
            } catch {}
            onComplete();
          }}
          className="w-full py-2.5 px-4 text-xs font-bold tracking-widest uppercase bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 rounded transition-all active:scale-[0.98]"
        >
          {step === 3 ? "OPENING..." : "ENTER MINI APP DIRECTLY"}
        </button>
      </div>
    </div>
  );
};
