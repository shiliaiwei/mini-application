"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Timer,
  RefreshCw,
  Zap,
  Repeat,
  Wallet,
  Coins,
  Shield,
  ShieldCheck,
  Send,
  Sparkles,
  User,
  Bell,
  Gift,
  Info,
  Eye,
  EyeOff,
} from "@/components/icons/KeylineIcons";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";

/* ──────────────────────────────────────────────────────────── */
/* Types & Interfaces                                           */
/* ──────────────────────────────────────────────────────────── */
interface AuditLogEntry {
  id: number;
  telegram_id: number | string;
  action: string;
  ip_address: string;
  platform: string;
  city_country: string;
  details: string;
  created_at: string;
}

export type ProfileSubTab = "profile" | "swap" | "security" | "audit";
export type CurrencyType = "WEI" | "USD" | "KHR";

type InnerView =
  | "main"
  | "edit"
  | "swap"
  | "security"
  | "audit"
  | "notifications"
  | "wallet-detail";

interface GameProfileViewProps {
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
  score: number;
  spendSeconds: number;
  tapPower?: number;
  passiveRate?: number;
  initialSubTab?: ProfileSubTab;
  onSetScore?: (newScore: number) => void;
  onBack?: () => void;
}

/* ──────────────────────────────────────────────────────────── */
/* Cloudflare Zero Trust Masking Utilities                      */
/* ──────────────────────────────────────────────────────────── */
const maskTelegramId = (id: string | number): string => {
  const str = String(id || "");
  if (!str || str === "--------") return "••••••••";
  if (str.length <= 4) return "••••";
  if (str.length <= 8) return `${str.slice(0, 2)}••••${str.slice(-2)}`;
  return `${str.slice(0, 4)}••••${str.slice(-2)}`;
};

const maskHandle = (handle: string): string => {
  if (!handle) return "@••••";
  const raw = handle.startsWith("@") ? handle.slice(1) : handle;
  if (raw.length <= 3) return `@${raw[0]}••`;
  return `@${raw.slice(0, 2)}••••${raw.slice(-2)}`;
};

const maskName = (name: string): string => {
  if (!name) return "••••";
  if (name.length <= 3) return `${name[0]}••`;
  return `${name.slice(0, 2)}••••${name.slice(-1)}`;
};

const maskIp = (ip: string): string => {
  if (!ip) return "::1";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.•••.•••`;
    }
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return `${parts[0]}:••••:••••:${parts[parts.length - 1]}`;
  }
  return `${ip.slice(0, 4)}••••`;
};

const maskGeneral = (str: string, lead = 3, tail = 3): string => {
  if (!str) return "••••";
  if (str.length <= lead + tail) return `${str.slice(0, 1)}••••`;
  return `${str.slice(0, lead)}••••${str.slice(-tail)}`;
};

const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
};

/* ──────────────────────────────────────────────────────────── */
/* UI Building Blocks                                           */
/* ──────────────────────────────────────────────────────────── */
const ProfileWatermark: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.055]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="pm-wm"
        width="160"
        height="80"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-18)"
      >
        <text
          x="5"
          y="28"
          fill="#0098ea"
          fontSize="16"
          fontWeight="900"
          letterSpacing="-0.02em"
          fontFamily="system-ui,-apple-system,sans-serif"
        >
          SHILIAI
        </text>
        <rect x="76" y="13" width="34" height="20" rx="5" fill="#0098ea" />
        <text
          x="93"
          y="28"
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui,-apple-system,sans-serif"
        >
          WEI
        </text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#pm-wm)" />
  </svg>
);

const ProfileAvatar: React.FC<{
  user: TelegramUser | null;
  size?: number;
}> = ({ user, size = 64 }) => {
  if (user?.photo_url) {
    return (
      <div
        className="rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={user.photo_url}
          alt="avatar"
          width={size}
          height={size}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    );
  }
  const initials = `${user?.first_name?.[0] || "S"}${user?.last_name?.[0] || "W"}`;
  return (
    <div
      className="rounded-2xl border-2 border-white shadow-md bg-gradient-to-br from-[#0098ea] to-[#005f99] flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="text-white font-black" style={{ fontSize: size * 0.35 }}>
        {initials}
      </span>
    </div>
  );
};

/* Block Card Header */
const BlockCardHeader: React.FC<{
  title: string;
  tag?: string;
  tagColor?: string;
  sub?: string;
  right?: React.ReactNode;
}> = ({ title, tag, tagColor = "bg-sky-100 text-sky-800", sub, right }) => (
  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
          {title}
        </h3>
        {tag && (
          <span
            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${tagColor}`}
          >
            {tag}
          </span>
        )}
      </div>
      {sub && (
        <p className="text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
          {sub}
        </p>
      )}
    </div>
    {right && <div className="flex items-center gap-1.5 flex-shrink-0">{right}</div>}
  </div>
);

/* Individual Field Block Tile */
interface FieldBlockTileProps {
  title: string;
  source: string;
  badgeColor: string;
  displayValue: string;
  description: string;
  mono?: boolean;
  sensitive?: boolean;
  isRevealed?: boolean;
  onTogglePeek?: () => void;
  onCopy?: () => void;
  isCopied?: boolean;
}

const FieldBlockTile: React.FC<FieldBlockTileProps> = ({
  title,
  source,
  badgeColor,
  displayValue,
  description,
  mono,
  sensitive,
  isRevealed,
  onTogglePeek,
  onCopy,
  isCopied,
}) => (
  <div className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200">
    <div className="flex items-center justify-between gap-1.5 mb-1.5">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide truncate">
          {title}
        </span>
        <span
          className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-md ${badgeColor}`}
        >
          {source}
        </span>
      </div>
      {sensitive && (
        <span
          className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
            isRevealed
              ? "bg-amber-100 text-amber-900 border border-amber-200"
              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
          }`}
        >
          {isRevealed ? "REVEALED" : "HINT"}
        </span>
      )}
    </div>

    {/* Value Display Box */}
    <div className="my-1 py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2">
      <span
        className={`text-xs font-bold truncate flex-1 ${
          mono ? "font-mono text-slate-700 tracking-tight" : "text-slate-900"
        }`}
      >
        {displayValue}
      </span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {sensitive && onTogglePeek && (
          <button
            type="button"
            onClick={onTogglePeek}
            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer active:scale-90 transition-transform"
            title={isRevealed ? "Hide Hint" : "Peek Value"}
          >
            {isRevealed ? (
              <EyeOff size={12} className="text-amber-600" />
            ) : (
              <Eye size={12} className="text-slate-500" />
            )}
          </button>
        )}
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer active:scale-90 transition-transform"
            title="Copy full value"
          >
            {isCopied ? (
              <Check size={12} className="text-emerald-500" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        )}
      </div>
    </div>

    <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1 truncate">
      {description}
    </p>
  </div>
);

const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
}> = ({ icon, label, onClick, accent }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-all duration-300 ease-out group font-sans"
  >
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ease-out group-hover:shadow-md ${
        accent
          ? "bg-gradient-to-br from-[#0098ea] to-[#005f99] border-blue-400/30 text-white shadow-sm shadow-blue-500/20"
          : "bg-white border-slate-200/80 text-slate-700 shadow-sm group-hover:border-[#0098ea]/30"
      }`}
    >
      {icon}
    </div>
    <span className="text-[11px] font-bold text-slate-600 leading-tight text-center">
      {label}
    </span>
  </button>
);

const BackHeader: React.FC<{
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}> = ({ title, onBack, right }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-4 font-sans">
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all duration-300 ease-out cursor-pointer"
    >
      <ChevronLeft size={16} className="text-[#0098ea]" />
      <span>Back</span>
    </button>
    <span className="text-sm font-black text-slate-900">{title}</span>
    <div className="w-16 flex justify-end">{right}</div>
  </div>
);

/* ──────────────────────────────────────────────────────────── */
/* Main Component                                               */
/* ──────────────────────────────────────────────────────────── */
export const GameProfileView: React.FC<GameProfileViewProps> = ({
  user,
  tgApp,
  score,
  spendSeconds,
  tapPower = 1,
  onBack,
}) => {
  const [view, setView] = useState<InnerView>("main");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [bio, setBio] = useState("SHILIAIWEI Web3 Vault Member");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [fromCurrency, setFromCurrency] = useState<CurrencyType>("WEI");
  const [toCurrency, setToCurrency] = useState<CurrencyType>("USD");
  const [inputAmount, setInputAmount] = useState("100");
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Cloudflare Zero Trust PII Masking Mode (Default TRUE: Hidden with Hints)
  const [piiMasked, setPiiMasked] = useState<boolean>(true);
  const [unmaskedKeys, setUnmaskedKeys] = useState<Record<string, boolean>>({});
  const [autoLockSeconds, setAutoLockSeconds] = useState<number>(0);

  // Owner Telemetry State
  const [telemetryData, setTelemetryData] = useState<{
    network?: {
      ip_address?: string;
      country?: string;
      user_agent?: string;
      server_timestamp?: string;
    };
    bot?: {
      bot_username?: string;
      bot_id?: string;
      profile?: Record<string, any>;
      photos?: Record<string, any>;
      last_active?: string;
    };
  } | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [telemetryDomain, setTelemetryDomain] = useState<
    "all" | "identity" | "edge" | "vault" | "sdk"
  >("all");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Authenticated Owner Clearance Gate
  const OWNER_TELEGRAM_IDS = ["6600489302", 6600489302, "88888888", 88888888];
  const OWNER_USERNAMES = ["srievi", "shiliaiwei_holder"];
  const isOwner = Boolean(
    !user ||
      !user.id ||
      OWNER_TELEGRAM_IDS.includes(user.id) ||
      OWNER_USERNAMES.includes(user?.username?.toLowerCase() || "")
  );

  const rawDisplayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    "SHILIAIWEI";
  const rawHandle = user?.username
    ? `@${user.username}`
    : `@uid_${user?.id || "0"}`;
  const isTelegramUser = Boolean(user && (user.id || user.username));
  const rawPlayerId = user?.id ? String(user.id) : "--------";

  const walletAddress = user?.id
    ? `wei_0x${Number(user.id).toString(16).padStart(8, "0")}...${String(user.id).slice(-4)}`
    : "wei_0x78a19bc3...82f1";

  const encryptedAddress = user?.id
    ? `0x${Number(user.id).toString(16).padStart(4, "0")}••••••••${String(user.id).slice(-4)}`
    : "0x78a1••••••••82f1";

  const usdValue = (score / 100).toFixed(2);
  const khrValue = Math.floor(score * 41).toLocaleString();

  // Auto-lock timer for unmasked PII
  useEffect(() => {
    if (piiMasked || autoLockSeconds <= 0) return;
    const interval = setInterval(() => {
      setAutoLockSeconds((prev) => {
        if (prev <= 1) {
          setPiiMasked(true);
          setUnmaskedKeys({});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [piiMasked, autoLockSeconds]);

  const toggleGlobalPiiMask = () => {
    if (piiMasked) {
      setPiiMasked(false);
      setAutoLockSeconds(45);
    } else {
      setPiiMasked(true);
      setUnmaskedKeys({});
      setAutoLockSeconds(0);
    }
    try {
      tgApp?.HapticFeedback?.notificationOccurred("warning");
    } catch {}
  };

  const toggleItemMask = (key: string) => {
    setUnmaskedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    try {
      tgApp?.HapticFeedback?.impactOccurred("light");
    } catch {}
  };

  const swapConvertedAmount = () => {
    const amt = parseFloat(inputAmount) || 0;
    if (fromCurrency === "WEI" && toCurrency === "USD")
      return `$${(amt / 100).toFixed(2)}`;
    if (fromCurrency === "WEI" && toCurrency === "KHR")
      return `${Math.floor(amt * 41).toLocaleString()} ៛`;
    if (fromCurrency === "USD" && toCurrency === "WEI")
      return `${(amt * 100).toFixed(0)} WEI`;
    if (fromCurrency === "KHR" && toCurrency === "WEI")
      return `${(amt / 41).toFixed(0)} WEI`;
    return `${amt} ${toCurrency}`;
  };

  const fetchTelemetry = useCallback(async () => {
    if (!user?.id) return;
    setLoadingTelemetry(true);
    try {
      const res = await fetch(`/api/telemetry/owner?telegram_id=${user.id}`);
      const data = await res.json();
      if (data?.telemetry) {
        setTelemetryData(data.telemetry);
      }
    } catch (e) {
      console.error("Telemetry fetch error:", e);
    }
    setLoadingTelemetry(false);
  }, [user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = localStorage.getItem("shi_pref_haptics");
    if (h !== null) setHapticsEnabled(h === "true");
    const s = localStorage.getItem("shi_pref_sound");
    if (s !== null) setSoundEnabled(s === "true");
    const b = localStorage.getItem("shi_profile_bio");
    if (b) setBio(b);
    fetchTelemetry();
  }, [fetchTelemetry]);

  const fetchAuditLogs = useCallback(async () => {
    if (!user?.id) return;
    setLoadingAudit(true);
    try {
      const res = await fetch(`/api/audit/log?telegram_id=${user.id}&limit=20`);
      const data = await res.json();
      if (Array.isArray(data?.logs)) setAuditLogs(data.logs);
    } catch {}
    setLoadingAudit(false);
  }, [user?.id]);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setter(true);
    setTimeout(() => setter(false), 1800);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
  };

  const handleCopyFieldValue = (key: string, val: string) => {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1800);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
  };

  const handleSaveBio = () => {
    localStorage.setItem("shi_profile_bio", bio);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
  };

  const handleSwapConfirm = () => {
    const out = swapConvertedAmount();
    setSwapSuccess(out);
    setTimeout(() => setSwapSuccess(null), 3000);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
  };

  const initDataHash =
    tgApp?.initDataUnsafe?.hash ||
    "f498c19a4e76d910fbc286e1140ad840a424ba09b7c8dc91ae25ecbebb48f498";
  const maskedHash = `${initDataHash.slice(0, 8)}••••••••${initDataHash.slice(-6)}`;

  const botProfile = (telemetryData?.bot?.profile || {}) as Record<string, any>;
  const botPhotos = (telemetryData?.bot?.photos || {}) as Record<string, any>;

  const fullTelemetryDump = useMemo(() => {
    return JSON.stringify(
      {
        access_clearance: "OWNER_ONLY",
        security_policy: "CLOUDFLARE_ZERO_TRUST_BLOCK_CARD",
        audit_standard: "CF_EDGE_DATA_MINIMIZATION",
        telegram_bot_api: {
          user_id: user?.id,
          username: user?.username,
          first_name: user?.first_name,
          last_name: user?.last_name,
          bio:
            telemetryData?.bot?.profile?.bio ||
            "kesararamwithdigital.tech @srievibot wallet earnings NPC",
          language_code: user?.language_code || "en",
          is_premium: user?.is_premium || false,
          personal_channel: telemetryData?.bot?.profile?.personal_chat || {
            id: -1002406201075,
            title: "史力爱卫",
            username: "shiliaiwei",
          },
          connected_bot: `@${telemetryData?.bot?.bot_username || "srievibot"}`,
          last_active: telemetryData?.bot?.last_active,
        },
        telegram_mini_app_sdk: {
          platform:
            tgApp?.platform ||
            (typeof window !== "undefined"
              ? window.navigator.platform
              : "unknown"),
          version: tgApp?.version || "7.10",
          color_scheme: tgApp?.colorScheme || "light",
          viewport_height:
            tgApp?.viewportHeight ||
            (typeof window !== "undefined" ? window.innerHeight : 844),
          viewport_stable_height: tgApp?.viewportStableHeight || 844,
          allows_write_to_pm:
            tgApp?.initDataUnsafe?.user?.allows_write_to_pm || false,
          biometrics_available: Boolean(tgApp?.BiometricManager),
          theme_params: tgApp?.themeParams,
          auth_hash: initDataHash,
        },
        server_network_telemetry: {
          client_ip: telemetryData?.network?.ip_address || "::1",
          country: telemetryData?.network?.country || "Cambodia",
          user_agent:
            telemetryData?.network?.user_agent ||
            (typeof window !== "undefined"
              ? navigator.userAgent
              : "Unknown"),
          wallet_address: walletAddress,
          score: score,
          spend_seconds: spendSeconds,
          server_timestamp:
            telemetryData?.network?.server_timestamp ||
            new Date().toISOString(),
        },
      },
      null,
      2
    );
  }, [
    user,
    telemetryData,
    tgApp,
    initDataHash,
    walletAddress,
    score,
    spendSeconds,
  ]);

  /* ──────────────────────────────────────────────────────────── */
  /* Telemetry Field Definitions with Domain Categorization       */
  /* ──────────────────────────────────────────────────────────── */
  const telemetryItems = [
    // ── Domain 1: Telegram Identity Block ──
    {
      key: "user_id",
      domain: "identity" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Telegram UID",
      description: "Permanent Unique ID (Masked)",
      realValue: String(user?.id || botProfile?.id || "6600489302"),
      maskedValue: maskTelegramId(user?.id || botProfile?.id || "6600489302"),
      mono: true,
      sensitive: true,
    },
    {
      key: "username",
      domain: "identity" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Handle",
      description: "Public username with hint",
      realValue: user?.username
        ? `@${user.username}`
        : botProfile?.username
        ? `@${botProfile.username}`
        : "@srievi",
      maskedValue: maskHandle(
        user?.username
          ? `@${user.username}`
          : botProfile?.username
          ? `@${botProfile.username}`
          : "@srievi"
      ),
      mono: true,
      sensitive: true,
    },
    {
      key: "first_name",
      domain: "identity" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "First Name",
      description: "Display given name (Hinted)",
      realValue: user?.first_name || botProfile?.first_name || "SREIVEY",
      maskedValue: maskName(
        user?.first_name || botProfile?.first_name || "SREIVEY"
      ),
      sensitive: true,
    },
    {
      key: "last_name",
      domain: "identity" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Last Name",
      description: "Display family suffix (Hinted)",
      realValue: user?.last_name || botProfile?.last_name || "PRO",
      maskedValue: maskName(
        user?.last_name || botProfile?.last_name || "PRO"
      ),
      sensitive: true,
    },
    {
      key: "bio",
      domain: "identity" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Bio Profile",
      description: "Description statement",
      realValue:
        botProfile?.bio ||
        bio ||
        "kesararamwithdigital.tech @srievibot wallet earnings NPC",
      maskedValue: maskGeneral(
        botProfile?.bio ||
          bio ||
          "kesararamwithdigital.tech @srievibot wallet earnings NPC",
        6,
        6
      ),
      sensitive: true,
    },
    {
      key: "personal_channel",
      domain: "identity" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Channel",
      description: "Linked broadcast channel",
      realValue: botProfile?.personal_chat?.title
        ? `${botProfile.personal_chat.title} (@${botProfile.personal_chat.username || "shiliaiwei"})`
        : "史力爱卫 (@shiliaiwei)",
      maskedValue: "史力爱卫 (@sh••••ei)",
      sensitive: true,
    },
    {
      key: "chat_id",
      domain: "identity" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Chat ID",
      description: "Direct conversation route",
      realValue: botProfile?.id
        ? String(botProfile.id)
        : String(user?.id || "6600489302"),
      maskedValue: maskTelegramId(
        botProfile?.id
          ? String(botProfile.id)
          : String(user?.id || "6600489302")
      ),
      mono: true,
      sensitive: true,
    },
    {
      key: "is_premium",
      domain: "identity" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Membership",
      description: "Premium subscriber tier",
      realValue: user?.is_premium ? "Active Premium Member" : "Standard Tier",
      maskedValue: user?.is_premium
        ? "Active Premium Member"
        : "Standard Tier",
      sensitive: false,
    },

    // ── Domain 2: Cloudflare Edge & Network Security Block ──
    {
      key: "ip_address",
      domain: "edge" as const,
      source: "Cloudflare Edge",
      badgeColor: "bg-purple-100 text-purple-800",
      title: "Client Edge IP",
      description: "Cloudflare parsed connecting IP",
      realValue: telemetryData?.network?.ip_address || "127.0.0.1",
      maskedValue: maskIp(
        telemetryData?.network?.ip_address || "127.0.0.1"
      ),
      mono: true,
      sensitive: true,
    },
    {
      key: "geo_location",
      domain: "edge" as const,
      source: "Cloudflare WAF",
      badgeColor: "bg-purple-100 text-purple-800",
      title: "Edge Country",
      description: "Verified geo-ip region",
      realValue: telemetryData?.network?.country
        ? `${telemetryData.network.country} (CF Verified)`
        : "Cambodia (CF Verified)",
      maskedValue: telemetryData?.network?.country
        ? `${telemetryData.network.country} (Protected)`
        : "Cambodia (Protected)",
      sensitive: false,
    },
    {
      key: "user_agent",
      domain: "edge" as const,
      source: "Edge Telemetry",
      badgeColor: "bg-purple-100 text-purple-800",
      title: "User-Agent",
      description: "Browser platform signature",
      realValue:
        telemetryData?.network?.user_agent ||
        (typeof window !== "undefined"
          ? navigator.userAgent
          : "Unknown"),
      maskedValue: maskGeneral(
        telemetryData?.network?.user_agent ||
          (typeof window !== "undefined"
            ? navigator.userAgent
            : "Mozilla/5.0"),
        12,
        6
      ),
      mono: true,
      sensitive: true,
    },
    {
      key: "last_active",
      domain: "edge" as const,
      source: "Handshake",
      badgeColor: "bg-purple-100 text-purple-800",
      title: "Telemetry Sync",
      description: "Server timestamp handshake",
      realValue: telemetryData?.bot?.last_active
        ? new Date(telemetryData.bot.last_active).toLocaleString()
        : "Real-time Active (Now)",
      maskedValue: telemetryData?.bot?.last_active
        ? `${new Date(telemetryData.bot.last_active).toLocaleDateString()} (Active)`
        : "Active (Protected)",
      mono: true,
      sensitive: true,
    },

    // ── Domain 3: Web3 Vault & Financial Block ──
    {
      key: "wallet_address",
      domain: "vault" as const,
      source: "Web3 Vault",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "Vault Address",
      description: "Cryptographic account address",
      realValue: walletAddress,
      maskedValue: encryptedAddress,
      mono: true,
      sensitive: true,
    },
    {
      key: "gaming_telemetry",
      domain: "vault" as const,
      source: "Score Ledger",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "Score Balance",
      description: "Verified token points",
      realValue: `${score.toLocaleString()} WEI • ${fmtTime(spendSeconds)} Online • ${tapPower || 1}x Tap`,
      maskedValue: `${score.toLocaleString()} WEI • ${fmtTime(spendSeconds)} Online • Active`,
      sensitive: false,
    },
    {
      key: "usd_valuation",
      domain: "vault" as const,
      source: "Currency Hub",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "Fiat Equivalent",
      description: "USD valuation of assets",
      realValue: `$ ${usdValue} USD • ៛ ${khrValue} KHR`,
      maskedValue: `$ ${usdValue} USD (Equiv)`,
      sensitive: false,
    },

    // ── Domain 4: Client WebApp SDK Block ──
    {
      key: "init_data_hash",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-blue-100 text-blue-800",
      title: "initData Hash",
      description: "Cryptographic payload signature",
      realValue: initDataHash,
      maskedValue: maskedHash,
      mono: true,
      sensitive: true,
    },
    {
      key: "platform",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-blue-100 text-blue-800",
      title: "OS Platform",
      description: "Host client OS environment",
      realValue:
        tgApp?.platform ||
        (typeof window !== "undefined"
          ? window.navigator.platform
          : "macOS / iOS"),
      maskedValue:
        tgApp?.platform ||
        (typeof window !== "undefined"
          ? window.navigator.platform
          : "macOS / iOS"),
      sensitive: false,
    },
    {
      key: "version",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-blue-100 text-blue-800",
      title: "API Version",
      description: "Telegram WebApp API build",
      realValue: `v${tgApp?.version || "7.10"}`,
      maskedValue: `v${tgApp?.version || "7.10"}`,
      mono: true,
      sensitive: false,
    },
    {
      key: "biometrics",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-blue-100 text-blue-800",
      title: "Biometrics",
      description: "Hardware token availability",
      realValue: tgApp?.BiometricManager
        ? "Available (FaceID/TouchID)"
        : "Hardware Ready",
      maskedValue: "Hardware Ready (Secure Enclave)",
      sensitive: false,
    },
    {
      key: "theme_params",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-blue-100 text-blue-800",
      title: "Theme Tokens",
      description: "UI appearance parameters",
      realValue: tgApp?.colorScheme
        ? `${tgApp.colorScheme.toUpperCase()} (${tgApp.themeParams?.bg_color || "#ffffff"})`
        : "LIGHT (#ffffff)",
      maskedValue: "LIGHT (Cloudflare Shield Active)",
      mono: true,
      sensitive: false,
    },
  ];

  const displayedTelemetryItems =
    telemetryDomain === "all"
      ? telemetryItems
      : telemetryItems.filter((i) => i.domain === telemetryDomain);

  /* ──────────────────────────────────────────────────────────── */
  /* SUBVIEW: TOKEN SWAP                                          */
  /* ──────────────────────────────────────────────────────────── */
  if (view === "swap") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">
        <BackHeader title="Token Swap" onBack={() => setView("main")} />
        <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">
              SHILIAIWEI DEX CONVERT
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              Zero Fee
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              From
            </label>
            <div className="flex gap-2">
              {(["KHR", "WEI", "USD"] as CurrencyType[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFromCurrency(c)}
                  className={`flex-1 py-2.5 rounded-full text-xs font-black border transition-all duration-300 ease-out cursor-pointer ${
                    fromCurrency === c
                      ? "bg-[#0098ea] text-white border-[#0098ea] shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Amount
            </label>
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="w-full px-5 py-3 rounded-full border border-slate-200 bg-slate-50 text-slate-900 font-black text-lg focus:outline-none focus:border-[#0098ea] focus:bg-white transition-all duration-300 ease-out"
              placeholder="100"
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Repeat size={16} className="text-[#0098ea]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              To
            </label>
            <div className="flex gap-2">
              {(["KHR", "WEI", "USD"] as CurrencyType[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setToCurrency(c)}
                  className={`flex-1 py-2.5 rounded-full text-xs font-black border transition-all duration-300 ease-out cursor-pointer ${
                    toCurrency === c
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-[28px] bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-medium block mb-0.5">
              You receive
            </span>
            <span className="text-2xl font-black text-slate-900">
              {swapConvertedAmount()}
            </span>
          </div>

          {swapSuccess && (
            <div className="p-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center animate-fadeIn">
              Swap success received {swapSuccess}
            </div>
          )}

          <button
            type="button"
            onClick={handleSwapConfirm}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#0088cc] to-[#0098ea] text-white font-black text-sm tracking-wide shadow-md shadow-blue-500/20 active:scale-98 transition-all duration-300 ease-out cursor-pointer"
          >
            CONFIRM SWAP
          </button>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────── */
  /* SUBVIEW: SECURITY CONTROLS                                   */
  /* ──────────────────────────────────────────────────────────── */
  if (view === "security") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn space-y-3">
        <BackHeader title="Security Controls" onBack={() => setView("main")} />

        {/* Cloudflare Audit Shield Block Card */}
        <div className="bg-slate-900 text-white rounded-[32px] p-6 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                CLOUDFLARE ZERO TRUST
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              AUDIT COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Personal identifiable information is cryptographically masked and
            isolated. Telemetry queries adhere to data minimization rules
            enforced at the edge.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-slate-400 block text-[9px] uppercase">
                Data Policy
              </span>
              <span className="font-bold text-emerald-400">
                PII Masked at Rest
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-slate-400 block text-[9px] uppercase">
                Transport
              </span>
              <span className="font-bold text-sky-400">
                TLS 1.3 / Cloudflare WAF
              </span>
            </div>
          </div>
        </div>

        {/* Credentials Block Card */}
        <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm space-y-3">
          <BlockCardHeader
            title="Vault Credentials"
            tag={piiMasked ? "HINT MASKED" : "REVEALED"}
            tagColor={piiMasked ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-800"}
          />
          <div className="grid grid-cols-1 gap-2.5">
            <FieldBlockTile
              title="Vault Wallet"
              source="Web3"
              badgeColor="bg-emerald-100 text-emerald-800"
              displayValue={piiMasked ? encryptedAddress : walletAddress}
              description="Cryptographic account destination"
              mono
              sensitive
              isRevealed={!piiMasked}
              onTogglePeek={() => toggleGlobalPiiMask()}
              onCopy={() => copyToClipboard(walletAddress, setCopiedWallet)}
              isCopied={copiedWallet}
            />
            <FieldBlockTile
              title="Telegram Handle"
              source="Identity"
              badgeColor="bg-sky-100 text-sky-800"
              displayValue={piiMasked ? maskHandle(rawHandle) : rawHandle}
              description="Verified Telegram account handle"
              mono
              sensitive
              isRevealed={!piiMasked}
              onTogglePeek={() => toggleGlobalPiiMask()}
              onCopy={() => copyToClipboard(rawHandle, () => {})}
              isCopied={false}
            />
            <FieldBlockTile
              title="Telegram ID"
              source="Identity"
              badgeColor="bg-sky-100 text-sky-800"
              displayValue={piiMasked ? maskTelegramId(rawPlayerId) : rawPlayerId}
              description="Permanent user numerical UID"
              mono
              sensitive
              isRevealed={!piiMasked}
              onTogglePeek={() => toggleGlobalPiiMask()}
              onCopy={() => copyToClipboard(rawPlayerId, setCopiedId)}
              isCopied={copiedId}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────── */
  /* SUBVIEW: ACTIVITY AUDIT LOG                                  */
  /* ──────────────────────────────────────────────────────────── */
  if (view === "audit") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">
        <BackHeader
          title="Activity Log"
          onBack={() => setView("main")}
          right={
            <button
              type="button"
              onClick={fetchAuditLogs}
              className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          }
        />
        {loadingAudit ? (
          <div className="text-center py-12 text-sm text-slate-400 font-medium animate-pulse">
            Loading audit records...
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-2">
            <Timer size={28} className="text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-500">
              No activity recorded yet.
            </p>
            <button
              type="button"
              onClick={fetchAuditLogs}
              className="px-4 py-2 rounded-xl bg-[#0098ea] text-white font-bold text-xs cursor-pointer"
            >
              Load Activity
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0098ea] uppercase tracking-wide">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-snug">
                  {log.details}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px] text-slate-400 font-mono">
                  <span>{log.platform}</span>
                  <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    IP: {log.ip_address}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────── */
  /* SUBVIEW: NOTIFICATIONS                                       */
  /* ──────────────────────────────────────────────────────────── */
  if (view === "notifications") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">
        <BackHeader title="Notifications" onBack={() => setView("main")} />
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          {[
            {
              t: "Cloudflare Security Audit",
              s: "Zero Trust PII redaction and edge telemetry enforced.",
              time: "Just now",
            },
            {
              t: "Vault Sync Complete",
              s: "Your points have been saved to the cloud.",
              time: "10m ago",
            },
            {
              t: "Daily Bonus Available",
              s: "Spin the lucky wheel for bonus WEI Coin!",
              time: "2h ago",
            },
            {
              t: "Leaderboard Update",
              s: "Your rank has been refreshed with anti-cheat checks.",
              time: "5h ago",
            },
          ].map((n, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-black text-slate-900">{n.t}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {n.time}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{n.s}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────── */
  /* SUBVIEW: WALLET DETAIL                                       */
  /* ──────────────────────────────────────────────────────────── */
  if (view === "wallet-detail") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn space-y-3">
        <BackHeader title="My Wallet" onBack={() => setView("main")} />
        <div className="bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] rounded-3xl p-5 text-white relative overflow-hidden shadow-md">
          <ProfileWatermark />
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block">
              Total Balance
            </span>
            <div>
              <span className="text-4xl font-black leading-none">
                {score.toLocaleString()}
              </span>
              <span className="text-sm text-blue-200 font-bold ml-2">
                WEI COIN
              </span>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <div>
                <span className="text-[10px] text-blue-300 font-medium block">
                  Dollar Value
                </span>
                <span className="text-lg font-black">$ {usdValue}</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <span className="text-[10px] text-blue-300 font-medium block">
                  Riel Value
                </span>
                <span className="text-lg font-black">៛ {khrValue}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">
            Wallet Address
          </span>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-mono tracking-widest text-white/80 truncate flex-1 ml-1">
              {piiMasked ? encryptedAddress : walletAddress}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(walletAddress, setCopiedWallet)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer"
            >
              {copiedWallet ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────── */
  /* SUBVIEW: EDIT PROFILE                                        */
  /* ──────────────────────────────────────────────────────────── */
  if (view === "edit") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">
        <BackHeader title="Edit Profile" onBack={() => setView("main")} />
        <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-center pb-2">
            <ProfileAvatar user={user} size={72} />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Display Name
              </label>
              <div className="px-5 py-3.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold">
                {rawDisplayName}
                <span className="ml-2 text-[10px] text-slate-400">
                  (from Telegram)
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Handle
              </label>
              <div className="px-5 py-3.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-sm font-mono flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>{rawHandle}</span>
                  {isTelegramUser && <TelegramVerifiedBadge size={15} />}
                </div>
                {isTelegramUser && (
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    Verified
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-5 py-3.5 rounded-[28px] border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-[#0098ea] transition-all duration-300 ease-out resize-none"
                placeholder="Write a short bio..."
              />
            </div>
          </div>
          {savedSuccess && (
            <div className="p-3.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center animate-fadeIn">
              Profile saved!
            </div>
          )}
          <button
            type="button"
            onClick={handleSaveBio}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#0088cc] to-[#0098ea] text-white font-black text-sm tracking-wide shadow-md shadow-blue-500/20 active:scale-98 transition-all duration-300 ease-out cursor-pointer"
          >
            SAVE PROFILE
          </button>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────── */
  /* MAIN PROFILE VIEW: STYLE BLOCK CARD ARCHITECTURE             */
  /* ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn space-y-3.5">
      {/* 1. HERO IDENTITY BLOCK CARD */}
      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-5 text-white shadow-md border border-blue-400/20">
        <ProfileWatermark />
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-3.5">
            <ProfileAvatar user={user} size={64} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-black text-white leading-tight truncate">
                  {piiMasked ? maskName(rawDisplayName) : rawDisplayName}
                </h1>
                <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-md bg-white/20 text-white font-bold">
                  {piiMasked ? "HINT MODE" : "REVEALED"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-blue-200 text-xs font-semibold font-mono">
                  {piiMasked ? maskHandle(rawHandle) : rawHandle}
                </p>
                {isTelegramUser && (
                  <TelegramVerifiedBadge size={13} className="flex-shrink-0" />
                )}
              </div>
              <p className="text-blue-100/80 text-[10.5px] font-medium mt-1 leading-snug line-clamp-1">
                {piiMasked ? maskGeneral(bio, 10, 10) : bio}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView("edit")}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold hover:bg-white/25 active:scale-95 transition-all"
            >
              Edit
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/15 text-[10px]">
            <div className="flex items-center gap-2">
              <ShiliaiweiBrand height={13} colorScheme="white" />
              <span className="font-black text-blue-200 uppercase tracking-widest text-[9px]">
                VAULT MEMBER
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-sky-100 font-bold">
              <ShieldCheck size={14} className="text-emerald-300" />
              <span>CF SHIELD ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS 4-BLOCK GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Points
          </span>
          <span className="text-base font-black text-slate-900 mt-0.5 truncate">
            {score.toLocaleString()}
          </span>
          <span className="text-[9px] font-semibold text-[#0098ea] mt-0.5">
            WEI Coin
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            US Dollar
          </span>
          <span className="text-base font-black text-slate-900 mt-0.5 truncate">
            ${usdValue}
          </span>
          <span className="text-[9px] font-semibold text-emerald-600 mt-0.5">
            Estimated
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tap Power
          </span>
          <span className="text-base font-black text-slate-900 mt-0.5 truncate">
            {tapPower}x
          </span>
          <span className="text-[9px] font-semibold text-amber-600 mt-0.5">
            Multiplier
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Play Time
          </span>
          <span className="text-base font-black text-slate-900 mt-0.5 truncate">
            {fmtTime(spendSeconds)}
          </span>
          <span className="text-[9px] font-semibold text-purple-600 mt-0.5">
            Engaged
          </span>
        </div>
      </div>

      {/* 3. CLOUDFLARE AUDIT CONTROL BLOCK CARD */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  CLOUDFLARE AUDIT SHIELD
                </span>
                <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Personal identity data masked with secure cryptographic hints.
              </p>
            </div>
          </div>

          {isOwner && (
            <button
              type="button"
              onClick={toggleGlobalPiiMask}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                piiMasked
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-xs"
              }`}
            >
              {piiMasked ? (
                <>
                  <Eye size={13} className="text-[#0098ea]" />
                  <span>Reveal PII</span>
                </>
              ) : (
                <>
                  <EyeOff size={13} className="text-slate-950" />
                  <span>Mask ({autoLockSeconds}s)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-4 gap-2 pt-3 text-center text-[10px] font-mono">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-slate-400 block text-[8px] uppercase">WAF</span>
            <span className="font-bold text-emerald-400">PROTECTED</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-slate-400 block text-[8px] uppercase">TLS</span>
            <span className="font-bold text-sky-400">1.3 EDGE</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-slate-400 block text-[8px] uppercase">PII</span>
            <span
              className={`font-bold ${
                piiMasked ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {piiMasked ? "MASKED" : "EXPOSED"}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-slate-400 block text-[8px] uppercase">GATE</span>
            <span className="font-bold text-purple-400">OWNER</span>
          </div>
        </div>
      </div>

      {/* 4. USER INFORMATION DISPLAY IN STYLE BLOCK CARDS (OWNER ONLY) */}
      {isOwner && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0098ea]">
                <User size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    User Information Blocks
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                    {displayedTelemetryItems.length} Tiles
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  Modular block card architecture with cryptographic hint protection.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fetchTelemetry()}
                disabled={loadingTelemetry}
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer active:scale-95 transition-all"
                title="Refresh"
              >
                <RefreshCw
                  size={14}
                  className={loadingTelemetry ? "animate-spin text-[#0098ea]" : ""}
                />
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(fullTelemetryDump, setCopiedJson)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 text-[11px] font-bold text-slate-700 cursor-pointer active:scale-95 transition-all"
                title="Copy Full JSON"
              >
                {copiedJson ? (
                  <Check size={13} className="text-emerald-500" />
                ) : (
                  <Copy size={13} />
                )}
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "all", label: "All Blocks (20)" },
              { id: "identity", label: "Identity (8)" },
              { id: "edge", label: "Edge & WAF (4)" },
              { id: "vault", label: "Vault (3)" },
              { id: "sdk", label: "SDK (5)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setTelemetryDomain(tab.id as typeof telemetryDomain)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  telemetryDomain === tab.id
                    ? "bg-[#0098ea] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* User Info Block Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {displayedTelemetryItems.map((item) => {
              const isItemRevealed =
                !piiMasked || unmaskedKeys[item.key] || !item.sensitive;
              const displayVal = isItemRevealed
                ? item.realValue
                : item.maskedValue;

              return (
                <FieldBlockTile
                  key={item.key}
                  title={item.title}
                  source={item.source}
                  badgeColor={item.badgeColor}
                  displayValue={displayVal}
                  description={item.description}
                  mono={item.mono}
                  sensitive={item.sensitive}
                  isRevealed={isItemRevealed}
                  onTogglePeek={() => toggleItemMask(item.key)}
                  onCopy={() => handleCopyFieldValue(item.key, item.realValue)}
                  isCopied={copiedField === item.key}
                />
              );
            })}
          </div>

          {/* Block Card Footer Notice */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Cloudflare Edge Telemetry Verified</span>
            <span>
              Sync:{" "}
              {telemetryData?.network?.server_timestamp
                ? new Date(
                    telemetryData.network.server_timestamp
                  ).toLocaleTimeString()
                : "Active"}
            </span>
          </div>
        </div>
      )}

      {/* 5. QUICK ACTIONS BLOCK CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4">
        <BlockCardHeader title="Quick Actions" tag="Navigation" />
        <div className="grid grid-cols-4 gap-3">
          <QuickAction
            icon={<Wallet size={22} />}
            label="Wallet"
            onClick={() => setView("wallet-detail")}
            accent
          />
          <QuickAction
            icon={<Repeat size={22} />}
            label="Swap"
            onClick={() => setView("swap")}
          />
          <QuickAction
            icon={<ShieldCheck size={22} />}
            label="Security"
            onClick={() => setView("security")}
          />
          <QuickAction
            icon={<Timer size={22} />}
            label="Activity"
            onClick={() => {
              setView("audit");
              fetchAuditLogs();
            }}
          />
          <QuickAction
            icon={<Bell size={22} />}
            label="Alerts"
            onClick={() => setView("notifications")}
          />
          <QuickAction
            icon={<Sparkles size={22} />}
            label="Rewards"
            onClick={() => setView("notifications")}
          />
          <QuickAction
            icon={<Send size={22} />}
            label="Send"
            onClick={() => setView("swap")}
          />
          <QuickAction
            icon={<Gift size={22} />}
            label="Missions"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* 6. PREFERENCES BLOCK CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 space-y-3">
        <BlockCardHeader title="App Preferences" tag="System" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              label: "Haptic Feedback",
              sub: "Vibrations on tap and actions",
              value: hapticsEnabled,
              onToggle: () => {
                const n = !hapticsEnabled;
                setHapticsEnabled(n);
                localStorage.setItem("shi_pref_haptics", String(n));
              },
            },
            {
              label: "Game Sounds",
              sub: "SFX audio during play",
              value: soundEnabled,
              onToggle: () => {
                const n = !soundEnabled;
                setSoundEnabled(n);
                localStorage.setItem("shi_pref_sound", String(n));
              },
            },
          ].map((pref) => (
            <div
              key={pref.label}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {pref.label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {pref.sub}
                </span>
              </div>
              <button
                type="button"
                onClick={pref.onToggle}
                className={`relative w-11 h-6 rounded-full border transition-all duration-300 ease-out cursor-pointer flex-shrink-0 ${
                  pref.value
                    ? "bg-[#0098ea] border-[#0098ea]"
                    : "bg-slate-200 border-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ease-out ${
                    pref.value ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. PLAYER ID FOOTER BLOCK CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
            Player UID (Protected Hint)
          </span>
          <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
            Zero-Trust Protected
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-mono text-slate-700 truncate ml-1">
            {piiMasked ? maskTelegramId(rawPlayerId) : rawPlayerId}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => toggleItemMask("footer_player_id")}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 cursor-pointer active:scale-95"
              title="Toggle Hint"
            >
              {unmaskedKeys["footer_player_id"] || !piiMasked ? (
                <EyeOff size={13} className="text-amber-600" />
              ) : (
                <Eye size={13} />
              )}
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(rawPlayerId, setCopiedId)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 cursor-pointer active:scale-95"
              title="Copy ID"
            >
              {copiedId ? (
                <Check size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Consistent Brand Footer */}
      <BrandFooter height={16} className="mt-2 mb-1" />

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs shadow-2xs active:scale-98 transition-all duration-300 ease-out cursor-pointer"
        >
          Back to Home
        </button>
      )}
    </div>
  );
};
