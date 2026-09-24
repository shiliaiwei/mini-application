"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { LevelCircleProfile } from "@/components/common/LevelCircleProfile";
import { TelegramVerifiedBadge } from "@/components/common/TelegramVerifiedBadge";
import {
  ChevronLeft,
  Copy,
  Check,
  ChevronDown,
  Send,
  ShieldCheck,
  Timer,
  RefreshCw,
  Zap,
  Repeat,
  Wallet,
  Coins,
  Sparkles,
  ArrowUpRight,
  Eye,
  EyeOff,
  User,
} from "@/components/icons/KeylineIcons";

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
export type CurrencyType = "PTS" | "USD" | "KHR";

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

export const GameProfileView: React.FC<GameProfileViewProps> = ({
  user,
  tgApp,
  score,
  spendSeconds,
  initialSubTab = "profile",
  onSetScore,
  onBack,
}) => {
  const [subTab, setSubTab] = useState<ProfileSubTab>(initialSubTab);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Form State (Editable Profile Config)
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [usernameInput, setUsernameInput] = useState(user?.username || "");
  const [bio, setBio] = useState("SHILIAIWEI Web3 Vault Member");
  const [dob, setDob] = useState("2000-01-01");
  const [gender, setGender] = useState("Male");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Telegram Settings & Config State (Preferences)
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hideBalancesDefault, setHideBalancesDefault] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Embedded DEX Swap State
  const [fromCurrency, setFromCurrency] = useState<CurrencyType>("PTS");
  const [toCurrency, setToCurrency] = useState<CurrencyType>("USD");
  const [inputAmount, setInputAmount] = useState<string>("100");
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const telegramUsername = user?.username ? `@${user.username}` : user?.first_name || "shiliaiwei";
  const playerId = user?.id ? String(user.id) : "a50caa57";
  const walletAddress = user?.id
    ? `shi_0x${Number(user.id).toString(16).padStart(8, "0")}...${String(user.id).slice(-4)}`
    : "shi_0x78a19bc3...82f1";

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHaptics = localStorage.getItem("shi_pref_haptics");
      if (savedHaptics !== null) setHapticsEnabled(savedHaptics === "true");

      const savedSound = localStorage.getItem("shi_pref_sound");
      if (savedSound !== null) setSoundEnabled(savedSound === "true");

      const savedHide = localStorage.getItem("shi_pref_hide_balances");
      if (savedHide !== null) setHideBalancesDefault(savedHide === "true");

      const savedSync = localStorage.getItem("shi_pref_cloud_sync");
      if (savedSync !== null) setCloudSyncEnabled(savedSync === "true");

      const savedBio = localStorage.getItem("shi_profile_bio");
      if (savedBio) setBio(savedBio);

      const savedFirst = localStorage.getItem("shi_profile_first_name");
      if (savedFirst) setFirstName(savedFirst);

      const savedLast = localStorage.getItem("shi_profile_last_name");
      if (savedLast) setLastName(savedLast);
    }
  }, []);

  // Real client platform data from Telegram WebApp SDK
  const realPlatform = tgApp?.platform
    ? tgApp.platform.toUpperCase()
    : typeof navigator !== "undefined"
    ? (navigator.platform || "CLIENT").toUpperCase()
    : "TELEGRAM";

  const realLanguage = (
    user?.language_code ||
    (typeof navigator !== "undefined" ? navigator.language : "en")
  ).toUpperCase();

  const formatSessionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s active`;
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(playerId);
    setCopiedId(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedWallet(true);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleSaveProfile = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("shi_profile_first_name", firstName);
      localStorage.setItem("shi_profile_last_name", lastName);
      localStorage.setItem("shi_profile_bio", bio);
    }
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    if (typeof window !== "undefined") localStorage.setItem("shi_pref_haptics", String(next));
    if (next) {
      try {
        tgApp?.HapticFeedback?.impactOccurred("medium");
      } catch {}
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== "undefined") localStorage.setItem("shi_pref_sound", String(next));
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
  };

  const handleToggleHideBalances = () => {
    const next = !hideBalancesDefault;
    setHideBalancesDefault(next);
    if (typeof window !== "undefined") localStorage.setItem("shi_pref_hide_balances", String(next));
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
  };

  const handleToggleCloudSync = () => {
    const next = !cloudSyncEnabled;
    setCloudSyncEnabled(next);
    if (typeof window !== "undefined") localStorage.setItem("shi_pref_cloud_sync", String(next));
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
  };

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  // Embedded DEX Swap Calculations (100 PTS = $1.00 USD = 4,100 KHR)
  const getOutputAmount = (amount: number, from: CurrencyType, to: CurrencyType): number => {
    if (from === to) return amount;
    let pts = 0;
    if (from === "PTS") pts = amount;
    else if (from === "USD") pts = amount * 100;
    else if (from === "KHR") pts = amount / 41;

    if (to === "PTS") return pts;
    if (to === "USD") return pts / 100;
    if (to === "KHR") return pts * 41;
    return 0;
  };

  const getAvailableBalance = (curr: CurrencyType): number => {
    if (curr === "PTS") return score;
    if (curr === "USD") return score / 100;
    if (curr === "KHR") return Math.floor(score * 41);
    return 0;
  };

  const currentAvailable = getAvailableBalance(fromCurrency);
  const parsedInput = parseFloat(inputAmount) || 0;
  const calculatedOutput = getOutputAmount(parsedInput, fromCurrency, toCurrency);

  const handleFlipSwap = () => {
    try {
      tgApp?.HapticFeedback?.selectionChanged();
    } catch {}
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleQuickPercent = (pct: number) => {
    const calculated = (currentAvailable * pct) / 100;
    setInputAmount(
      calculated > 0
        ? fromCurrency === "KHR" || fromCurrency === "PTS"
          ? Math.floor(calculated).toString()
          : calculated.toFixed(2)
        : "0"
    );
  };

  const handleExecuteSwap = async () => {
    if (parsedInput <= 0 || parsedInput > currentAvailable) return;

    let pointsSpent = 0;
    if (fromCurrency === "PTS") pointsSpent = parsedInput;
    else if (fromCurrency === "USD") pointsSpent = parsedInput * 100;
    else if (fromCurrency === "KHR") pointsSpent = parsedInput / 41;

    let pointsGained = 0;
    if (toCurrency === "PTS") pointsGained = calculatedOutput;
    else if (toCurrency === "USD") pointsGained = calculatedOutput * 100;
    else if (toCurrency === "KHR") pointsGained = calculatedOutput / 41;

    const newScore = Math.max(0, Math.round(score - pointsSpent + pointsGained));
    onSetScore?.(newScore);

    const outputText =
      toCurrency === "KHR"
        ? `${Math.floor(calculatedOutput).toLocaleString()} KHR`
        : toCurrency === "USD"
        ? `$${calculatedOutput.toFixed(2)} USD`
        : `${Math.round(calculatedOutput).toLocaleString()} PTS`;

    setSwapSuccess(`Exchanged to ${outputText}!`);
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}

    // Record swap in Neon DB audit log
    if (user?.id) {
      try {
        await fetch("/api/audit/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: user.id,
            action: "CURRENCY_SWAP",
            details: `Swapped ${inputAmount} ${fromCurrency} -> ${outputText}`,
            platform: tgApp?.platform || "SETTINGS_DEX",
          }),
        });
      } catch {}
    }

    setTimeout(() => {
      setSwapSuccess(null);
      setInputAmount("100");
    }, 3000);
  };

  // Fetch Login Audit from Neon Database
  const fetchAuditLogs = useCallback(async () => {
    if (!user?.id) {
      setAuditLogs([
        {
          id: 1,
          telegram_id: "preview_user",
          action: "LOGIN",
          ip_address: "127.0.0.1",
          platform: realPlatform,
          city_country: "Phnom Penh, Cambodia",
          details: "Authenticated via Telegram WebApp Client Session",
          created_at: new Date().toISOString(),
        },
      ]);
      return;
    }

    setLoadingAudit(true);
    try {
      const res = await fetch(`/api/audit/list?telegram_id=${user.id}`);
      const data = await res.json();
      if (data && data.logs) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoadingAudit(false);
    }
  }, [user?.id, realPlatform]);

  useEffect(() => {
    if (subTab === "audit") {
      fetchAuditLogs();
    }
  }, [subTab, fetchAuditLogs]);

  return (
    <div className="space-y-3.5 pb-28 select-none font-body text-slate-900 max-w-xl mx-auto w-full px-1">
      {/* Top Header with Back Arrow */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to main vault"
          className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors shadow-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 font-sans leading-tight">
            Telegram Settings & Profile
          </h1>
          <span className="text-[11px] text-slate-500 font-medium block">
            Account Preferences, Currency Swap & Security
          </span>
        </div>
      </div>

      {/* Telegram User Summary Card */}
      <div className="liquid-glass p-3.5 flex items-center justify-between gap-3 border border-slate-200 shadow-xs">
        <LevelCircleProfile score={score} user={user} size="md" showDetails={true} />

        <button
          type="button"
          onClick={handleCopyId}
          aria-label="Copy Player ID"
          className="flex flex-col items-end text-right flex-shrink-0 cursor-pointer min-h-[44px] justify-center p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea]"
        >
          <span className="text-[10px] text-slate-600 font-bold uppercase block">
            ID {playerId.slice(0, 8)}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#0077b5] hover:text-[#0088cc] mt-0.5 transition-colors font-bold">
            {copiedId ? (
              <>
                <Check size={16} className="text-[#14532d]" />
                <span className="text-[#14532d]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy ID</span>
              </>
            )}
          </span>
        </button>
      </div>

      {/* Sub-Tab Navigation Bar (Telegram-Style 4 Categories) */}
      <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
        <button
          type="button"
          onClick={() => setSubTab("profile")}
          className={`py-2 rounded-lg transition-all text-center min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] flex items-center justify-center gap-1 ${
            subTab === "profile"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <User size={15} />
          <span>Config</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("swap")}
          className={`py-2 rounded-lg transition-all text-center min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] flex items-center justify-center gap-1 ${
            subTab === "swap"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Repeat size={15} className="text-emerald-600" />
          <span>Swap</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("security")}
          className={`py-2 rounded-lg transition-all text-center min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] flex items-center justify-center gap-1 ${
            subTab === "security"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck size={15} className="text-blue-600" />
          <span>Security</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("audit")}
          className={`py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1 min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] ${
            subTab === "audit"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Timer size={15} className="text-[#0098ea]" />
          <span>Audit</span>
        </button>
      </div>

      {/* 1. TELEGRAM SETTINGS & PROFILE CONFIG */}
      {subTab === "profile" && (
        <div className="space-y-3.5">
          {/* Section 1: Telegram Identity & Editable Profile Fields */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Telegram Account & Profile
            </h2>
            <div className="liquid-glass p-3.5 space-y-3 border border-slate-200 shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="wingram-input w-full px-3 py-2 text-xs min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="wingram-input w-full px-3 py-2 text-xs min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="username"
                    className="wingram-input w-full pl-7 pr-3 py-2 text-xs min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Bio / Status</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short bio or status"
                  className="wingram-input w-full px-3 py-2 text-xs min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="wingram-input w-full px-3 py-2 text-xs min-h-[44px]"
                  />
                </div>
                <div className="relative">
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">Gender</label>
                  <div className="relative">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="wingram-input w-full px-3 py-2 text-xs appearance-none pr-8 cursor-pointer min-h-[44px]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown size={16} className="text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full py-3 rounded-xl bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer min-h-[44px]"
              >
                {savedSuccess ? "Saved Successfully!" : "Save Profile Details"}
              </button>
            </div>
          </div>

          {/* Section 2: Telegram App Preferences (Haptics, Sounds, Balances, Cloud Sync) */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Telegram Mini-App Preferences
            </h2>
            <div className="liquid-glass p-3.5 space-y-3 border border-slate-200 shadow-xs divide-y divide-slate-100">
              {/* Toggle 1: Haptic Feedback */}
              <div className="flex items-center justify-between pt-1 first:pt-0">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Haptic Feedback</span>
                  <span className="text-[10px] text-slate-500">Vibration pulses on tap and action</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleHaptics}
                  className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                    hapticsEnabled ? "bg-[#0098ea]" : "bg-slate-300"
                  }`}
                  aria-label="Toggle haptic feedback"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      hapticsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Sound Effects */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Sound Effects</span>
                  <span className="text-[10px] text-slate-500">Audio feedback on minting & rewards</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                    soundEnabled ? "bg-[#0098ea]" : "bg-slate-300"
                  }`}
                  aria-label="Toggle sound effects"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      soundEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Hide Balances by Default */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Hide Balances</span>
                  <span className="text-[10px] text-slate-500">Obscure monetary figures by default</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleHideBalances}
                  className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                    hideBalancesDefault ? "bg-[#0098ea]" : "bg-slate-300"
                  }`}
                  aria-label="Toggle hide balances"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      hideBalancesDefault ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 4: Neon Cloud Auto-Sync */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Cloud Auto-Sync</span>
                  <span className="text-[10px] text-slate-500">Live PostgreSQL database persistence</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleCloudSync}
                  className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                    cloudSyncEnabled ? "bg-[#0098ea]" : "bg-slate-300"
                  }`}
                  aria-label="Toggle cloud sync"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      cloudSyncEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Data & Storage Settings */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Data & Storage
            </h2>
            <div className="liquid-glass p-3.5 space-y-2 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">App Local Cache</span>
                <span className="text-[10px] text-slate-500">Cached media & temporary session assets</span>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                {cacheCleared ? "Cache Cleared!" : "Clear Cache"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEX SWAP & CURRENCY EXCHANGE (Moved into Settings as requested) */}
      {subTab === "swap" && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-1.5 uppercase">
              <Repeat size={18} className="text-emerald-600" />
              <span>Instant DEX & Currency Swap</span>
            </h2>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              0% Fee
            </span>
          </div>

          {/* Swap Box */}
          <div className="liquid-glass p-4 space-y-3 border border-slate-200 shadow-xs">
            {/* From Card */}
            <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                <span>You Pay:</span>
                <span>
                  Available: {getAvailableBalance(fromCurrency).toLocaleString()}{" "}
                  {fromCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-xl font-black text-slate-900 w-full focus:outline-none"
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as CurrencyType)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 cursor-pointer shadow-2xs"
                >
                  <option value="PTS">PTS</option>
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛)</option>
                </select>
              </div>

              {/* Quick Percent Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className="flex-1 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-[10px] font-bold text-slate-700 transition-colors"
                  >
                    {pct === 100 ? "MAX" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Flip Button */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleFlipSwap}
                aria-label="Invert currencies"
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs active:rotate-180 transition-all cursor-pointer"
              >
                <Repeat size={16} />
              </button>
            </div>

            {/* To Card */}
            <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                <span>You Receive (Estimated):</span>
                <span>
                  Current: {getAvailableBalance(toCurrency).toLocaleString()}{" "}
                  {toCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl font-black text-emerald-600 truncate">
                  {toCurrency === "KHR"
                    ? Math.floor(calculatedOutput).toLocaleString()
                    : toCurrency === "USD"
                    ? calculatedOutput.toFixed(2)
                    : Math.round(calculatedOutput).toLocaleString()}
                </span>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as CurrencyType)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 cursor-pointer shadow-2xs"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛)</option>
                  <option value="PTS">PTS</option>
                </select>
              </div>
            </div>

            {/* Exchange Rate pill */}
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-center justify-between font-medium">
              <span>Official Peg Rate:</span>
              <span className="font-bold">100 PTS = $1.00 USD = 4,100 KHR</span>
            </div>

            {/* Success Banner */}
            {swapSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-bold text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                <Check size={16} className="text-emerald-700" />
                <span>{swapSuccess}</span>
              </div>
            )}

            {/* Swap Button */}
            <button
              type="button"
              disabled={parsedInput <= 0 || parsedInput > currentAvailable}
              onClick={handleExecuteSwap}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 min-h-[44px] ${
                parsedInput <= 0 || parsedInput > currentAvailable
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 cursor-pointer"
              }`}
            >
              <Repeat size={16} />
              <span>
                {parsedInput > currentAvailable ? "Insufficient Balance" : "Confirm & Execute Swap"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 3. SECURITY TAB CONTENT */}
      {subTab === "security" && (
        <div className="space-y-3.5">
          {/* TON Connected Wallet Card */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Web3 Vault & TON Address
            </h2>
            <div className="liquid-glass p-3.5 space-y-3 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wallet size={20} className="text-[#0098ea] flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-600 block">SHILIAIWEI Web3 Vault</span>
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      {walletAddress}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyWallet}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedWallet ? (
                    <>
                      <Check size={14} className="text-[#14532d]" />
                      <span className="text-[#14532d]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security Status Card */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">Account Security</h2>
            <div className="liquid-glass p-3.5 space-y-2 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-[#14532d] flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-600 block">Authentication Protocol</span>
                    <span className="text-xs font-bold text-slate-900 block">
                      Telegram Cryptographic Signature Verification
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#14532d] bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Real Device Sessions Card */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">Active Device Session</h2>
            <div className="liquid-glass p-3.5 space-y-3 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Zap size={20} className="text-[#0098ea] flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Telegram {realPlatform}
                    </span>
                    <span className="text-[10px] text-slate-600 block">
                      Language: {realLanguage} • Session: {formatSessionTime(spendSeconds)}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#14532d] bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. LOGIN & ACTIVITY AUDIT TAB CONTENT */}
      {subTab === "audit" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-1.5 uppercase">
              <Timer size={18} className="text-[#0098ea]" />
              <span>Database Login & Session Audit Trail</span>
            </h2>
            <button
              type="button"
              onClick={fetchAuditLogs}
              disabled={loadingAudit}
              aria-label="Refresh audit logs"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer border border-slate-200 bg-white"
            >
              <RefreshCw size={14} className={loadingAudit ? "animate-spin text-[#0098ea]" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="liquid-glass p-3 space-y-2 border border-slate-200 shadow-xs">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {loadingAudit ? "Loading audit logs from database..." : "No recent activity recorded."}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => {
                  const dateStr = log.created_at
                    ? new Date(log.created_at).toLocaleString()
                    : "Recent";

                  return (
                    <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#0077b5] border border-sky-200">
                            {log.action}
                          </span>
                          <span className="font-mono text-[11px] text-slate-800 font-semibold">
                            {log.ip_address || "127.0.0.1"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">{dateStr}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="truncate max-w-[260px]">
                          {log.details || `Platform: ${log.platform}`}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                          {log.city_country || "Cambodia"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
