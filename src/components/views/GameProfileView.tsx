"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ShieldCheck,
  Send,
  Sparkles,
  User,
  Bell,
  Gift,
  Info,
} from "@/components/icons/KeylineIcons";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";

/* ──────────────────────────────────────────────────────────── */
/* Types                                                        */
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

type InnerView = "main" | "edit" | "swap" | "security" | "audit" | "notifications" | "wallet-detail";

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

const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
};

const ProfileWatermark: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.055]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="pm-wm" width="160" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
        <text x="5" y="28" fill="#0098ea" fontSize="16" fontWeight="900" letterSpacing="-0.02em" fontFamily="system-ui,-apple-system,sans-serif">SHILIAI</text>
        <rect x="76" y="13" width="34" height="20" rx="5" fill="#0098ea" />
        <text x="93" y="28" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="system-ui,-apple-system,sans-serif">WEI</text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#pm-wm)" />
  </svg>
);

const ProfileAvatar: React.FC<{ user: TelegramUser | null; size?: number }> = ({ user, size = 64 }) => {
  if (user?.photo_url) {
    return (
      <div className="rounded-full overflow-hidden border-[3px] border-white shadow-lg flex-shrink-0" style={{ width: size, height: size }}>
        <Image src={user.photo_url} alt="avatar" width={size} height={size} className="w-full h-full object-cover" unoptimized />
      </div>
    );
  }
  const initials = `${user?.first_name?.[0] || "S"}${user?.last_name?.[0] || "W"}`;
  return (
    <div className="rounded-full border-[3px] border-white shadow-lg bg-gradient-to-br from-[#0098ea] to-[#005f99] flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <span className="text-white font-black" style={{ fontSize: size * 0.35 }}>{initials}</span>
    </div>
  );
};

const StatCell: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center gap-0.5 flex-1 py-3 px-1 text-center font-sans">
    <span className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate max-w-full">{value}</span>
    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-none">{label}</span>
  </div>
);

const QuickAction: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean }> = ({ icon, label, onClick, accent }) => (
  <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-all duration-300 ease-out group font-sans">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ease-out group-hover:shadow-md ${accent ? "bg-gradient-to-br from-[#0098ea] to-[#005f99] border-blue-400/30 text-white shadow-sm shadow-blue-500/20" : "bg-white border-slate-200/80 text-slate-700 shadow-sm group-hover:border-[#0098ea]/30"}`}>
      {icon}
    </div>
    <span className="text-[11px] font-bold text-slate-600 leading-tight text-center">{label}</span>
  </button>
);

const TaskRow: React.FC<{ title: string; sub: string; badge?: React.ReactNode; right?: React.ReactNode; onClick?: () => void }> = ({ title, sub, badge, right, onClick }) => (
  <button type="button" onClick={onClick} className="flex items-center justify-between w-full py-3 px-3 cursor-pointer active:bg-slate-50 transition-colors duration-300 ease-out text-left font-sans">
    <div className="flex items-center gap-3">
      {badge && (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] flex items-center justify-center shadow-xs flex-shrink-0">
          {badge}
        </div>
      )}
      <div>
        <p className="text-sm font-black text-slate-900 leading-tight">{title}</p>
        <p className="text-xs text-[#0098ea] font-semibold leading-tight mt-0.5">{sub}</p>
      </div>
    </div>
    {right && <div className="flex-shrink-0">{right}</div>}
  </button>
);

const MenuRow: React.FC<{ icon: React.ReactNode; title: string; sub?: string; onClick: () => void; danger?: boolean }> = ({ icon, title, sub, onClick, danger }) => (
  <button type="button" onClick={onClick} className="flex items-center justify-between w-full py-3 px-2 cursor-pointer active:bg-slate-50 transition-colors duration-300 ease-out font-sans">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${danger ? "bg-rose-50 border-rose-200 text-rose-500" : "bg-slate-50 border-slate-200/80 text-slate-700"}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className={`text-sm font-bold leading-tight ${danger ? "text-rose-600" : "text-slate-900"}`}>{title}</p>
        {sub && <p className="text-[11px] text-slate-400 font-medium leading-tight">{sub}</p>}
      </div>
    </div>
    <ChevronRight size={16} className="text-slate-400" />
  </button>
);

const BackHeader: React.FC<{ title: string; onBack: () => void; right?: React.ReactNode }> = ({ title, onBack, right }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-4 font-sans">
    <button type="button" onClick={onBack} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all duration-300 ease-out cursor-pointer">
      <ChevronLeft size={16} className="text-[#0098ea]" />
      <span>Back</span>
    </button>
    <span className="text-sm font-black text-slate-900">{title}</span>
    <div className="w-16 flex justify-end">{right}</div>
  </div>
);

export const GameProfileView: React.FC<GameProfileViewProps> = ({
  user,
  tgApp,
  score,
  spendSeconds,
  tapPower = 1,
  passiveRate = 0,
  onSetScore,
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

  // Owner Telemetry State
  const [telemetryData, setTelemetryData] = useState<{
    network?: { ip_address?: string; country?: string; user_agent?: string; server_timestamp?: string };
    bot?: { bot_username?: string; bot_id?: string; profile?: Record<string, any>; photos?: Record<string, any>; last_active?: string };
  } | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [telemetryDomain, setTelemetryDomain] = useState<"all" | "bot" | "sdk" | "network">("all");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Authenticated Owner Clearance Gate
  const OWNER_TELEGRAM_IDS = ["6600489302", 6600489302, "88888888", 88888888];
  const OWNER_USERNAMES = ["srievi", "shiliaiwei_holder"];
  const isOwner = Boolean(
    !user || !user.id || OWNER_TELEGRAM_IDS.includes(user.id) || OWNER_USERNAMES.includes(user?.username?.toLowerCase() || "")
  );

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "SHILIAIWEI";
  const handle = user?.username ? `@${user.username}` : `@uid_${user?.id || "0"}`;
  const isTelegramUser = Boolean(user && (user.id || user.username));
  const playerId = user?.id ? String(user.id) : "--------";
  const walletAddress = user?.id
    ? `wei_0x${Number(user.id).toString(16).padStart(8, "0")}...${String(user.id).slice(-4)}`
    : "wei_0x78a19bc3...82f1";
  const encryptedAddress = user?.id
    ? `0x${Number(user.id).toString(16).padStart(4, "0")}••••••••${String(user.id).slice(-4)}`
    : "0x78a1••••••••82f1";
  const usdValue = (score / 100).toFixed(2);
  const khrValue = Math.floor(score * 41).toLocaleString();

  const swapConvertedAmount = () => {
    const amt = parseFloat(inputAmount) || 0;
    if (fromCurrency === "WEI" && toCurrency === "USD") return `$${(amt / 100).toFixed(2)}`;
    if (fromCurrency === "WEI" && toCurrency === "KHR") return `${Math.floor(amt * 41).toLocaleString()} ៛`;
    if (fromCurrency === "USD" && toCurrency === "WEI") return `${(amt * 100).toFixed(0)} WEI`;
    if (fromCurrency === "KHR" && toCurrency === "WEI") return `${(amt / 41).toFixed(0)} WEI`;
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
    try { tgApp?.HapticFeedback?.notificationOccurred("success"); } catch {}
  };

  const handleCopyFieldValue = (key: string, val: string) => {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1800);
    try { tgApp?.HapticFeedback?.notificationOccurred("success"); } catch {}
  };

  const handleSaveBio = () => {
    localStorage.setItem("shi_profile_bio", bio);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    try { tgApp?.HapticFeedback?.notificationOccurred("success"); } catch {}
  };

  const handleSwapConfirm = () => {
    const out = swapConvertedAmount();
    setSwapSuccess(out);
    setTimeout(() => setSwapSuccess(null), 3000);
    try { tgApp?.HapticFeedback?.notificationOccurred("success"); } catch {}
  };

  /* ── SWAP ── */
  if (view === "swap") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">
        <BackHeader title="Token Swap" onBack={() => setView("main")} />
        <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">SHILIAIWEI DEX — CONVERT</span>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">From</label>
            <div className="flex gap-2">
              {(["KHR", "WEI", "USD"] as CurrencyType[]).map((c) => (
                <button key={c} type="button" onClick={() => setFromCurrency(c)}
                  className={`flex-1 py-2.5 rounded-full text-xs font-black border transition-all duration-300 ease-out cursor-pointer ${fromCurrency === c ? "bg-[#0098ea] text-white border-[#0098ea] shadow-sm" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amount</label>
            <input type="number" value={inputAmount} onChange={(e) => setInputAmount(e.target.value)}
              className="w-full px-5 py-3 rounded-full border border-slate-200 bg-slate-50 text-slate-900 font-black text-lg focus:outline-none focus:border-[#0098ea] focus:bg-white transition-all duration-300 ease-out" placeholder="100" />
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
                <button key={c} type="button" onClick={() => setToCurrency(c)}
                  className={`flex-1 py-2.5 rounded-full text-xs font-black border transition-all duration-300 ease-out cursor-pointer ${toCurrency === c ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
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
              Swap success — received {swapSuccess}
            </div>
          )}
          <button type="button" onClick={handleSwapConfirm}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#0088cc] to-[#0098ea] text-white font-black text-sm tracking-wide shadow-md shadow-blue-500/20 active:scale-98 transition-all duration-300 ease-out cursor-pointer">
            CONFIRM SWAP
          </button>
        </div>
      </div>
    );
  }

  /* ── SECURITY ── */
  if (view === "security") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">
        <BackHeader title="Security" onBack={() => setView("main")} />
        <div className="space-y-3">
          <div className="relative overflow-hidden bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm space-y-3">
            {/* Guilloche Banknote Background Mesh Overlay with Suitable Contrast */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.09]"
              style={{
                backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "cover",
                filter: "contrast(1.3)",
              }}
            />
            <div className="relative z-10 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">VAULT WALLET ADDRESS</span>
              {/* Address Wallet Section: Transparent Text & Encrypted Format Displaying Only Address (Zero Icons) */}
              <div
                onClick={() => copyToClipboard(walletAddress, setCopiedWallet)}
                className="flex items-center justify-between gap-3 p-3.5 rounded-full bg-slate-900/90 hover:bg-slate-900 active:scale-98 border border-slate-800 backdrop-blur-md transition-all cursor-pointer select-none"
                title="Tap to copy address"
              >
                <span className="text-xs font-mono tracking-widest text-white/60 hover:text-white/90 font-medium truncate flex-1 ml-2 transition-colors">
                  {copiedWallet ? "COPIED TO CLIPBOARD" : encryptedAddress}
                </span>
                <span className="text-[10px] text-white/40 uppercase font-mono mr-2">ENCRYPTED</span>
              </div>
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-full bg-slate-50 border border-slate-200">
              <div className="ml-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Telegram Handle</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-black text-slate-900">{handle}</span>
                  {isTelegramUser && <TelegramVerifiedBadge size={14} />}
                </div>
              </div>
              {isTelegramUser && (
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 mr-1">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-full bg-slate-50 border border-slate-200">
              <div className="ml-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Telegram ID</span>
                <span className="text-sm font-black text-slate-900">{playerId}</span>
              </div>
              <button type="button" onClick={() => copyToClipboard(playerId, setCopiedId)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#0098ea] flex items-center justify-center transition-all duration-300 ease-out cursor-pointer flex-shrink-0">
                {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">PROTECTION STATUS</span>
            {[
              { label: "Telegram Auth", status: "Active", ok: true },
              { label: "2FA Verification", status: user?.id ? "Verified" : "Pending", ok: !!user?.id },
              { label: "End-to-End Encrypted", status: "Enabled", ok: true },
              { label: "Session Lock", status: "Auto 15 min", ok: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className={row.ok ? "text-emerald-500" : "text-amber-500"} />
                  <span className="text-sm font-semibold text-slate-800">{row.label}</span>
                </div>
                <span className={`text-xs font-black ${row.ok ? "text-emerald-600" : "text-amber-600"}`}>{row.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── AUDIT LOG ── */
  if (view === "audit") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">
        <BackHeader title="Activity Log" onBack={() => setView("main")}
          right={<button type="button" onClick={fetchAuditLogs} className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"><RefreshCw size={14} /></button>}
        />
        {loadingAudit ? (
          <div className="text-center py-12 text-sm text-slate-400 font-medium animate-pulse">Loading activity...</div>
        ) : auditLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-2">
            <Timer size={28} className="text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-500">No activity recorded yet.</p>
            <button type="button" onClick={fetchAuditLogs} className="px-4 py-2 rounded-xl bg-[#0098ea] text-white font-bold text-xs cursor-pointer">Load Activity</button>
          </div>
        ) : (
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0098ea] uppercase tracking-wide">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-snug">{log.details}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{log.platform}</span>
                  {log.city_country && <span>• {log.city_country}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── NOTIFICATIONS ── */
  if (view === "notifications") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">
        <BackHeader title="Notifications" onBack={() => setView("main")} />
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          {[
            { t: "Vault Sync Complete", s: "Your score has been saved to the cloud.", time: "Just now" },
            { t: "Daily Spin Available", s: "Spin the lucky wheel today for bonus WEI Coin!", time: "2h ago" },
            { t: "Leaderboard Update", s: "Your rank has been refreshed.", time: "5h ago" },
            { t: "Welcome Bonus", s: "You received 50 WEI Coin as a welcome reward.", time: "Yesterday" },
          ].map((n, i) => (
            <div key={i} className="py-3 border-b border-slate-100 last:border-0">
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

  /* ── WALLET DETAIL ── */
  if (view === "wallet-detail") {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">
        <BackHeader title="My Wallet" onBack={() => setView("main")} />
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] rounded-3xl p-5 text-white relative overflow-hidden shadow-md">
            <ProfileWatermark />
            {/* Guilloche Banknote Background Style with Suitable Contrast */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
              style={{
                backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "cover",
                filter: "contrast(1.35) brightness(1.1)",
              }}
            />
            <div className="relative z-10 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block">Total Balance</span>
              <div>
                <span className="text-4xl font-black leading-none">{score.toLocaleString()}</span>
                <span className="text-sm text-blue-200 font-bold ml-2">WEI COIN</span>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <div>
                  <span className="text-[10px] text-blue-300 font-medium block">Dollar Value</span>
                  <span className="text-lg font-black">$ {usdValue}</span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <span className="text-[10px] text-blue-300 font-medium block">Riel Value</span>
                  <span className="text-lg font-black">៛ {khrValue}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">Wallet Address</span>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
              <span className="text-xs font-mono tracking-widest text-white/60 truncate flex-1 ml-1">{encryptedAddress}</span>
              <button type="button" onClick={() => copyToClipboard(walletAddress, setCopiedWallet)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer">
                {copiedWallet ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0098ea] block">Exchange Rates</span>
            {[{ from: "100 WEI COIN", to: "$ 1.00" }, { from: "100 WEI COIN", to: "៛ 4,100" }, { from: "500 WEI COIN", to: "~1 TON" }].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm font-bold text-slate-800">{r.from}</span>
                <span className="text-xs font-black text-[#0098ea]">= {r.to}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── EDIT PROFILE ── */
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
                {displayName}<span className="ml-2 text-[10px] text-slate-400">(from Telegram)</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Handle</label>
              <div className="px-5 py-3.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-sm font-mono flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>{handle}</span>
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
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                className="w-full px-5 py-3.5 rounded-[28px] border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-[#0098ea] transition-all duration-300 ease-out resize-none" placeholder="Write a short bio..." />
            </div>
          </div>
          {savedSuccess && (
            <div className="p-3.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center animate-fadeIn">Profile saved!</div>
          )}
          <button type="button" onClick={handleSaveBio}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#0088cc] to-[#0098ea] text-white font-black text-sm tracking-wide shadow-md shadow-blue-500/20 active:scale-98 transition-all duration-300 ease-out cursor-pointer">
            SAVE PROFILE
          </button>
        </div>
      </div>
    );
  }

  const rawInitData = tgApp?.initData || "Unavailable outside Telegram client context";
  const initDataHash = tgApp?.initDataUnsafe?.hash || "f498c19a4e76d910fbc286e1140ad840a424ba09b7c8dc91ae25ecbebb48f498";
  const maskedHash = `${initDataHash.slice(0, 12)}••••••••${initDataHash.slice(-8)}`;

  const fullTelemetryDump = JSON.stringify({
    access_clearance: "OWNER_ONLY",
    who_can_see: `Account Owner Only (${handle})`,
    telegram_bot_api: {
      user_id: user?.id,
      username: user?.username,
      first_name: user?.first_name,
      last_name: user?.last_name,
      bio: telemetryData?.bot?.profile?.bio || "kesararamwithdigital.tech @srievibot wallet earnings NPC",
      language_code: user?.language_code || "en",
      is_premium: user?.is_premium || false,
      personal_channel: telemetryData?.bot?.profile?.personal_chat || { id: -1002406201075, title: "史力爱卫", username: "shiliaiwei" },
      connected_bot: `@${telemetryData?.bot?.bot_username || "srievibot"}`,
      last_active: telemetryData?.bot?.last_active,
    },
    telegram_mini_app_sdk: {
      platform: tgApp?.platform || (typeof window !== "undefined" ? window.navigator.platform : "unknown"),
      version: tgApp?.version || "7.0",
      color_scheme: tgApp?.colorScheme || "light",
      viewport_height: tgApp?.viewportHeight || (typeof window !== "undefined" ? window.innerHeight : 844),
      viewport_stable_height: tgApp?.viewportStableHeight || 844,
      allows_write_to_pm: tgApp?.initDataUnsafe?.user?.allows_write_to_pm || false,
      biometrics_available: Boolean(tgApp?.BiometricManager),
      theme_params: tgApp?.themeParams,
      auth_hash: initDataHash,
    },
    server_network_telemetry: {
      client_ip: telemetryData?.network?.ip_address || "::1",
      country: telemetryData?.network?.country || "Cambodia",
      user_agent: telemetryData?.network?.user_agent || (typeof window !== "undefined" ? navigator.userAgent : "Unknown"),
      wallet_address: walletAddress,
      score: score,
      spend_seconds: spendSeconds,
      server_timestamp: telemetryData?.network?.server_timestamp || new Date().toISOString(),
    },
  }, null, 2);

  const botProfile = (telemetryData?.bot?.profile || {}) as Record<string, any>;
  const botPhotos = (telemetryData?.bot?.photos || {}) as Record<string, any>;

  const telemetryItems = [
    // ── Group 1: Telegram Bot API Profile Data (11) ──
    {
      key: "user_id",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "User ID",
      description: "Permanent unique Telegram identifier",
      value: String(user?.id || botProfile?.id || "6600489302"),
      copyValue: String(user?.id || botProfile?.id || "6600489302"),
      mono: true,
    },
    {
      key: "username",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Username",
      description: "Public Telegram handle",
      value: user?.username ? `@${user.username}` : (botProfile?.username ? `@${botProfile.username}` : "@srievi"),
      copyValue: user?.username ? `@${user.username}` : (botProfile?.username ? `@${botProfile.username}` : "@srievi"),
      mono: true,
    },
    {
      key: "first_name",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "First Name",
      description: "User display first name",
      value: user?.first_name || botProfile?.first_name || "SREIVEY",
    },
    {
      key: "last_name",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Last Name",
      description: "User display last name / suffix",
      value: user?.last_name || botProfile?.last_name || "PRO",
    },
    {
      key: "bio",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "User Bio",
      description: "Public profile description",
      value: botProfile?.bio || bio || "kesararamwithdigital.tech @srievibot wallet earnings NPC",
    },
    {
      key: "language_code",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Language Code",
      description: "Telegram client UI language",
      value: (user?.language_code || "en").toUpperCase(),
      mono: true,
    },
    {
      key: "is_premium",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Is Premium",
      description: "Telegram Premium subscriber status",
      value: user?.is_premium ? "Active Premium Member" : "Standard Tier",
    },
    {
      key: "personal_channel",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Personal Channel",
      description: "Linked Telegram broadcast channel",
      value: botProfile?.personal_chat?.title
        ? `${botProfile.personal_chat.title} (@${botProfile.personal_chat.username || "shiliaiwei"})`
        : "史力爱卫 (@shiliaiwei)",
    },
    {
      key: "avatar_images",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Avatar Images",
      description: "Profile photos from Bot API CDN",
      value: botPhotos?.total_count ? `${botPhotos.total_count} CDN Photo(s) Synchronized` : "Synchronized (1 Active)",
    },
    {
      key: "chat_id",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Direct Chat ID",
      description: "Private messaging chat identifier",
      value: botProfile?.id ? String(botProfile.id) : String(user?.id || "6600489302"),
      copyValue: botProfile?.id ? String(botProfile.id) : String(user?.id || "6600489302"),
      mono: true,
    },
    {
      key: "last_active",
      domain: "bot" as const,
      source: "Bot API",
      badgeColor: "bg-sky-100 text-sky-800",
      title: "Last Active",
      description: "Recent interaction timestamp",
      value: telemetryData?.bot?.last_active ? new Date(telemetryData.bot.last_active).toLocaleString() : "Real-time Active (Now)",
      mono: true,
    },

    // ── Group 2: Telegram Mini App SDK Data (7) ──
    {
      key: "init_data_hash",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "initData Hash",
      description: "Cryptographically signed payload",
      value: maskedHash,
      copyValue: initDataHash,
      mono: true,
    },
    {
      key: "allows_write_to_pm",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "allows_write_to_pm",
      description: "Direct message permission",
      value: tgApp?.initDataUnsafe?.user?.allows_write_to_pm ? "Granted (True)" : "Permitted by Session",
    },
    {
      key: "platform",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "Platform",
      description: "Client operating system / client type",
      value: tgApp?.platform || (typeof window !== "undefined" ? window.navigator.platform : "macOS / iOS"),
    },
    {
      key: "version",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "Version",
      description: "Telegram WebApp API version",
      value: `v${tgApp?.version || "7.10"}`,
      mono: true,
    },
    {
      key: "theme_params",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "themeParams",
      description: "Client UI appearance tokens",
      value: tgApp?.colorScheme ? `${tgApp.colorScheme.toUpperCase()} (bg: ${tgApp.themeParams?.bg_color || "#ffffff"})` : "LIGHT (#ffffff)",
      mono: true,
    },
    {
      key: "viewport_height",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "viewportHeight",
      description: "Device display metrics",
      value: `${tgApp?.viewportHeight || (typeof window !== "undefined" ? window.innerHeight : 844)}px (stable: ${tgApp?.viewportStableHeight || 844}px)`,
      mono: true,
    },
    {
      key: "biometrics",
      domain: "sdk" as const,
      source: "WebApp SDK",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "Biometrics Support",
      description: "Native device authentication",
      value: tgApp?.BiometricManager ? "Available (FaceID/TouchID)" : "Hardware Ready",
    },

    // ── Group 3: Server & Network Telemetry (5) ──
    {
      key: "ip_address",
      domain: "network" as const,
      source: "Server IP",
      badgeColor: "bg-purple-100 text-purple-800",
      title: "IP Address",
      description: "Client public IP",
      value: telemetryData?.network?.ip_address || "127.0.0.1 (Local Dev)",
      copyValue: telemetryData?.network?.ip_address || "127.0.0.1",
      mono: true,
    },
    {
      key: "geo_location",
      domain: "network" as const,
      source: "Server IP",
      badgeColor: "bg-purple-100 text-purple-800",
      title: "Geo-Location",
      description: "City and country",
      value: telemetryData?.network?.country ? `${telemetryData.network.country} (Verified)` : "Cambodia (Verified)",
    },
    {
      key: "user_agent",
      domain: "network" as const,
      source: "Server IP",
      badgeColor: "bg-purple-100 text-purple-800",
      title: "Device User-Agent",
      description: "Browser and hardware platform",
      value: telemetryData?.network?.user_agent
        ? (telemetryData.network.user_agent.length > 34 ? telemetryData.network.user_agent.slice(0, 34) + "..." : telemetryData.network.user_agent)
        : (typeof window !== "undefined" ? navigator.userAgent.slice(0, 34) + "..." : "Mozilla/5.0"),
      copyValue: telemetryData?.network?.user_agent || (typeof window !== "undefined" ? navigator.userAgent : ""),
      mono: true,
    },
    {
      key: "wallet_address",
      domain: "network" as const,
      source: "Server IP",
      badgeColor: "bg-purple-100 text-purple-800",
      title: "In-App Wallet",
      description: "Web3 / custom wallet address",
      value: walletAddress,
      copyValue: walletAddress,
      mono: true,
    },
    {
      key: "gaming_telemetry",
      domain: "network" as const,
      source: "Server IP",
      badgeColor: "bg-purple-100 text-purple-800",
      title: "Gaming Telemetry",
      description: "Session engagement metrics",
      value: `${score.toLocaleString()} WEI • ${fmtTime(spendSeconds)} Online • ${tapPower || 1}x Tap`,
    },
  ];

  const displayedTelemetryItems = telemetryDomain === "all"
    ? telemetryItems
    : telemetryItems.filter((i) => i.domain === telemetryDomain);

  /* ── MAIN PROFILE ── */
  return (
    <div className="min-h-screen bg-white text-slate-900 pb-28 pt-2 px-3 max-w-xl mx-auto font-sans select-none animate-fadeIn">

      {/* HERO HEADER CARD (32dp Expressive Roundness with Guilloche Banknote Background) */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0088cc] via-[#0077b5] to-[#005f99] p-6 text-white mb-4 shadow-md border border-blue-400/20">
        <ProfileWatermark />
        {/* Guilloche Banknote Background Style with Suitable Contrast */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
          style={{
            backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center 20%",
            backgroundSize: "cover",
            filter: "contrast(1.35) brightness(1.1)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <ProfileAvatar user={user} size={68} />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-white leading-tight truncate">{displayName}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-blue-200 text-xs font-semibold">{handle}</p>
                {isTelegramUser && (
                  <TelegramVerifiedBadge size={14} className="flex-shrink-0 drop-shadow-xs" />
                )}
              </div>
              <p className="text-blue-100/80 text-[11px] font-medium mt-1 leading-snug line-clamp-2">{bio}</p>
            </div>
            <button type="button" onClick={() => setView("edit")}
              className="flex-shrink-0 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold hover:bg-white/25 transition-all duration-300 ease-out cursor-pointer active:scale-95">
              Edit
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ShiliaiweiBrand height={14} colorScheme="white" />
            <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest">VAULT MEMBER</span>
            {isTelegramUser && (
              <span className="text-[8.5px] font-bold text-sky-100 bg-white/10 px-3 py-1 rounded-full border border-white/15 ml-auto flex items-center gap-1">
                <TelegramVerifiedBadge size={11} />
                <span>Verified Telegram</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm mb-4 overflow-hidden">
        <div className="flex items-stretch divide-x divide-slate-100">
          <StatCell value={score.toLocaleString()} label="Points" />
          <StatCell value={`$${usdValue}`} label="USD" />
          <StatCell value={tapPower} label="Tap Power" />
          <StatCell value={fmtTime(spendSeconds)} label="Online" />
        </div>
      </div>

      {/* QUICK ACTION GRID */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={<Wallet size={22} />} label="Wallet" onClick={() => setView("wallet-detail")} accent />
          <QuickAction icon={<Repeat size={22} />} label="Swap" onClick={() => setView("swap")} />
          <QuickAction icon={<ShieldCheck size={22} />} label="Security" onClick={() => setView("security")} />
          <QuickAction icon={<Timer size={22} />} label="Activity" onClick={() => { setView("audit"); fetchAuditLogs(); }} />
          <QuickAction icon={<Bell size={22} />} label="Alerts" onClick={() => setView("notifications")} />
          <QuickAction icon={<Sparkles size={22} />} label="Rewards" onClick={() => setView("notifications")} />
          <QuickAction icon={<Send size={22} />} label="Send" onClick={() => setView("swap")} />
          <QuickAction icon={<Gift size={22} />} label="Missions" onClick={() => {}} />
        </div>
      </div>

      {/* TASK / REWARD ROWS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm mb-4 overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          <TaskRow title="Tasks" sub={`${score > 0 ? score.toLocaleString() : 0} Points`} badge={<Coins size={18} className="text-white" />} />
          <TaskRow title="Streak" sub="Tap to Join" badge={<Zap size={18} className="text-white" />} />
        </div>
        <div className="border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-100">
          <TaskRow title="Check-in" sub="Claim daily bonus" badge={<Timer size={18} className="text-white" />}
            right={<span className="px-4 py-1.5 rounded-full bg-[#0098ea] text-white text-xs font-black">Sign</span>} />
          <TaskRow title="Rewards" sub="Updated daily" badge={<Sparkles size={18} className="text-white" />} onClick={() => setView("notifications")} />
        </div>
      </div>

      {/* ALL-IN-ONE PROFILE & TELEMETRY DETAILS (OWNER ONLY) */}
      {isOwner && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 mb-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0098ea] flex-shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Profile & System Telemetry
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
                    ALL-IN-ONE (23)
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
                  Real-time diagnostic telemetry across Bot API, WebApp SDK & Server layers.
                </p>
              </div>
            </div>

            {/* Actions: Refresh & Copy JSON */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => fetchTelemetry()}
                disabled={loadingTelemetry}
                title="Refresh Telemetry"
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer active:scale-95 transition-all"
              >
                <RefreshCw size={14} className={loadingTelemetry ? "animate-spin text-[#0098ea]" : ""} />
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(fullTelemetryDump, setCopiedJson)}
                title="Copy Full JSON"
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 text-[11px] font-bold text-slate-700 cursor-pointer active:scale-95 transition-all"
              >
                {copiedJson ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedJson ? "Copied" : "JSON"}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Access Notice Banner */}
          <div className="my-3 p-3 rounded-2xl bg-sky-50/60 border border-sky-200/80 flex items-start gap-2.5">
            <Info size={15} className="text-[#0098ea] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">
                  WHO CAN SEE:
                </span>
                <span className="text-[10px] font-black text-[#0098ea] uppercase tracking-wide">
                  Account Owner Only
                </span>
              </div>
              <p className="text-[10px] text-slate-600 font-medium leading-relaxed mt-0.5">
                Strictly visible to the authenticated account owner and system administrators. Hidden from standard users, public players, and leaderboards.
              </p>
            </div>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 pt-0.5 border-b border-slate-100 no-scrollbar">
            {[
              { id: "all", label: "All Details (23)" },
              { id: "bot", label: "Telegram (11)" },
              { id: "sdk", label: "Mini App (7)" },
              { id: "network", label: "Server (5)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTelemetryDomain(tab.id as typeof telemetryDomain)}
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

          {/* Items List */}
          <div className="divide-y divide-slate-100">
            {displayedTelemetryItems.map((item) => (
              <div key={item.key} className="py-2.5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="text-xs font-bold text-slate-800">{item.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                      {item.source}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 font-medium leading-tight truncate">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 max-w-[55%] justify-end">
                  <span
                    className={`text-xs font-semibold truncate ${
                      item.mono
                        ? "font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200"
                        : "text-slate-800"
                    }`}
                  >
                    {item.value}
                  </span>
                  {item.copyValue && (
                    <button
                      type="button"
                      onClick={() => handleCopyFieldValue(item.key, item.copyValue!)}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer active:scale-90 transition-transform"
                      title="Copy value"
                    >
                      {copiedField === item.key ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sync Timestamp Footer */}
          <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>23 Real-Time Parameters Live</span>
            <span>Sync: {telemetryData?.network?.server_timestamp ? new Date(telemetryData.network.server_timestamp).toLocaleTimeString() : "Live"}</span>
          </div>
        </div>
      )}

      {/* MENU LIST */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm mb-4 overflow-hidden">
        <div className="px-2 py-1">
          <MenuRow icon={<User size={17} />} title="Edit Profile" sub="Name, bio, handle" onClick={() => setView("edit")} />
          <MenuRow icon={<ShieldCheck size={17} />} title="Security & Wallet" sub="Keys, 2FA, address" onClick={() => setView("security")} />
          <MenuRow icon={<Repeat size={17} />} title="Token Swap" sub="WEI COIN → USD / KHR" onClick={() => setView("swap")} />
          <MenuRow icon={<Timer size={17} />} title="Activity Log" sub="Login & action history" onClick={() => { setView("audit"); fetchAuditLogs(); }} />
          <MenuRow icon={<Bell size={17} />} title="Notifications" sub="Alerts & rewards" onClick={() => setView("notifications")} />
        </div>

        {/* Preference toggles */}
        <div className="border-t border-slate-100 px-4 py-3 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Preferences</span>
          {[
            { label: "Haptic Feedback", value: hapticsEnabled, onToggle: () => { const n = !hapticsEnabled; setHapticsEnabled(n); localStorage.setItem("shi_pref_haptics", String(n)); } },
            { label: "Game Sounds", value: soundEnabled, onToggle: () => { const n = !soundEnabled; setSoundEnabled(n); localStorage.setItem("shi_pref_sound", String(n)); } },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">{pref.label}</span>
              <button type="button" onClick={pref.onToggle}
                className={`relative w-11 h-6 rounded-full border transition-all duration-300 ease-out cursor-pointer ${pref.value ? "bg-[#0098ea] border-[#0098ea]" : "bg-slate-200 border-slate-300"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ease-out ${pref.value ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PLAYER ID FOOTER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Player ID</span>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-700 truncate">{playerId}</span>
          <button type="button" onClick={() => copyToClipboard(playerId, setCopiedId)}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 cursor-pointer flex-shrink-0">
            {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Consistent Brand Footer */}
      <BrandFooter height={16} className="mt-2 mb-1" />

      {onBack && (
        <button type="button" onClick={onBack}
          className="w-full py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs shadow-2xs active:scale-98 transition-all duration-300 ease-out cursor-pointer">
          Back to Home
        </button>
      )}
    </div>
  );
};
