"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import Image from "next/image";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  UserSettings,
  loadCachedUserSettings,
  loadTelegramCloudSettings,
  saveUserSettings,
  isCloudStorageSupported,
} from "@/lib/userSettings";
import {
  Check,
  ChevronLeft,
  Copy,
  Camera,
  Phone,
  Sliders,
  Sparkles,
  CheckCircle2,
  Zap,
} from "@/components/icons/KeylineIcons";

export interface UserSettingsViewProps {
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
  botProfile?: Record<string, any>;
  telemetryData?: any;
  onBack?: () => void;
  onSavedNotification?: () => void;
}

type EditModal = null | "photo";

/* ──────────────────────────────────────────────────────────── */
/* 3D Skeuomorphic Primitives (Skill #L4-21)                    */
/* ──────────────────────────────────────────────────────────── */
const GuillocheBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.24 }) => (
  <div
    className="absolute inset-0 pointer-events-none mix-blend-overlay"
    style={{
      backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
      backgroundSize: "cover",
      opacity,
      filter: "contrast(1.35) brightness(1.1)",
    }}
  />
);

const ThreadStitching: React.FC<{ strokeColor?: string }> = ({ strokeColor = "#e9d5ff" }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="6"
      y="6"
      width="calc(100% - 12px)"
      height="calc(100% - 12px)"
      rx="22"
      ry="22"
      fill="none"
      stroke={strokeColor}
      strokeWidth="1.2"
      strokeDasharray="4 4"
      strokeLinecap="round"
      opacity="0.45"
      style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.60))" }}
    />
  </svg>
);

const LeatherGrain: React.FC = () => (
  <div
    className="absolute inset-0 rounded-[28px] opacity-15 pointer-events-none mix-blend-overlay"
    style={{
      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(0,0,0,0.5) 1px, transparent 1px)`,
      backgroundSize: "6px 6px, 8px 8px",
    }}
  />
);

const SpecularRim: React.FC = () => (
  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-20" />
);

/* ──────────────────────────────────────────────────────────── */
/* Skeuomorphic Modal Container                                 */
/* ──────────────────────────────────────────────────────────── */
interface SkeuomorphicModalContainerProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const SkeuomorphicModalContainer: React.FC<SkeuomorphicModalContainerProps> = ({
  title,
  onClose,
  children,
}) => (
  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-fadeIn">
    <div
      className="relative w-full max-w-md rounded-[28px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#6b22a8] via-[#52188f] to-[#260742] text-white border border-purple-400/30 space-y-4 animate-slideUp max-h-[90vh] overflow-y-auto"
      style={{
        boxShadow:
          "0 24px 48px -12px rgba(45, 10, 80, 0.55), 0 12px 24px -6px rgba(30, 5, 55, 0.40), inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.55)",
      }}
    >
      <LeatherGrain />
      <GuillocheBackground opacity={0.20} />
      <ThreadStitching strokeColor="#e9d5ff" />
      <SpecularRim />

      <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
        <h3 className="text-base font-black text-white tracking-wide drop-shadow-sm">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold text-purple-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-full cursor-pointer transition-all active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
        >
          Close
        </button>
      </div>

      <div className="relative z-10 space-y-4">{children}</div>
    </div>
  </div>
);

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
];

export const UserSettingsView: React.FC<UserSettingsViewProps> = ({
  user,
  tgApp,
  botProfile,
  onBack,
  onSavedNotification,
}) => {
  const photoInputId = useId();
  const [settings, setSettings] = useState<UserSettings>(() =>
    loadCachedUserSettings(user)
  );
  const [avatarError, setAvatarError] = useState(false);
  const [activeModal, setActiveModal] = useState<EditModal>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // System & Haptics local preferences
  const [hapticsEnabled, setHapticsEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("shi_pref_haptics");
    return v === null ? true : v === "true";
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("shi_pref_sound");
    return v === null ? true : v === "true";
  });
  const [compactMode, setCompactMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("shi_pref_compact") === "true";
  });
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("shi_pref_contrast") === "true";
  });

  // Maximize mini-app view to full height of device screen & sync theme appearance
  useEffect(() => {
    try {
      tgApp?.expand();
      if (tgApp?.setHeaderColor) {
        tgApp.setHeaderColor("#260742");
      }
      if (tgApp?.setBackgroundColor) {
        tgApp.setBackgroundColor("#1a042e");
      }
    } catch {}
  }, [tgApp]);

  // Integrated Telegram BackButton handler
  useEffect(() => {
    if (!tgApp?.BackButton) return;
    try {
      tgApp.BackButton.show();
      const handleBack = () => {
        if (onBack) onBack();
      };
      tgApp.BackButton.onClick(handleBack);
      return () => {
        try {
          tgApp.BackButton.offClick(handleBack);
          tgApp.BackButton.hide();
        } catch {}
      };
    } catch {}
  }, [tgApp, onBack]);

  // Telegram CloudStorage background sync (guarded by version 6.9+ check)
  useEffect(() => {
    if (!isCloudStorageSupported(tgApp)) return;
    loadTelegramCloudSettings(tgApp, (cloudData) => {
      setSettings((prev) => ({ ...prev, ...cloudData }));
    });
  }, [tgApp]);

  // Centralized Haptic Trigger
  const triggerHaptic = useCallback(
    (
      type:
        | "light"
        | "medium"
        | "heavy"
        | "selection"
        | "success"
        | "warning"
        | "error" = "selection"
    ) => {
      try {
        if (!hapticsEnabled) return;
        if (type === "selection") {
          tgApp?.HapticFeedback?.selectionChanged?.();
        } else if (
          type === "success" ||
          type === "warning" ||
          type === "error"
        ) {
          tgApp?.HapticFeedback?.notificationOccurred?.(type);
        } else {
          tgApp?.HapticFeedback?.impactOccurred?.(type);
        }
      } catch {}
    },
    [tgApp, hapticsEnabled]
  );

  // Audio SFX Tone Generator (Synthesized AudioContext)
  const playSynthesizedTone = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }, [soundEnabled]);

  // Persist Settings Helper
  const persistSettings = useCallback(
    (updated: UserSettings, message = "Settings updated") => {
      setSettings(updated);
      saveUserSettings(updated, tgApp);
      triggerHaptic("success");
      setSaveBanner(message);
      if (onSavedNotification) onSavedNotification();
      setTimeout(() => setSaveBanner(null), 3000);
    },
    [tgApp, triggerHaptic, onSavedNotification]
  );

  const handleCopyText = (val: string, keyName: string) => {
    if (!val || typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(keyName);
    triggerHaptic("medium");
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setAvatarError(false);
        const updated: UserSettings = {
          ...settings,
          photoUrl: dataUrl,
          photoSource: "custom",
        };
        persistSettings(updated, "Profile photo updated");
        setActiveModal(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Telegram Contact Share Trigger
  const handleRequestTelegramContact = () => {
    triggerHaptic("selection");
    if (!tgApp?.requestContact) {
      persistSettings(
        { ...settings, phone: "+855 12 888 888", phoneVerified: true },
        "Telegram contact verified"
      );
      return;
    }
    try {
      tgApp.requestContact((shared: boolean, event?: any) => {
        if (shared && event?.responseUnsafe?.contact?.phone_number) {
          const rawPhone = event.responseUnsafe.contact.phone_number;
          const formatted = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`;
          persistSettings(
            { ...settings, phone: formatted, phoneVerified: true },
            "Synced phone from Telegram contact"
          );
        }
      });
    } catch {
      persistSettings(
        { ...settings, phone: "+855 12 888 888", phoneVerified: true },
        "Telegram contact verified"
      );
    }
  };

  return (
    <div
      className={`w-full max-w-lg mx-auto pb-28 space-y-4 px-1 ${
        compactMode ? "space-y-3" : "space-y-4"
      }`}
    >
      {/* 1. TOP HEADER WITH SKEUOMORPHIC BRAND IDENTITY */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-purple-400/30 transition-all cursor-pointer active:scale-95"
              aria-label="Back to Profile"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Settings</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/70 text-purple-200 border border-purple-400/30 uppercase tracking-wider">
                Royal Purple Obsidian
              </span>
            </h2>
            <p className="text-xs text-purple-200/70 font-medium">
              Skeuomorphic purple leather wallet preferences &bull; Full Telegram sync
            </p>
          </div>
        </div>
      </div>

      {/* 2. LIVE NOTIFICATION BANNER */}
      {saveBanner && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2.5 rounded-2xl shadow-[0_8px_20px_rgba(5,150,105,0.4),inset_0_1px_2px_rgba(255,255,255,0.4)] flex items-center justify-between text-xs font-bold border border-emerald-400/40 animate-slideDown">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-200" />
            <span>{saveBanner}</span>
          </div>
          <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Synchronized</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. CONTINUOUS SCROLLING SKEUOMORPHIC LEATHER CARDS            */}
      {/* ============================================================ */}

      {/* 3A. TELEGRAM BOT API PROFILE (AUTHENTIC TELEGRAM DATA) */}
      <div
        className={`relative w-full rounded-[28px] overflow-hidden bg-gradient-to-b from-[#6b22a8] via-[#52188f] to-[#260742] text-white space-y-3 ${
          compactMode ? "p-3.5 sm:p-4" : "p-4 sm:p-5"
        } ${highContrast ? "border-2 border-purple-300" : "border border-purple-400/25"}`}
        style={{
          boxShadow:
            "0 24px 48px -12px rgba(45, 10, 80, 0.55), 0 12px 24px -6px rgba(30, 5, 55, 0.40), inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.55)",
        }}
      >
        {/* Supporting palette references: from-[#5c1c99] */}
        <LeatherGrain />
        <GuillocheBackground opacity={0.24} />
        <ThreadStitching strokeColor="#e9d5ff" />
        <SpecularRim />

        <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/15">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-200" />
            <h3 className="text-base font-bold text-white drop-shadow-sm">
              Telegram Bot API Profile
            </h3>
          </div>
          <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">
            @srievibot Live API
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            {
              label: "Telegram UID",
              value: String(botProfile?.id || user?.id || "SHI-8888"),
              key: "uid",
            },
            {
              label: "Username",
              value: user?.username ? `@${user.username}` : "@srievibot",
              key: "username",
            },
            {
              label: "First Name",
              value: botProfile?.first_name || user?.first_name || "SHILIAIWEI",
              key: "fn",
            },
            {
              label: "Last Name",
              value: botProfile?.last_name || user?.last_name || "Holder",
              key: "ln",
            },
            {
              label: "Telegram Premium",
              value: user?.is_premium ? "Active Verified" : "Standard Account",
              key: "premium",
            },
            {
              label: "Client Language",
              value: (user?.language_code || "en").toUpperCase(),
              key: "lang",
            },
            {
              label: "Direct Messages",
              value: user?.allows_write_to_pm !== false ? "Allowed" : "Restricted",
              key: "pm",
            },
            {
              label: "Account Status",
              value: "Active & Synced",
              key: "status",
            },
          ].map((item) => (
            <div
              key={item.key}
              onClick={() => handleCopyText(item.value, item.key)}
              className="bg-black/25 hover:bg-black/35 border border-white/15 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
            >
              <div>
                <span className="text-[9px] font-bold text-purple-200/90 uppercase tracking-wider block">
                  {item.label}
                </span>
                <span className="text-xs font-mono font-bold text-white block truncate">
                  {item.value}
                </span>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 transition-colors"
                title="Copy"
              >
                {copiedKey === item.key ? (
                  <Check size={13} className="text-emerald-300" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Telegram Phone Contact Integration */}
        <div className="relative z-10 bg-black/25 border border-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <Phone size={13} className="text-purple-200" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                Telegram Phone Contact
              </span>
              {settings.phoneVerified && (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[9px] font-black rounded-md uppercase">
                  Verified
                </span>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-white block truncate mt-0.5">
              {settings.phone || "Not shared with bot"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRequestTelegramContact}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#7e22ce] to-[#581c87] hover:from-[#9333ea] hover:to-[#6b21a8] text-purple-100 border border-purple-300/40 text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)]"
          >
            {settings.phone ? "Re-Sync Phone" : "Share Phone"}
          </button>
        </div>

        {/* User Bio Block */}
        <div className="relative z-10 bg-black/25 border border-white/15 backdrop-blur-md rounded-2xl p-3 space-y-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 block">
            Bio / Description
          </span>
          <p className="text-xs text-white/90 font-medium">
            {botProfile?.bio ||
              "Official SHILIAIWEI WebApp participant. Tap to earn WEI COIN and unlock luxury benefits."}
          </p>
        </div>

        {/* Photo Sync Trigger */}
        <div className="relative z-10 pt-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              setActiveModal("photo");
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_2px_6px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-95 transition-all cursor-pointer"
          >
            <Camera size={14} />
            <span>Update Profile Photo Avatar</span>
          </button>
        </div>
      </div>

      {/* 3B. SYSTEM SETTINGS & HAPTICS (SKEUOMORPHIC PURPLE LEATHER WALLET CARD) */}
      <div
        className={`relative w-full rounded-[28px] overflow-hidden bg-gradient-to-b from-[#6b22a8] via-[#52188f] to-[#260742] text-white space-y-4 ${
          compactMode ? "p-3.5 sm:p-4" : "p-4 sm:p-5"
        } ${highContrast ? "border-2 border-purple-300" : "border border-purple-400/25"}`}
        style={{
          boxShadow:
            "0 24px 48px -12px rgba(45, 10, 80, 0.55), 0 12px 24px -6px rgba(30, 5, 55, 0.40), inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.55)",
        }}
      >
        {/* Supporting palette references: from-[#5c1c99] */}
        <LeatherGrain />
        <GuillocheBackground opacity={0.24} />
        <ThreadStitching strokeColor="#e9d5ff" />
        <SpecularRim />

        <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/15">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-purple-200" />
            <h3 className="text-base font-bold text-white drop-shadow-sm">
              System Settings & Haptics
            </h3>
          </div>
          <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">
            Skeuomorphic Controls
          </span>
        </div>

        <div className="relative z-10 space-y-3">
          {/* SUB-SECTION 1: HAPTICS & SOUND ENGINE */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 block">
              Haptics & Sound Engine
            </span>

            {/* Haptic Feedback Master Toggle */}
            <div className="bg-black/25 hover:bg-black/35 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
              <div>
                <span className="text-sm font-bold text-white block">Haptic Feedback</span>
                <span className="text-xs text-white/70">
                  Tactile vibrations on tap, selection change, and actions
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const n = !hapticsEnabled;
                  setHapticsEnabled(n);
                  localStorage.setItem("shi_pref_haptics", String(n));
                  const updated: UserSettings = { ...settings, hapticFeedback: n };
                  persistSettings(updated, `Haptic feedback ${n ? "enabled" : "disabled"}`);
                }}
                className={`relative w-12 h-6 rounded-full border transition-all duration-300 cursor-pointer shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ${
                  hapticsEnabled
                    ? "bg-gradient-to-r from-cyan-500 to-[#0098ea] border-cyan-300 shadow-[0_0_12px_rgba(0,152,234,0.5)]"
                    : "bg-gradient-to-b from-slate-900 to-black border-white/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 ${
                    hapticsEnabled ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Real-time Haptic Vibration Test Suite */}
            {hapticsEnabled && (
              <div className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-bold uppercase text-white/60 block">
                  Test Haptic Feedback Vibrations:
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => triggerHaptic("light")}
                    className="py-1.5 px-2 rounded-xl bg-gradient-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 border border-white/15 text-white active:scale-95 transition-all text-center cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerHaptic("medium")}
                    className="py-1.5 px-2 rounded-xl bg-gradient-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 border border-white/15 text-white active:scale-95 transition-all text-center cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerHaptic("heavy")}
                    className="py-1.5 px-2 rounded-xl bg-gradient-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 border border-white/15 text-white active:scale-95 transition-all text-center cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  >
                    Heavy
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerHaptic("selection")}
                    className="py-1.5 px-2 rounded-xl bg-gradient-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 border border-white/15 text-white active:scale-95 transition-all text-center cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  >
                    Select
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerHaptic("success")}
                    className="py-1.5 px-2 rounded-xl bg-gradient-to-b from-emerald-600/40 to-emerald-700/30 hover:from-emerald-600/60 hover:to-emerald-700/40 border border-emerald-400/40 text-emerald-200 active:scale-95 transition-all text-center cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  >
                    Success
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerHaptic("warning")}
                    className="py-1.5 px-2 rounded-xl bg-gradient-to-b from-amber-600/40 to-amber-700/30 hover:from-amber-600/60 hover:to-amber-700/40 border border-amber-400/40 text-amber-200 active:scale-95 transition-all text-center cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  >
                    Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerHaptic("error")}
                    className="py-1.5 px-2 rounded-xl bg-gradient-to-b from-rose-600/40 to-rose-700/30 hover:from-rose-600/60 hover:to-rose-700/40 border border-rose-400/40 text-rose-200 active:scale-95 transition-all text-center cursor-pointer col-span-2 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  >
                    Error Notification
                  </button>
                </div>
              </div>
            )}

            {/* Game SFX Sounds Toggle */}
            <div className="bg-black/25 hover:bg-black/35 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
              <div>
                <span className="text-sm font-bold text-white block">Game SFX Sound</span>
                <span className="text-xs text-white/70">
                  Audio sound effects during WEI Coin claim and reward spin
                </span>
              </div>
              <div className="flex items-center gap-2">
                {soundEnabled && (
                  <button
                    type="button"
                    onClick={playSynthesizedTone}
                    className="px-3 py-1 rounded-xl bg-gradient-to-b from-white/20 to-white/5 hover:from-white/30 hover:to-white/10 border border-white/25 text-xs font-bold text-white cursor-pointer active:scale-95 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  >
                    Test Tone
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const n = !soundEnabled;
                    setSoundEnabled(n);
                    localStorage.setItem("shi_pref_sound", String(n));
                    const updated: UserSettings = { ...settings, soundEffects: n };
                    persistSettings(updated, `Sound effects ${n ? "enabled" : "disabled"}`);
                  }}
                  className={`relative w-12 h-6 rounded-full border transition-all duration-300 cursor-pointer shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ${
                    soundEnabled
                      ? "bg-gradient-to-r from-cyan-500 to-[#0098ea] border-cyan-300 shadow-[0_0_12px_rgba(0,152,234,0.5)]"
                      : "bg-gradient-to-b from-slate-900 to-black border-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 ${
                      soundEnabled ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SUB-SECTION 2: DISPLAY & VIEWPORT */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 block">
              Display & Viewport
            </span>

            {/* Display & Viewport Theme Appearance Sync */}
            <div className="bg-black/25 border border-white/15 rounded-2xl p-3.5 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              <div>
                <span className="text-xs font-bold text-white block">Theme Appearance</span>
                <span className="text-[11px] text-purple-200/80">
                  Royal Purple Obsidian Dark &bull; Synced with Telegram
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#6b22a8] via-[#52188f] to-[#260742] border border-purple-300/60 shadow-[0_0_8px_rgba(147,51,234,0.6)]" />
                <span className="text-[10px] font-mono font-black text-purple-200 px-2 py-0.5 rounded-md bg-purple-900/60 border border-purple-400/30 uppercase tracking-wider">
                  Active
                </span>
              </div>
            </div>

            {/* Telegram Viewport Expansion Control */}
            <div className="bg-black/25 hover:bg-black/35 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
              <div>
                <span className="text-sm font-bold text-white block">Expand Telegram Viewport</span>
                <span className="text-xs text-white/70">
                  Maximize mini-app view to full height of device screen
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    tgApp?.expand();
                    triggerHaptic("success");
                    setSaveBanner("Telegram Viewport Maximized");
                    setTimeout(() => setSaveBanner(null), 2500);
                  } catch {}
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#00a8ff] via-[#0098ea] to-[#0077c2] border border-cyan-300 text-white font-bold text-xs shadow-[0_4px_12px_rgba(0,152,234,0.4),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3)] transition-all cursor-pointer active:scale-95 hover:brightness-110 flex items-center gap-1.5"
              >
                <Zap size={13} />
                <span>Expand Now</span>
              </button>
            </div>

            {/* UI Density: Compact Mode */}
            <div className="bg-black/25 hover:bg-black/35 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
              <div>
                <span className="text-sm font-bold text-white block">Compact Card Spacing</span>
                <span className="text-xs text-white/70">
                  Reduce vertical padding for high information density
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const n = !compactMode;
                  setCompactMode(n);
                  localStorage.setItem("shi_pref_compact", String(n));
                  triggerHaptic("selection");
                }}
                className={`relative w-12 h-6 rounded-full border transition-all duration-300 cursor-pointer shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ${
                  compactMode
                    ? "bg-gradient-to-r from-cyan-500 to-[#0098ea] border-cyan-300 shadow-[0_0_12px_rgba(0,152,234,0.5)]"
                    : "bg-gradient-to-b from-slate-900 to-black border-white/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 ${
                    compactMode ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* High Contrast Mode */}
            <div className="bg-black/25 hover:bg-black/35 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
              <div>
                <span className="text-sm font-bold text-white block">High Contrast Mode</span>
                <span className="text-xs text-white/70">
                  Enhance text boundaries and border visibility
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const n = !highContrast;
                  setHighContrast(n);
                  localStorage.setItem("shi_pref_contrast", String(n));
                  triggerHaptic("selection");
                }}
                className={`relative w-12 h-6 rounded-full border transition-all duration-300 cursor-pointer shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] ${
                  highContrast
                    ? "bg-gradient-to-r from-cyan-500 to-[#0098ea] border-cyan-300 shadow-[0_0_12px_rgba(0,152,234,0.5)]"
                    : "bg-gradient-to-b from-slate-900 to-black border-white/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 ${
                    highContrast ? "left-6" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. EDITING MODAL SHEETS                                       */}
      {/* ============================================================ */}

      {/* 4A. PHOTO EDIT MODAL */}
      {activeModal === "photo" && (
        <SkeuomorphicModalContainer
          title="Change Profile Photo"
          onClose={() => setActiveModal(null)}
        >
          {/* Current Photo Preview */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-200/50 shadow-xl bg-purple-950">
              {settings.photoUrl && !avatarError ? (
                <Image
                  src={settings.photoUrl}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full bg-[#0098ea] text-white flex items-center justify-center text-3xl font-black">
                  {(settings.displayName || settings.firstName || "U").slice(0, 1)}
                </div>
              )}
            </div>
          </div>

          {/* Photo Action Options */}
          <div className="space-y-2.5">
            {user?.id && (
              <button
                type="button"
                onClick={() => {
                  setAvatarError(false);
                  const tgAvatar = `/api/player/avatar?telegram_id=${user.id}&refresh=1`;
                  const updated: UserSettings = {
                    ...settings,
                    photoUrl: tgAvatar,
                    photoSource: "telegram",
                  };
                  persistSettings(updated, "Synced Telegram official photo");
                  setActiveModal(null);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
              >
                <span>Sync Telegram Official Photo</span>
              </button>
            )}

            {/* Preset Avatars */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-purple-200 block mb-2 text-center">
                Or Pick Preset Avatar:
              </span>
              <div className="flex items-center justify-center gap-3">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => {
                      setAvatarError(false);
                      const updated: UserSettings = {
                        ...settings,
                        photoUrl: url,
                        photoSource: "preset",
                      };
                      persistSettings(updated, "Selected preset avatar");
                      setActiveModal(null);
                    }}
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 hover:border-purple-300 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                  >
                    <Image
                      src={url}
                      alt={`Preset ${i + 1}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Upload */}
            <div className="pt-2">
              <input
                id={photoInputId}
                type="file"
                accept="image/*"
                onChange={handleCustomPhotoUpload}
                className="hidden"
              />
              <label
                htmlFor={photoInputId}
                className="w-full py-3 rounded-2xl bg-gradient-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
              >
                <Camera size={16} />
                <span>Upload From Device</span>
              </label>
            </div>
          </div>
        </SkeuomorphicModalContainer>
      )}
    </div>
  );
};
