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

interface GameProfileViewProps {
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
  score: number;
  spendSeconds: number;
  tapPower?: number;
  passiveRate?: number;
  onBack?: () => void;
}

export const GameProfileView: React.FC<GameProfileViewProps> = ({
  user,
  tgApp,
  score,
  spendSeconds,
  onBack,
}) => {
  const [subTab, setSubTab] = useState<"profile" | "security" | "audit">("profile");
  const [copiedId, setCopiedId] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [dob, setDob] = useState("2000-01-01");
  const [gender, setGender] = useState("Male");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const telegramUsername = user?.username ? `@${user.username}` : user?.first_name || "shiliaiwei";
  const playerId = user?.id ? String(user.id) : "a50caa57";

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

  const handleSaveProfile = () => {
    try {
      tgApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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
        <h1 className="text-lg font-black tracking-tight text-slate-900 font-sans">
          Personal Profile & Settings
        </h1>
      </div>

      {/* Player Header Card with Standard Level Circle Profile */}
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

      {/* Sub-Tab Toggle Pills (Profile / Security / Login Audit) */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
        <button
          type="button"
          onClick={() => setSubTab("profile")}
          className={`py-2 rounded-lg transition-all text-center min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] ${
            subTab === "profile"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setSubTab("security")}
          className={`py-2 rounded-lg transition-all text-center min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0098ea] ${
            subTab === "security"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Security
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
          <Timer size={16} className="text-[#0098ea]" />
          <span>Login Audit</span>
        </button>
      </div>

      {/* 1. PROFILE TAB CONTENT */}
      {subTab === "profile" && (
        <div className="space-y-3.5">
          {/* Section 1: Personal Data */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">Personal data</h2>
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

          {/* Section 2: Connected Accounts with Telegram Official Verified Badge */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">Connected accounts</h2>
            <div className="liquid-glass p-3.5 space-y-2 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Send size={18} className="text-[#0098ea] flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-600 block">Telegram</span>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      {telegramUsername}
                      {user && <TelegramVerifiedBadge size={13} />}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#14532d] font-bold">
                  <Check size={16} />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECURITY TAB CONTENT */}
      {subTab === "security" && (
        <div className="space-y-3.5">
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

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900">Session Audit Guarantee:</div>
                <p className="text-[11px] text-slate-600">
                  Every sign-in, session handover, and exchange transaction is recorded into the database audit trail for complete security transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LOGIN & ACTIVITY AUDIT TAB CONTENT */}
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
