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
  Repeat,
  Wallet,
  Shield,
  ShieldCheck,
  User,
  Bell,
  Eye,
  EyeOff,
  KeylineGamepad,
  Sliders,
} from "@/components/icons/KeylineIcons";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { BrandStatsQuadGrid } from "@/components/cards/BrandStatsQuadGrid";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";
import { UserSettingsView } from "./UserSettingsView";

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

export type ProfileSubTab = "profile" | "settings" | "swap" | "security" | "audit";
export type CurrencyType = "WEI" | "USD" | "KHR";

type InnerView =
  | "main"
  | "edit"
  | "settings"
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
  onLogout?: () => void;
}

/* ──────────────────────────────────────────────────────────── */
/* Masking & Formatting Helpers                                 */
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
/* UI Building Blocks: Homepage Skeuomorphic Style              */
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
      x="2%"
      y="2%"
      width="96%"
      height="96%"
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

const SpecularRim: React.FC = () => (
  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
);

const ProfileAvatar: React.FC<{
  user: TelegramUser | null;
  size?: number;
  photoUrl?: string;
}> = ({ user, size = 64, photoUrl }) => {
  const [imageError, setImageError] = useState(false);

  const effectivePhoto =
    !imageError &&
    (photoUrl ||
      user?.photo_url ||
      (user?.id && user.id > 0 ? `/api/player/avatar?telegram_id=${user.id}` : null));

  if (effectivePhoto) {
    return (
      <div
        className="rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={effectivePhoto}
          alt="avatar"
          width={size}
          height={size}
          className="w-full h-full object-cover"
          unoptimized
          onError={() => setImageError(true)}
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

/* Individual Interactive Block Tile Inside Category Panel */
interface InfoTileProps {
  label: string;
  source: string;
  displayValue: string;
  realValue: string;
  description: string;
  mono?: boolean;
  sensitive?: boolean;
  isRevealed?: boolean;
  onTogglePeek?: () => void;
  onCopy?: () => void;
  isCopied?: boolean;
}

const InfoTile: React.FC<InfoTileProps> = ({
  label,
  source,
  displayValue,
  description,
  mono,
  sensitive,
  isRevealed,
  onTogglePeek,
  onCopy,
  isCopied,
}) => (
  <div className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 min-w-0">
    <div className="flex items-center justify-between gap-1.5 mb-1.5">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[10.5px] font-black text-white uppercase tracking-wider truncate">
          {label}
        </span>
        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/15 text-white/90 shrink-0">
          {source}
        </span>
      </div>
    </div>

    {/* Value Pill Box */}
    <div className="my-1 py-1.5 px-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between gap-2 min-w-0">
      <span
        className={`text-xs font-bold truncate flex-1 ${
          mono ? "font-mono text-white/90 tracking-tight" : "text-white"
        }`}
      >
        {displayValue}
      </span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer active:scale-90 transition-transform"
            title="Copy full value"
          >
            {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-white/70" />}
          </button>
        )}
      </div>
    </div>

    <p className="text-[9.5px] text-white/60 font-medium leading-tight mt-0.5 truncate">
      {description}
    </p>
  </div>
);

const BackHeader: React.FC<{ title: string; onBack: () => void; right?: React.ReactNode }> = ({
  title,
  onBack,
  right,
}) => (
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
/* Main GameProfileView Component                              */
/* ──────────────────────────────────────────────────────────── */
export const GameProfileView: React.FC<GameProfileViewProps> = ({
  user,
  tgApp,
  score,
  spendSeconds,
  tapPower = 1,
  initialSubTab,
  onBack,
  onLogout,
}) => {
  const [view, setView] = useState<InnerView>(() => {
    if (initialSubTab === "settings") return "settings";
    if (initialSubTab === "swap") return "swap";
    if (initialSubTab === "security") return "security";
    if (initialSubTab === "audit") return "audit";
    return "main";
  });

  useEffect(() => {
    if (initialSubTab === "settings") setView("settings");
    else if (initialSubTab === "swap") setView("swap");
    else if (initialSubTab === "security") setView("security");
    else if (initialSubTab === "audit") setView("audit");
  }, [initialSubTab]);
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
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Authenticated Owner Clearance Gate
  const OWNER_TELEGRAM_IDS = ["6600489302", 6600489302];
  const OWNER_USERNAMES = ["srievi"];
  const isOwner = Boolean(
    user?.id &&
      (OWNER_TELEGRAM_IDS.includes(user.id) ||
        OWNER_USERNAMES.includes(user?.username?.toLowerCase() || ""))
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
  };

  const handleCopyFieldValue = (key: string, val: string) => {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleSaveBio = () => {
    localStorage.setItem("shi_profile_bio", bio);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
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

  const fullTelemetryDump = useMemo(() => {
    return JSON.stringify(
      {
        access_clearance: "OWNER_ONLY",
        security_standard: "CLOUDFLARE_ZERO_TRUST_BLOCK_PANEL",
        user_identity: {
          user_id: user?.id,
          username: user?.username,
          first_name: user?.first_name,
          last_name: user?.last_name,
          bio: botProfile?.bio || bio,
          channel: botProfile?.personal_chat?.title || "史力爱卫",
          chat_id: botProfile?.id || user?.id,
          is_premium: user?.is_premium || false,
        },
        network_edge: {
          client_ip: telemetryData?.network?.ip_address || "::1",
          country: telemetryData?.network?.country || "Cambodia",
          user_agent: telemetryData?.network?.user_agent || "Unknown",
          timestamp: telemetryData?.network?.server_timestamp || new Date().toISOString(),
        },
        web3_vault: {
          wallet_address: walletAddress,
          wei_coin_balance: score,
          usd_valuation: usdValue,
          spend_seconds: spendSeconds,
        },
        miniapp_sdk: {
          platform: tgApp?.platform || "macOS / iOS",
          version: tgApp?.version || "7.10",
          auth_hash: initDataHash,
          biometrics: Boolean(tgApp?.BiometricManager),
        },
      },
      null,
      2
    );
  }, [user, telemetryData, tgApp, initDataHash, walletAddress, score, spendSeconds, usdValue, bio, botProfile]);

  /* ──────────────────────────────────────────────────────────── */
  /* SUBVIEWS: SWAP, EDIT, SECURITY, AUDIT, NOTIFICATIONS         */
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">From</label>
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amount</label>
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">To</label>
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
            <span className="text-xs text-slate-500 font-medium block mb-0.5">You receive</span>
            <span className="text-2xl font-black text-slate-900">{swapConvertedAmount()}</span>
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

  if (view === "settings") {
    return (
      <UserSettingsView
        user={user}
        tgApp={tgApp}
        botProfile={botProfile}
        telemetryData={telemetryData}
        onBack={() => setView("main")}
      />
    );
  }

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
            <p className="text-sm font-bold text-slate-500">No activity recorded yet.</p>
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
              <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0098ea] uppercase tracking-wide">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-snug">{log.details}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px] text-slate-400 font-mono">
                  <span>{log.platform}</span>
                  <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">IP: {log.ip_address}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "notifications") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">
        <BackHeader title="Notifications" onBack={() => setView("main")} />
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          {[
            { t: "Cloudflare Security Audit", s: "Zero Trust PII redaction and edge telemetry enforced.", time: "Just now" },
            { t: "Vault Sync Complete", s: "Your WEI Coin balance has been saved to the cloud.", time: "10m ago" },
            { t: "Daily Bonus Available", s: "Spin the lucky wheel for bonus WEI Coin!", time: "2h ago" },
          ].map((n, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-black text-slate-900">{n.t}</span>
                <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{n.s}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Display Name</label>
              <div className="px-5 py-3.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold">
                {rawDisplayName}
                <span className="ml-2 text-[10px] text-slate-400">(from Telegram)</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Handle</label>
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Bio</label>
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
  /* MAIN REDESIGNED SCROLLING PROFILE (HOMEPAGE SKEUOMORPHIC UI) */
  /* ──────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100dvh-150px)] pb-28 select-none font-sans text-slate-900 max-w-xl mx-auto w-full px-2">
      <div className="w-full space-y-3.5 pt-1">
        {/* 1. SKEUOMORPHIC HERO IDENTITY BANKNOTE CARD */}
        <div
          className="relative w-full rounded-[28px] p-4 sm:p-5 overflow-hidden bg-gradient-to-b from-[#0088cc] via-[#006ea8] to-[#004d77] text-white"
          style={{
            boxShadow:
              "0 16px 36px -10px rgba(0, 110, 168, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
          }}
        >
          <GuillocheBackground opacity={0.25} />
          <ThreadStitching strokeColor="#bbf2f6" />
          <SpecularRim />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <ProfileAvatar user={user} size={64} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-base font-bold text-white drop-shadow-sm truncate">
                    {rawDisplayName}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <span className="text-xs font-mono text-cyan-200 font-semibold truncate">
                    {rawHandle}
                  </span>
                  {isTelegramUser && <TelegramVerifiedBadge size={13} className="shrink-0" />}
                </div>
                <p className="text-[11px] text-cyan-100/80 leading-snug line-clamp-1 mt-0.5">
                  {bio}
                </p>
              </div>
            </div>
          </div>

          {/* Integrated Frosted Glass Action Pills Row */}
          <div className="relative z-10 flex items-center justify-between pt-3 mt-3 border-t border-white/15 text-[10px] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShiliaiweiBrand height={13} colorScheme="white" />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  try {
                    tgApp?.HapticFeedback?.selectionChanged();
                  } catch {}
                  setView("settings");
                }}
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 text-white text-[10px] font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-1"
              >
                <Sliders size={11} />
                <span>Settings</span>
              </button>
              <button
                type="button"
                onClick={() => setView("edit")}
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[10px] font-bold cursor-pointer transition-all active:scale-95"
              >
                Edit Bio
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      tgApp?.HapticFeedback?.notificationOccurred("warning");
                    } catch {}
                    onLogout();
                  }}
                  className="px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 text-[10px] font-bold cursor-pointer transition-all active:scale-95"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. STATS 4-BLOCK BRAND CARDS (EXACT MATCH HOMEPAGE CARDS) */}
        <BrandStatsQuadGrid
          score={score}
          spendSeconds={spendSeconds}
          tapPower={tapPower}
          showBalance={true}
        />

        {/* 10. BRAND FOOTER (HOMEPAGE CONSISTENCY) */}
        <BrandFooter height={16} className="mt-3 pb-2" />
      </div>
    </div>
  );
};
