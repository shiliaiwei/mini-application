"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import Image from "next/image";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  UserSettings,
  AddressDetails,
  GenderOption,
  loadCachedUserSettings,
  loadTelegramCloudSettings,
  saveUserSettings,
  calculateAge,
  formatAddressLine,
  isAddressEmpty,
  getProfileCompletion,
} from "@/lib/userSettings";
import {
  User,
  Check,
  ChevronRight,
  ChevronLeft,
  Copy,
  RefreshCw,
  Camera,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Map,
  Navigation,
  CircleNavigation,
  Compass,
  Home,
  Briefcase,
  Building,
  Globe,
  Cloud,
  Sliders,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CircleAlert,
  CircleCheck,
  Send,
  Eye,
  EyeOff,
  Settings,
  Volume,
  VolumeLow,
  VolumeOff,
  Smartphone,
  Sun,
  Moon,
  Monitor,
  Zap,
} from "@/components/icons/KeylineIcons";
import { WorkingAddressMapModal } from "@/components/modals/WorkingAddressMapModal";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";

export interface UserSettingsViewProps {
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
  botProfile?: Record<string, any>;
  telemetryData?: any;
  onBack?: () => void;
  onSavedNotification?: () => void;
}

type SettingsSection =
  | "all"
  | "personal"
  | "contact"
  | "addresses"
  | "display_system"
  | "bot_api";

type EditModal =
  | null
  | "photo"
  | "name"
  | "gender"
  | "birthday"
  | "language"
  | "email"
  | "phone"
  | "home_address"
  | "work_address"
  | "security_question";

/* ──────────────────────────────────────────────────────────── */
/* 3D Skeuomorphic Primitives                                   */
/* ──────────────────────────────────────────────────────────── */
const GuillocheBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.22 }) => (
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
      style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
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
  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-fadeIn">
    <div
      className="relative w-full max-w-md rounded-[28px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#4a148c] via-[#380e6d] to-[#240647] text-white border border-purple-400/30 space-y-4 animate-slideUp max-h-[90vh] overflow-y-auto"
      style={{
        boxShadow:
          "0 24px 50px -10px rgba(20, 2, 40, 0.85), inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.6)",
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
          className="text-xs font-bold text-purple-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-full cursor-pointer transition-all active:scale-95"
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

const GENDER_OPTIONS: Array<{ value: GenderOption; label: string; desc: string }> = [
  { value: "male", label: "Male", desc: "Identifies as male" },
  { value: "female", label: "Female", desc: "Identifies as female" },
  { value: "non_binary", label: "Non-binary", desc: "Gender identity outside the binary" },
  { value: "prefer_not_to_say", label: "Rather not say", desc: "Keep gender private on profile" },
  { value: "custom", label: "Custom", desc: "Provide your own identity description" },
];

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", native: "English (US)", flag: "EN" },
  { code: "km", label: "Khmer", native: "ភាសាខ្មែរ (Cambodia)", flag: "KM" },
  { code: "zh", label: "Chinese", native: "简体中文 (Simplified)", flag: "ZH" },
  { code: "ru", label: "Russian", native: "Русский (Russia)", flag: "RU" },
];

export const UserSettingsView: React.FC<UserSettingsViewProps> = ({
  user,
  tgApp,
  botProfile,
  telemetryData,
  onBack,
  onSavedNotification,
}) => {
  const photoInputId = useId();
  const [settings, setSettings] = useState<UserSettings>(() =>
    loadCachedUserSettings(user)
  );
  const [avatarError, setAvatarError] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("all");
  const [activeModal, setActiveModal] = useState<EditModal>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form edit draft states
  const [draftFirstName, setDraftFirstName] = useState(settings.firstName);
  const [draftLastName, setDraftLastName] = useState(settings.lastName);
  const [draftDisplayName, setDraftDisplayName] = useState(settings.displayName);
  const [draftNickname, setDraftNickname] = useState(settings.nickname || "");
  const [draftGender, setDraftGender] = useState<GenderOption>(settings.gender);
  const [draftCustomGender, setDraftCustomGender] = useState(settings.customGender || "");
  const [draftBirthday, setDraftBirthday] = useState(settings.birthday);
  const [draftLanguage, setDraftLanguage] = useState(settings.language);
  const [draftEmail, setDraftEmail] = useState(settings.email);
  const [draftPhone, setDraftPhone] = useState(settings.phone);

  const [draftHome, setDraftHome] = useState<AddressDetails>(settings.homeAddress);
  const [draftWork, setDraftWork] = useState<AddressDetails>(settings.workAddress);

  const PRESET_SECURITY_QUESTIONS = [
    "What is your secret recovery codeword?",
    "What was the name of your first school?",
    "What city were you born in?",
    "What was your favorite childhood pet's name?",
  ];

  const initialIsCustom =
    Boolean(settings.securityQuestion) &&
    !PRESET_SECURITY_QUESTIONS.includes(settings.securityQuestion || "");

  const [draftSecurityQuestion, setDraftSecurityQuestion] = useState(
    initialIsCustom
      ? "Custom Question"
      : settings.securityQuestion || PRESET_SECURITY_QUESTIONS[0]
  );
  const [draftCustomQuestion, setDraftCustomQuestion] = useState(
    initialIsCustom ? settings.securityQuestion || "" : ""
  );
  const [draftSecurityAnswer, setDraftSecurityAnswer] = useState(
    settings.securityAnswer || ""
  );
  const [isWorkMapOpen, setIsWorkMapOpen] = useState(false);

  // System, Haptics & Display local preferences
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shi_pref_haptics");
      if (saved !== null) return saved === "true";
    }
    return settings.hapticFeedback;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shi_pref_sound");
      if (saved !== null) return saved === "true";
    }
    return settings.soundEffects;
  });

  const [themeMode, setThemeMode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("shi_pref_theme") || "purple";
    }
    return "purple";
  });

  const [compactMode, setCompactMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("shi_pref_compact") === "true";
    }
    return false;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("shi_pref_contrast") === "true";
    }
    return false;
  });

  const [cachedEntriesCount, setCachedEntriesCount] = useState<number>(0);
  const [cacheClearNotice, setCacheClearNotice] = useState<string | null>(null);

  // Compute local storage cached keys
  const refreshCacheCount = useCallback(() => {
    if (typeof window !== "undefined") {
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("shi_")) count++;
      }
      setCachedEntriesCount(count);
    }
  }, []);

  useEffect(() => {
    refreshCacheCount();
  }, [refreshCacheCount]);

  // Telegram CloudStorage background sync
  useEffect(() => {
    loadTelegramCloudSettings(tgApp, (cloudData) => {
      setSettings(cloudData);
    });
  }, [tgApp]);

  // Automatically sync Telegram user fields into settings whenever user is loaded or updated
  useEffect(() => {
    if (!user) return;
    const fName = user.first_name || "";
    const lName = user.last_name || "";
    const dName = [fName, lName].filter(Boolean).join(" ") || user.username || "";
    const nName = user.username ? (user.username.startsWith("@") ? user.username : `@${user.username}`) : "";
    const resolvedPhoto =
      user.photo_url ||
      (user.id && user.id > 0 ? `/api/player/avatar?telegram_id=${user.id}` : "");

    setSettings((prev) => {
      const nextPhoto =
        prev.photoSource === "custom" && prev.photoUrl
          ? prev.photoUrl
          : resolvedPhoto || prev.photoUrl;
      const nextSource =
        prev.photoSource === "custom" ? "custom" : resolvedPhoto ? "telegram" : prev.photoSource;
      const nextFirst = prev.firstName || fName;
      const nextLast = prev.lastName || lName;
      const nextDisplay = prev.displayName || dName;
      const nextNick = prev.nickname || nName;

      if (
        prev.photoUrl === nextPhoto &&
        prev.photoSource === nextSource &&
        prev.firstName === nextFirst &&
        prev.lastName === nextLast &&
        prev.displayName === nextDisplay &&
        prev.nickname === nextNick
      ) {
        return prev;
      }

      return {
        ...prev,
        photoUrl: nextPhoto,
        photoSource: nextSource,
        firstName: nextFirst,
        lastName: nextLast,
        displayName: nextDisplay,
        nickname: nextNick,
      };
    });
  }, [user]);

  // Sync draft states whenever settings change (only if user is not actively editing inside a modal)
  useEffect(() => {
    if (activeModal || isWorkMapOpen) return;
    setDraftFirstName(settings.firstName);
    setDraftLastName(settings.lastName);
    setDraftDisplayName(settings.displayName);
    setDraftNickname(settings.nickname || "");
    setDraftGender(settings.gender);
    setDraftCustomGender(settings.customGender || "");
    setDraftBirthday(settings.birthday);
    setDraftLanguage(settings.language);
    setDraftEmail(settings.email);
    setDraftPhone(settings.phone);
    setDraftHome(settings.homeAddress);
    setDraftWork(settings.workAddress);
    const isCustomQ =
      Boolean(settings.securityQuestion) &&
      !PRESET_SECURITY_QUESTIONS.includes(settings.securityQuestion || "");
    setDraftSecurityQuestion(
      isCustomQ ? "Custom Question" : settings.securityQuestion || PRESET_SECURITY_QUESTIONS[0]
    );
    setDraftCustomQuestion(isCustomQ ? settings.securityQuestion || "" : "");
    setDraftSecurityAnswer(settings.securityAnswer || "");
  }, [settings, activeModal, isWorkMapOpen]);

  // Telegram native BackButton integration (Telegram WebApp v6.1+)
  useEffect(() => {
    const handleTgBack = () => {
      if (isWorkMapOpen) {
        setIsWorkMapOpen(false);
        try {
          tgApp?.HapticFeedback?.selectionChanged();
        } catch {}
      } else if (activeModal) {
        setActiveModal(null);
        try {
          tgApp?.HapticFeedback?.selectionChanged();
        } catch {}
      } else if (onBack) {
        onBack();
      }
    };

    const supportsBackButton = tgApp?.isVersionAtLeast ? tgApp.isVersionAtLeast("6.1") : false;

    if (supportsBackButton && tgApp?.BackButton) {
      try {
        tgApp.BackButton.show();
        tgApp.BackButton.onClick(handleTgBack);
      } catch {}
    }

    return () => {
      if (supportsBackButton && tgApp?.BackButton) {
        try {
          tgApp.BackButton.offClick(handleTgBack);
          if (!isWorkMapOpen && !activeModal && !onBack) {
            tgApp.BackButton.hide();
          }
        } catch {}
      }
    };
  }, [tgApp, isWorkMapOpen, activeModal, onBack]);

  const triggerHaptic = useCallback(
    (type: "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection" = "selection") => {
      if (!hapticsEnabled) return;
      try {
        if (type === "selection") {
          tgApp?.HapticFeedback?.selectionChanged();
        } else if (type === "success" || type === "warning" || type === "error") {
          tgApp?.HapticFeedback?.notificationOccurred(type);
        } else {
          tgApp?.HapticFeedback?.impactOccurred(type);
        }
      } catch {}
    },
    [hapticsEnabled, tgApp]
  );

  const playSynthesizedTone = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const persistSettings = useCallback(
    (newSettings: UserSettings, message = "Settings saved successfully") => {
      setSettings(newSettings);
      saveUserSettings(newSettings, tgApp);
      triggerHaptic("success");
      refreshCacheCount();
      setSaveBanner(message);
      if (onSavedNotification) onSavedNotification();
      setTimeout(() => setSaveBanner(null), 3200);
    },
    [tgApp, onSavedNotification, refreshCacheCount, triggerHaptic]
  );

  const handleCopyText = (val: string, key: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    triggerHaptic("selection");
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        const updated: UserSettings = {
          ...settings,
          photoUrl: result,
          photoSource: "custom",
        };
        persistSettings(updated, "Profile picture uploaded");
        setActiveModal(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const calculatedAge = calculateAge(settings.birthday);
  const profileCompletion = getProfileCompletion(settings);

  const handleWorkMapConfirm = (addr: AddressDetails) => {
    const updated: UserSettings = { ...settings, workAddress: addr };
    persistSettings(updated, "Work office address pinned & saved");
    setDraftWork(addr);
    setIsWorkMapOpen(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-24 space-y-4">
      {/* 1. TOP HEADER WITH SKEUOMORPHIC BRAND IDENTITY */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 shadow-xs border border-slate-200 transition-all cursor-pointer active:scale-95"
              aria-label="Back to Profile"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Settings</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 uppercase tracking-wider">
                Account & Device
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Manage personal info, contact, addresses, haptics and diagnostics
            </p>
          </div>
        </div>

        <ShiliaiweiBrand variant="mark" className="scale-90" />
      </div>

      {/* 2. LIVE NOTIFICATION BANNER */}
      {saveBanner && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold border border-emerald-400/40 animate-slideDown">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-200" />
            <span>{saveBanner}</span>
          </div>
          <span className="text-[10px] text-emerald-200 uppercase">Synchronized</span>
        </div>
      )}

      {/* 3. HERO POCKET: 3D SKEUOMORPHIC PURPLE LEATHER WALLET PROFILE */}
      <div
        className="relative w-full rounded-[28px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#5c1c99] via-[#48127f] to-[#320a59] text-white space-y-4"
        style={{
          boxShadow:
            "0 18px 40px -10px rgba(35, 6, 65, 0.75), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 6px rgba(0, 0, 0, 0.55)",
        }}
      >
        <LeatherGrain />
        <GuillocheBackground opacity={0.24} />
        <ThreadStitching strokeColor="#e9d5ff" />
        <SpecularRim />

        <div className="relative z-10 flex items-start gap-4">
          {/* Avatar with Camera Overlay Trigger */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-purple-200/50 shadow-md bg-purple-950 flex items-center justify-center">
              {settings.photoUrl && !avatarError ? (
                <Image
                  src={settings.photoUrl}
                  alt={settings.displayName}
                  width={88}
                  height={88}
                  className="w-full h-full object-cover"
                  unoptimized
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0098ea] to-[#0066fe] flex items-center justify-center text-2xl font-black text-white">
                  {settings.firstName.slice(0, 1) || "U"}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setActiveModal("photo");
              }}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#0098ea] hover:bg-[#0081c7] text-white shadow-md border-2 border-white transition-all cursor-pointer active:scale-90"
              title="Change Profile Photo"
            >
              <Camera size={14} />
            </button>
          </div>

          {/* User Headline & Telegram Badges */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-lg font-black text-white truncate drop-shadow-sm">
                {settings.displayName || `${settings.firstName} ${settings.lastName}`.trim()}
              </h3>
              <TelegramVerifiedBadge />
            </div>

            <p className="text-xs text-purple-200 font-medium truncate">
              {user?.username ? `@${user.username}` : `UID: ${user?.id || "SHI-8888"}`}
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
                <Globe size={11} className="text-purple-200" />
                <span>{settings.language.toUpperCase()}</span>
              </span>

              {calculatedAge !== null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
                  <Calendar size={11} className="text-purple-200" />
                  <span>{calculatedAge} YRS</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <Cloud size={11} />
                <span>Cloud Sync Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3B. PROFILE COMPLETION & ACTION REQUIRED BANNER */}
      {profileCompletion.percentage < 100 && (
        <div
          className="relative w-full rounded-[24px] p-4 sm:p-5 overflow-hidden bg-gradient-to-r from-amber-950/80 via-[#3b1220]/80 to-[#2b0e45]/85 border-2 border-amber-400/50 text-white space-y-3 backdrop-blur-md"
          style={{
            boxShadow:
              "0 12px 28px -8px rgba(245, 158, 11, 0.3), inset 0 2px 3px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.5)",
          }}
        >
          <LeatherGrain />
          <GuillocheBackground opacity={0.2} />
          <ThreadStitching strokeColor="#f59e0b" />
          <SpecularRim />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shrink-0">
                <CircleAlert size={20} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Profile Readiness: {profileCompletion.percentage}%
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/50 text-[9px] font-black uppercase">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  {profileCompletion.incompleteFields.length} essential item{profileCompletion.incompleteFields.length > 1 ? "s" : ""} incomplete. Fill to enable seamless delivery, physical pin on map, and instant checkout.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-md">
              {profileCompletion.completedCount}/{profileCompletion.totalCount} Done
            </span>
          </div>

          {/* Progress Bar with glowing indicator */}
          <div className="relative z-10 w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 transition-all duration-500 rounded-full"
              style={{ width: `${profileCompletion.percentage}%` }}
            />
          </div>

          {/* Quick-Action Chips for unfilled items */}
          <div className="relative z-10 flex items-center gap-1.5 flex-wrap pt-0.5">
            {profileCompletion.incompleteFields.map((field) => (
              <button
                key={field.key}
                type="button"
                onClick={() => {
                  triggerHaptic("selection");
                  if (field.key === "home_address") {
                    setActiveModal("home_address");
                  } else if (field.key === "work_address") {
                    setIsWorkMapOpen(true);
                  } else if (field.key === "security_answer") {
                    setActiveModal("security_question");
                  } else {
                    setActiveModal(field.key as EditModal);
                  }
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <span>+ {field.label}</span>
                <ChevronRight size={10} className="text-amber-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. SKEUOMORPHIC CATEGORY TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", label: "All Settings" },
          { id: "personal", label: "Personal Info" },
          { id: "contact", label: "Contact Info" },
          { id: "addresses", label: "Addresses" },
          { id: "display_system", label: "Display & System" },
          { id: "bot_api", label: "Bot API Profile" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              setActiveSection(tab.id as SettingsSection);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeSection === tab.id
                ? "bg-gradient-to-r from-[#5c1c99] to-[#48127f] text-white shadow-md border border-purple-300/40"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 5. 3D SKEUOMORPHIC GROUPED SETTINGS CARDS                    */}
      {/* ============================================================ */}

      {/* 5A. PERSONAL INFO GROUP (SKEUOMORPHIC BLUE BANKNOTE POCKET) */}
      {(activeSection === "all" || activeSection === "personal") && (
        <div
          className="relative w-full rounded-[28px] p-4 sm:p-5 overflow-hidden bg-gradient-to-b from-[#1d4ed8] via-[#1e40af] to-[#172554] text-white space-y-3"
          style={{
            boxShadow:
              "0 16px 36px -10px rgba(30, 64, 175, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.32), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
          }}
        >
          <LeatherGrain />
          <GuillocheBackground opacity={0.25} />
          <ThreadStitching strokeColor="#93c5fd" />
          <SpecularRim />

          <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/15">
            <div className="flex items-center gap-2">
              <User size={18} className="text-sky-300" />
              <h3 className="text-base font-bold text-white drop-shadow-sm">
                Personal Information
              </h3>
            </div>
            <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider">
              Google Account Standard
            </span>
          </div>

          <div className="relative z-10 space-y-2">
            {/* Field: Name */}
            <div
              onClick={() => {
                triggerHaptic("selection");
                setActiveModal("name");
              }}
              className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
                    Name
                  </span>
                  {!settings.firstName?.trim() && !settings.displayName?.trim() && (
                    <span className="px-1.5 py-0.2 bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[9px] font-black rounded-md uppercase flex items-center gap-0.5">
                      <CircleAlert size={9} />
                      Action Required
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-white block truncate">
                  {settings.displayName || `${settings.firstName} ${settings.lastName}`.trim() || (
                    <span className="text-amber-200/90 font-medium italic">Enter your full name</span>
                  )}
                </span>
                <span className="text-[10px] text-white/60">
                  {settings.firstName || settings.lastName
                    ? `${settings.firstName} ${settings.lastName}${settings.nickname ? ` (${settings.nickname})` : ""}`
                    : "Used on identity documents and member cards"}
                </span>
              </div>
              <ChevronRight size={16} className="text-white/60 shrink-0" />
            </div>

            {/* Field: Gender */}
            <div
              onClick={() => {
                triggerHaptic("selection");
                setActiveModal("gender");
              }}
              className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
                    Gender
                  </span>
                  {(!settings.gender || settings.gender === "prefer_not_to_say") && (
                    <span className="px-1.5 py-0.2 bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[9px] font-black rounded-md uppercase flex items-center gap-0.5">
                      <CircleAlert size={9} />
                      Action Required
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-white block capitalize">
                  {settings.gender === "custom"
                    ? settings.customGender || "Custom"
                    : settings.gender === "prefer_not_to_say"
                    ? <span className="text-amber-200/90 font-medium italic">Select gender identity</span>
                    : settings.gender.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] text-white/60">Profile identity display</span>
              </div>
              <ChevronRight size={16} className="text-white/60 shrink-0" />
            </div>

            {/* Field: Birthday */}
            <div
              onClick={() => {
                triggerHaptic("selection");
                setActiveModal("birthday");
              }}
              className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
                    Birthday
                  </span>
                  {!settings.birthday?.trim() && (
                    <span className="px-1.5 py-0.2 bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[9px] font-black rounded-md uppercase flex items-center gap-0.5">
                      <CircleAlert size={9} />
                      Action Required
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-white block">
                  {settings.birthday ? (
                    `${settings.birthday}${calculatedAge !== null ? ` (${calculatedAge} years old)` : ""}`
                  ) : (
                    <span className="text-amber-200/90 font-medium italic">Set birthday for age verification</span>
                  )}
                </span>
                <span className="text-[10px] text-white/60">Used for age verification</span>
              </div>
              <ChevronRight size={16} className="text-white/60 shrink-0" />
            </div>

            {/* Field: Language */}
            <div
              onClick={() => {
                triggerHaptic("selection");
                setActiveModal("language");
              }}
              className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200 block">
                  Preferred Language
                </span>
                <span className="text-sm font-bold text-white block">
                  {LANGUAGE_OPTIONS.find((l) => l.code === settings.language)?.native ||
                    settings.language.toUpperCase()}
                </span>
                <span className="text-[10px] text-white/60">UI translations and currency formats</span>
              </div>
              <ChevronRight size={16} className="text-white/60 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* 5B. CONTACT INFO GROUP (SKEUOMORPHIC EMERALD POCKET) */}
      {(activeSection === "all" || activeSection === "contact") && (
        <div
          className="relative w-full rounded-[28px] p-4 sm:p-5 overflow-hidden bg-gradient-to-b from-[#0f766e] via-[#115e59] to-[#134e4a] text-white space-y-3"
          style={{
            boxShadow:
              "0 16px 36px -10px rgba(13, 148, 136, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.32), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
          }}
        >
          <LeatherGrain />
          <GuillocheBackground opacity={0.25} />
          <ThreadStitching strokeColor="#6ee7b7" />
          <SpecularRim />

          <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/15">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-teal-200" />
              <h3 className="text-base font-bold text-white drop-shadow-sm">
                Contact Information
              </h3>
            </div>
            <span className="text-[10px] text-teal-200 font-bold uppercase tracking-wider">
              Security & Recovery
            </span>
          </div>

          <div className="relative z-10 space-y-2">
            {/* Field: Email */}
            <div
              onClick={() => {
                triggerHaptic("selection");
                setActiveModal("email");
              }}
              className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                    Email Address
                  </span>
                  {settings.emailVerified ? (
                    <span className="px-1.5 py-0.2 bg-teal-400/20 text-teal-200 border border-teal-300/40 text-[9px] font-black rounded-md uppercase">
                      Verified
                    </span>
                  ) : !settings.email?.trim() ? (
                    <span className="px-1.5 py-0.2 bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[9px] font-black rounded-md uppercase flex items-center gap-0.5">
                      <CircleAlert size={9} />
                      Action Required
                    </span>
                  ) : null}
                </div>
                <span className="text-sm font-bold text-white block truncate">
                  {settings.email || (
                    <span className="text-amber-200/90 font-medium italic">Link recovery email address</span>
                  )}
                </span>
                <span className="text-[10px] text-white/60">
                  Account recovery and official alerts
                </span>
              </div>
              <ChevronRight size={16} className="text-white/60 shrink-0" />
            </div>

            {/* Field: Phone */}
            <div
              onClick={() => {
                triggerHaptic("selection");
                setActiveModal("phone");
              }}
              className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                    Phone Number
                  </span>
                  {settings.phoneVerified ? (
                    <span className="px-1.5 py-0.2 bg-teal-400/20 text-teal-200 border border-teal-300/40 text-[9px] font-black rounded-md uppercase">
                      Telegram Verified
                    </span>
                  ) : !settings.phone?.trim() ? (
                    <span className="px-1.5 py-0.2 bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[9px] font-black rounded-md uppercase flex items-center gap-0.5">
                      <CircleAlert size={9} />
                      Action Required
                    </span>
                  ) : null}
                </div>
                <span className="text-sm font-bold text-white block">
                  {settings.phone || (
                    <span className="text-amber-200/90 font-medium italic">Add phone number for delivery SMS</span>
                  )}
                </span>
                <span className="text-[10px] text-white/60">
                  Direct contact via Telegram contact share
                </span>
              </div>
              <ChevronRight size={16} className="text-white/60 shrink-0" />
            </div>
            {/* Field: Security Recovery Question */}
            <div
              onClick={() => {
                triggerHaptic("selection");
                setActiveModal("security_question");
              }}
              className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                    Security Recovery Question
                  </span>
                  {settings.securityAnswer?.trim() ? (
                    <span className="px-1.5 py-0.2 bg-teal-400/20 text-teal-200 border border-teal-300/40 text-[9px] font-black rounded-md uppercase">
                      Configured
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[9px] font-black rounded-md uppercase flex items-center gap-0.5">
                      <CircleAlert size={9} />
                      Action Required
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-white block truncate">
                  {settings.securityQuestion || "What is your secret recovery codeword?"}
                </span>
                <span className="text-[10px] text-white/60">
                  {settings.securityAnswer?.trim()
                    ? "•••••••• (Answer Protected)"
                    : "Manual entry required for account recovery"}
                </span>
              </div>
              <ChevronRight size={16} className="text-white/60 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* 5C. ADDRESSES GROUP (SKEUOMORPHIC INDIGO POCKET) */}
      {(activeSection === "all" || activeSection === "addresses") && (
        <div
          className="relative w-full rounded-[28px] p-4 sm:p-5 overflow-hidden bg-gradient-to-b from-[#4338ca] via-[#3730a3] to-[#312e81] text-white space-y-3"
          style={{
            boxShadow:
              "0 16px 36px -10px rgba(67, 56, 202, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.32), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
          }}
        >
          <LeatherGrain />
          <GuillocheBackground opacity={0.25} />
          <ThreadStitching strokeColor="#c7d2fe" />
          <SpecularRim />

          <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/15">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-indigo-200" />
              <h3 className="text-base font-bold text-white drop-shadow-sm">Addresses</h3>
            </div>
            <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
              Physical & Work Pin
            </span>
          </div>

          <div className="relative z-10 space-y-3">
            {/* Field: Home Address (Manual Entry Only) */}
            {isAddressEmpty(settings.homeAddress) ? (
              <div className="bg-amber-500/10 border-2 border-dashed border-amber-400/50 rounded-2xl p-3.5 space-y-2.5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Home size={15} />
                    <span className="text-xs font-black uppercase tracking-wider">Home Address (Manual Entry)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-200 border border-amber-400/50 text-[9px] font-black uppercase flex items-center gap-1">
                    <CircleAlert size={10} />
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-amber-100/80 leading-relaxed">
                  No residential address entered yet. Home address requires manual text input (not tracked on map).
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setActiveModal("home_address");
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Home size={14} />
                    <span>Enter Home Address (Manual)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3 space-y-2 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-200">
                    <Home size={13} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Home Address (Manual)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[9px] font-black uppercase flex items-center gap-1">
                    <CircleCheck size={10} />
                    Saved Physical Address
                  </span>
                </div>
                <div>
                  <span className="text-sm font-bold text-white block truncate">
                    {formatAddressLine(settings.homeAddress)}
                  </span>
                  <span className="text-[10px] text-white/60 block">
                    {settings.homeAddress.city}, {settings.homeAddress.stateProvince || ""}{" "}
                    {settings.homeAddress.country}
                  </span>
                </div>
                <div className="pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setActiveModal("home_address");
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Edit Home Address (Manual)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Field: Work Address (Map Pin) */}
            {isAddressEmpty(settings.workAddress) ? (
              <div className="bg-amber-500/10 border-2 border-dashed border-amber-400/50 rounded-2xl p-3.5 space-y-2.5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Briefcase size={15} />
                    <span className="text-xs font-black uppercase tracking-wider">Work Address (Map Pin)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-200 border border-amber-400/50 text-[9px] font-black uppercase flex items-center gap-1">
                    <CircleAlert size={10} />
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-amber-100/80 leading-relaxed">
                  No workplace location pinned yet. Drop and drag a pin on OpenStreetMap to auto-detect and populate your working address.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setIsWorkMapOpen(true);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Navigation size={14} />
                    <span>Pin on Working Map (Drag & Drop)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setActiveModal("work_address");
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Manual
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3 space-y-2 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-200">
                    <Briefcase size={13} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Work Address</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[9px] font-black uppercase flex items-center gap-1">
                    <CircleCheck size={10} />
                    Verified Map Location
                  </span>
                </div>
                <div>
                  <span className="text-sm font-bold text-white block truncate">
                    {formatAddressLine(settings.workAddress)}
                  </span>
                  <span className="text-[10px] text-white/60 block">
                    {settings.workAddress.unit ? `${settings.workAddress.unit} - ` : ""}
                    {settings.workAddress.city}, {settings.workAddress.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setIsWorkMapOpen(true);
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Navigation size={12} />
                    <span>Re-Pin on Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setActiveModal("work_address");
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Edit Details</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5D. DISPLAY, SYSTEM SETTINGS & HAPTICS (SKEUOMORPHIC SLATE & PURPLE POCKET) */}
      {(activeSection === "all" || activeSection === "display_system") && (
        <div
          className="relative w-full rounded-[28px] p-4 sm:p-5 overflow-hidden bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] text-white space-y-4"
          style={{
            boxShadow:
              "0 16px 36px -10px rgba(15, 23, 42, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.32), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
          }}
        >
          <LeatherGrain />
          <GuillocheBackground opacity={0.25} />
          <ThreadStitching strokeColor="#94a3b8" />
          <SpecularRim />

          <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/15">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-cyan-300" />
              <h3 className="text-base font-bold text-white drop-shadow-sm">
                System Settings & Haptics
              </h3>
            </div>
            <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider">
              Skeuomorphic Controls
            </span>
          </div>

          <div className="relative z-10 space-y-3">
            {/* SUB-SECTION 1: HAPTICS & SOUNDS */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                Haptics & Sound Engine
              </span>

              {/* Haptic Feedback Master Toggle */}
              <div className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all">
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
                  className={`relative w-12 h-6 rounded-full border transition-all duration-300 cursor-pointer shrink-0 ${
                    hapticsEnabled
                      ? "bg-[#0098ea] border-cyan-300 ring-2 ring-cyan-400/30 shadow-[0_0_12px_rgba(0,152,234,0.5)]"
                      : "bg-slate-800/90 border-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      hapticsEnabled ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Real-time Haptic Vibration Test Suite */}
              {hapticsEnabled && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-white/60 block">
                    Test Haptic Feedback Vibrations:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => triggerHaptic("light")}
                      className="py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white active:scale-95 transition-all text-center cursor-pointer"
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerHaptic("medium")}
                      className="py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white active:scale-95 transition-all text-center cursor-pointer"
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerHaptic("heavy")}
                      className="py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white active:scale-95 transition-all text-center cursor-pointer"
                    >
                      Heavy
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerHaptic("selection")}
                      className="py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white active:scale-95 transition-all text-center cursor-pointer"
                    >
                      Select
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerHaptic("success")}
                      className="py-1.5 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 active:scale-95 transition-all text-center cursor-pointer"
                    >
                      Success
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerHaptic("warning")}
                      className="py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 active:scale-95 transition-all text-center cursor-pointer"
                    >
                      Warning
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerHaptic("error")}
                      className="py-1.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 active:scale-95 transition-all text-center cursor-pointer col-span-2"
                    >
                      Error Notification
                    </button>
                  </div>
                </div>
              )}

              {/* Game SFX Sounds Toggle */}
              <div className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all">
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
                      className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white cursor-pointer active:scale-95"
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
                    className={`relative w-12 h-6 rounded-full border transition-all duration-300 cursor-pointer shrink-0 ${
                      soundEnabled
                        ? "bg-[#0098ea] border-cyan-300 ring-2 ring-cyan-400/30 shadow-[0_0_12px_rgba(0,152,234,0.5)]"
                        : "bg-slate-800/90 border-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                        soundEnabled ? "left-6" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* SUB-SECTION 2: DISPLAY & APPEARANCE */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                Display & Viewport
              </span>

              {/* Theme Palette Switcher */}
              <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 space-y-2">
                <span className="text-xs font-bold text-white block">Theme Appearance</span>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {[
                    { id: "purple", label: "Royal Purple" },
                    { id: "obsidian", label: "Obsidian Dark" },
                    { id: "system", label: "Telegram Sync" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setThemeMode(t.id);
                        localStorage.setItem("shi_pref_theme", t.id);
                        triggerHaptic("selection");
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        themeMode === t.id
                          ? "bg-[#0098ea] border-cyan-300 text-white shadow-md font-black"
                          : "bg-white/10 hover:bg-white/15 border-white/15 text-white/80"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telegram Viewport Expansion */}
              <div className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all">
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
                      triggerHaptic("selection");
                      setSaveBanner("Telegram Viewport Expanded");
                      setTimeout(() => setSaveBanner(null), 2500);
                    } catch {}
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#0098ea] hover:bg-[#0081c7] border border-cyan-300 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Expand Now
                </button>
              </div>

              {/* UI Density: Compact Mode */}
              <div className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all">
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
                  className={`relative w-12 h-6 rounded-full border transition-all duration-300 cursor-pointer shrink-0 ${
                    compactMode
                      ? "bg-[#0098ea] border-cyan-300 ring-2 ring-cyan-400/30 shadow-[0_0_12px_rgba(0,152,234,0.5)]"
                      : "bg-slate-800/90 border-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      compactMode ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* High Contrast Mode */}
              <div className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all">
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
                  className={`relative w-12 h-6 rounded-full border transition-all duration-300 cursor-pointer shrink-0 ${
                    highContrast
                      ? "bg-[#0098ea] border-cyan-300 ring-2 ring-cyan-400/30 shadow-[0_0_12px_rgba(0,152,234,0.5)]"
                      : "bg-slate-800/90 border-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      highContrast ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* SUB-SECTION 3: CLOUD SYNC & STORAGE */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                Storage & Telegram Sync
              </span>

              {/* Telegram Cloud Storage Sync Toggle */}
              <div className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between transition-all">
                <div>
                  <span className="text-sm font-bold text-white block">
                    Telegram Cloud Storage Sync
                  </span>
                  <span className="text-xs text-white/70">
                    Sync user settings across all Telegram devices via CloudStorage API
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated: UserSettings = {
                      ...settings,
                      telegramCloudSync: !settings.telegramCloudSync,
                    };
                    persistSettings(
                      updated,
                      `CloudStorage sync ${!settings.telegramCloudSync ? "enabled" : "disabled"}`
                    );
                  }}
                  className={`relative w-12 h-6 rounded-full border transition-all duration-300 cursor-pointer shrink-0 ${
                    settings.telegramCloudSync
                      ? "bg-[#0098ea] border-cyan-300 ring-2 ring-cyan-400/30 shadow-[0_0_12px_rgba(0,152,234,0.5)]"
                      : "bg-slate-800/90 border-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      settings.telegramCloudSync ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Cache Management & Purge */}
              <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">Offline Local Cache</span>
                  <span className="text-xs text-white/70">
                    {cachedEntriesCount} keys cached locally in browser storage
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("shi_settings_cache");
                      localStorage.removeItem("shi_pref_haptics");
                      localStorage.removeItem("shi_pref_sound");
                      localStorage.removeItem("shi_pref_theme");
                      localStorage.removeItem("shi_pref_compact");
                      localStorage.removeItem("shi_pref_contrast");
                      refreshCacheCount();
                      triggerHaptic("warning");
                      setCacheClearNotice("Cache Cleared");
                      setTimeout(() => setCacheClearNotice(null), 2500);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-bold cursor-pointer transition-all active:scale-95"
                >
                  {cacheClearNotice || "Clear Cache"}
                </button>
              </div>
            </div>

            {/* Telegram WebApp Runtime Telemetry Diagnostics */}
            <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-3.5 space-y-2 mt-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-200 block">
                Telegram Client Runtime Telemetry
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between">
                  <span className="text-white/60">Platform:</span>
                  <span className="font-bold text-white">
                    {tgApp?.platform || "web-browser"}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between">
                  <span className="text-white/60">API Version:</span>
                  <span className="font-bold text-white">{tgApp?.version || "8.0"}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between">
                  <span className="text-white/60">Color Scheme:</span>
                  <span className="font-bold text-white">
                    {tgApp?.colorScheme || "light"}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between">
                  <span className="text-white/60">Bot PM:</span>
                  <span className="font-bold text-emerald-400">
                    {user?.allows_write_to_pm !== false ? "Allowed" : "Restricted"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5E. TELEGRAM BOT API PROFILE (MOVED OUT OF GAME PROFILE VIEW INTO SETTINGS) */}
      {(activeSection === "all" || activeSection === "bot_api") && (
        <div
          className="relative w-full rounded-[28px] p-4 sm:p-5 overflow-hidden bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985] text-white space-y-3"
          style={{
            boxShadow:
              "0 16px 36px -10px rgba(2, 132, 199, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.32), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
          }}
        >
          <LeatherGrain />
          <GuillocheBackground opacity={0.25} />
          <ThreadStitching strokeColor="#7dd3fc" />
          <SpecularRim />

          <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-white/15">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-200" />
              <h3 className="text-base font-bold text-white drop-shadow-sm">
                Telegram Bot API Profile
              </h3>
            </div>
            <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider">
              @srievibot Live API
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              {
                label: "Telegram UID",
                value: String(botProfile?.id || user?.id || ""),
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
                className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
              >
                <div>
                  <span className="text-[9px] font-bold text-cyan-200 uppercase tracking-wider block">
                    {item.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-white block truncate">
                    {item.value}
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-md text-white/70 hover:text-white"
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

          {/* User Bio Block */}
          <div className="relative z-10 bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200 block">
              Bio / Description
            </span>
            <p className="text-xs text-white/90 font-medium">
              {botProfile?.bio ||
                "Official SHILIAIWEI WebApp participant. Tap to earn WEI COIN and unlock luxury benefits."}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. EDITING MODAL SHEETS (ALL SKEUOMORPHIC PURPLE LEATHER)    */}
      {/* ============================================================ */}

      {/* 6A. PHOTO EDIT MODAL */}
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
                  {settings.displayName.slice(0, 1)}
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
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98"
              >
                <ShieldCheck size={16} className="text-emerald-300" />
                <span>Sync Official Telegram Avatar</span>
              </button>
            )}

            {/* Upload from Device */}
            <label
              htmlFor={photoInputId}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98 transition-all"
            >
              <Camera size={16} />
              <span>Upload New Picture</span>
            </label>
            <input
              id={photoInputId}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Preset Avatars Selection */}
            <div className="pt-2">
              <span className="text-xs font-bold text-purple-200 block mb-2 uppercase tracking-wider">
                Or Choose Preset Avatar
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const updated: UserSettings = {
                        ...settings,
                        photoUrl: url,
                        photoSource: "preset",
                      };
                      persistSettings(updated, "Preset avatar applied");
                      setActiveModal(null);
                    }}
                    className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-300/40 hover:border-cyan-300 transition-all cursor-pointer mx-auto active:scale-95 shadow-md"
                  >
                    <Image
                      src={url}
                      alt={`Preset ${idx + 1}`}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SkeuomorphicModalContainer>
      )}

      {/* 6B. NAME EDIT MODAL */}
      {activeModal === "name" && (
        <SkeuomorphicModalContainer title="Edit Name" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                First Name
              </label>
              <input
                type="text"
                value={draftFirstName}
                onChange={(e) => setDraftFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="First Name"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={draftLastName}
                onChange={(e) => setDraftLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="Last Name"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={draftDisplayName}
                onChange={(e) => setDraftDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="Display Name"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Nickname (Optional)
              </label>
              <input
                type="text"
                value={draftNickname}
                onChange={(e) => setDraftNickname(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="Nickname"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const updated: UserSettings = {
                ...settings,
                firstName: draftFirstName.trim() || settings.firstName,
                lastName: draftLastName.trim(),
                displayName: draftDisplayName.trim() || `${draftFirstName} ${draftLastName}`.trim(),
                nickname: draftNickname.trim(),
              };
              persistSettings(updated, "Name details updated");
              setActiveModal(null);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98"
          >
            Save Name
          </button>
        </SkeuomorphicModalContainer>
      )}

      {/* 6C. GENDER EDIT MODAL */}
      {activeModal === "gender" && (
        <SkeuomorphicModalContainer title="Select Gender" onClose={() => setActiveModal(null)}>
          <div className="space-y-2">
            {GENDER_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                onClick={() => setDraftGender(opt.value)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  draftGender === opt.value
                    ? "bg-gradient-to-r from-[#0098ea]/30 to-[#0284c7]/20 border-cyan-400 text-white ring-1 ring-cyan-400/30 shadow-md"
                    : "bg-white/10 hover:bg-white/15 border-white/15 text-white/80"
                }`}
              >
                <div>
                  <span className="text-sm font-bold block">{opt.label}</span>
                  <span className="text-xs text-white/60">{opt.desc}</span>
                </div>
                {draftGender === opt.value && (
                  <div className="w-5 h-5 rounded-full bg-[#0098ea] text-white flex items-center justify-center">
                    <Check size={13} />
                  </div>
                )}
              </div>
            ))}

            {draftGender === "custom" && (
              <div className="pt-2">
                <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                  Custom Identity Description
                </label>
                <input
                  type="text"
                  value={draftCustomGender}
                  onChange={(e) => setDraftCustomGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                  placeholder="e.g. Agender, Genderfluid, etc."
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const updated: UserSettings = {
                ...settings,
                gender: draftGender,
                customGender: draftGender === "custom" ? draftCustomGender.trim() : "",
              };
              persistSettings(updated, "Gender identity updated");
              setActiveModal(null);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98"
          >
            Save Gender
          </button>
        </SkeuomorphicModalContainer>
      )}

      {/* 6D. BIRTHDAY EDIT MODAL */}
      {activeModal === "birthday" && (
        <SkeuomorphicModalContainer title="Edit Birthday" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Date of Birth (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={draftBirthday}
                onChange={(e) => setDraftBirthday(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
              />
            </div>

            {draftBirthday && (
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-xs text-white/90">
                Calculated Age:{" "}
                <span className="font-black text-cyan-200">
                  {calculateAge(draftBirthday)} years old
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const updated: UserSettings = {
                ...settings,
                birthday: draftBirthday,
              };
              persistSettings(updated, "Birthday details updated");
              setActiveModal(null);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98"
          >
            Save Birthday
          </button>
        </SkeuomorphicModalContainer>
      )}

      {/* 6E. LANGUAGE EDIT MODAL */}
      {activeModal === "language" && (
        <SkeuomorphicModalContainer
          title="Select Preferred Language"
          onClose={() => setActiveModal(null)}
        >
          <div className="space-y-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <div
                key={lang.code}
                onClick={() => setDraftLanguage(lang.code)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  draftLanguage === lang.code
                    ? "bg-gradient-to-r from-[#0098ea]/30 to-[#0284c7]/20 border-cyan-400 text-white ring-1 ring-cyan-400/30 shadow-md"
                    : "bg-white/10 hover:bg-white/15 border-white/15 text-white/80"
                }`}
              >
                <div>
                  <span className="text-sm font-bold block">{lang.native}</span>
                  <span className="text-xs text-white/60">{lang.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono text-[10px] font-bold border border-white/15">
                    {lang.flag}
                  </span>
                  {draftLanguage === lang.code && (
                    <div className="w-5 h-5 rounded-full bg-[#0098ea] text-white flex items-center justify-center">
                      <Check size={13} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              const updated: UserSettings = {
                ...settings,
                language: draftLanguage,
              };
              persistSettings(updated, `Language set to ${draftLanguage.toUpperCase()}`);
              setActiveModal(null);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98"
          >
            Save Language
          </button>
        </SkeuomorphicModalContainer>
      )}

      {/* 6F. EMAIL EDIT MODAL */}
      {activeModal === "email" && (
        <SkeuomorphicModalContainer title="Edit Email Address" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="name@example.com"
              />
            </div>
            <p className="text-xs text-white/60">
              An official verification email will be dispatched to confirm your ownership.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const updated: UserSettings = {
                ...settings,
                email: draftEmail.trim(),
                emailVerified: draftEmail.trim() === settings.email ? settings.emailVerified : false,
              };
              persistSettings(updated, "Email updated");
              setActiveModal(null);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98"
          >
            Save Email
          </button>
        </SkeuomorphicModalContainer>
      )}

      {/* 6G. PHONE EDIT MODAL */}
      {activeModal === "phone" && (
        <SkeuomorphicModalContainer title="Edit Phone Number" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            {/* Telegram 1-Tap Request Contact Integration */}
            <button
              type="button"
              onClick={() => {
                try {
                  if (tgApp?.requestContact) {
                    tgApp.requestContact((sent) => {
                      if (sent) {
                        triggerHaptic("success");
                        setSaveBanner("Telegram Contact Shared");
                      }
                    });
                  } else {
                    triggerHaptic("selection");
                    setSaveBanner("Contact sharing available inside Telegram");
                  }
                } catch {}
              }}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98"
            >
              <Smartphone size={16} className="text-cyan-300" />
              <span>Share Telegram Phone Number</span>
            </button>

            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Phone Number (with Country Code)
              </label>
              <input
                type="tel"
                value={draftPhone}
                onChange={(e) => setDraftPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="+855 12 345 678"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const updated: UserSettings = {
                ...settings,
                phone: draftPhone.trim(),
                phoneVerified: draftPhone.trim() === settings.phone ? settings.phoneVerified : false,
              };
              persistSettings(updated, "Phone updated");
              setActiveModal(null);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98"
          >
            Save Phone
          </button>
        </SkeuomorphicModalContainer>
      )}

      {/* 6H. HOME ADDRESS EDIT MODAL (MANUAL INPUT ONLY) */}
      {activeModal === "home_address" && (
        <SkeuomorphicModalContainer title="Edit Home Address (Manual)" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Residential home address requires manual text input (not tracked on map).
            </p>

            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={draftHome.street}
                onChange={(e) => setDraftHome({ ...draftHome, street: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="Street address / House number"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                  Apt / Unit / Floor
                </label>
                <input
                  type="text"
                  value={draftHome.unit}
                  onChange={(e) => setDraftHome({ ...draftHome, unit: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                  placeholder="Unit 4B"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={draftHome.city}
                  onChange={(e) => setDraftHome({ ...draftHome, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                  placeholder="City"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  value={draftHome.stateProvince || ""}
                  onChange={(e) => setDraftHome({ ...draftHome, stateProvince: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                  placeholder="Province"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={draftHome.postalCode}
                  onChange={(e) => setDraftHome({ ...draftHome, postalCode: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                  placeholder="12000"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Country
              </label>
              <input
                type="text"
                value={draftHome.country}
                onChange={(e) => setDraftHome({ ...draftHome, country: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="Country"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const updated: UserSettings = {
                ...settings,
                homeAddress: draftHome,
              };
              persistSettings(updated, "Home address saved");
              setActiveModal(null);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98"
          >
            Save Home Address
          </button>
        </SkeuomorphicModalContainer>
      )}

      {/* 6I. WORK ADDRESS EDIT MODAL (AUTO-PINNED VIA MAP OR MANUAL TWEAK) */}
      {activeModal === "work_address" && (
        <SkeuomorphicModalContainer title="Edit Work Address" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            {/* Working Map Quick Pin Action */}
            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                setIsWorkMapOpen(true);
                triggerHaptic("selection");
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md border border-indigo-400/40 active:scale-98 transition-all"
            >
              <Navigation size={15} className="text-cyan-300" />
              <span>Pin on Working Map (Drag & Drop Pin)</span>
            </button>

            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-[10px] uppercase font-bold text-white/40">Or Edit Details Manually</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Office / Building / Suite
              </label>
              <input
                type="text"
                value={draftWork.unit || ""}
                onChange={(e) => setDraftWork({ ...draftWork, unit: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="Tower / Floor / Suite"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={draftWork.street}
                onChange={(e) => setDraftWork({ ...draftWork, street: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={draftWork.city}
                  onChange={(e) => setDraftWork({ ...draftWork, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={draftWork.country}
                  onChange={(e) => setDraftWork({ ...draftWork, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const updated: UserSettings = {
                ...settings,
                workAddress: draftWork,
              };
              persistSettings(updated, "Work address saved");
              setActiveModal(null);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98"
          >
            Save Work Address
          </button>
        </SkeuomorphicModalContainer>
      )}

      {/* 6J. SECURITY QUESTION EDIT MODAL (MANUAL INPUT ONLY) */}
      {activeModal === "security_question" && (
        <SkeuomorphicModalContainer
          title="Security & Recovery Question"
          onClose={() => setActiveModal(null)}
        >
          <div className="space-y-4">
            <p className="text-xs text-purple-200/80 leading-relaxed">
              Configure your secret security recovery question and answer. Required for manual identity recovery.
            </p>

            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Security Question
              </label>
              <select
                value={draftSecurityQuestion}
                onChange={(e) => setDraftSecurityQuestion(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all cursor-pointer mb-2"
              >
                <option
                  value="What is your secret recovery codeword?"
                  className="bg-slate-900 text-white"
                >
                  What is your secret recovery codeword?
                </option>
                <option
                  value="What was the name of your first school?"
                  className="bg-slate-900 text-white"
                >
                  What was the name of your first school?
                </option>
                <option
                  value="What city were you born in?"
                  className="bg-slate-900 text-white"
                >
                  What city were you born in?
                </option>
                <option
                  value="What was your favorite childhood pet's name?"
                  className="bg-slate-900 text-white"
                >
                  What was your favorite childhood pet&apos;s name?
                </option>
                <option value="Custom Question" className="bg-slate-900 text-white">
                  Custom Question...
                </option>
              </select>
              {draftSecurityQuestion === "Custom Question" && (
                <input
                  type="text"
                  placeholder="Enter your custom question"
                  value={draftCustomQuestion}
                  onChange={(e) => setDraftCustomQuestion(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-1">
                Secret Answer (Manual Entry)
              </label>
              <input
                type="text"
                value={draftSecurityAnswer}
                onChange={(e) => setDraftSecurityAnswer(e.target.value)}
                placeholder="Enter secret answer"
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
              />
              <span className="text-[10px] text-white/50 block mt-1">
                Your answer is stored securely and used to authenticate recovery requests.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const finalQuestion =
                draftSecurityQuestion === "Custom Question"
                  ? draftCustomQuestion.trim() || "What is your secret recovery codeword?"
                  : draftSecurityQuestion;
              const updated: UserSettings = {
                ...settings,
                securityQuestion: finalQuestion,
                securityAnswer: draftSecurityAnswer.trim(),
              };
              persistSettings(updated, "Security question & answer saved");
              setActiveModal(null);
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98"
          >
            Save Security Question
          </button>
        </SkeuomorphicModalContainer>
      )}

      {/* 7. INTERACTIVE WORKING ADDRESS MAP PINNING MODAL (OPENSTREETMAP) */}
      {isWorkMapOpen && (
        <WorkingAddressMapModal
          isOpen={isWorkMapOpen}
          onClose={() => setIsWorkMapOpen(false)}
          initialAddress={settings.workAddress}
          onConfirm={handleWorkMapConfirm}
          triggerHaptic={triggerHaptic}
        />
      )}
    </div>
  );
};
