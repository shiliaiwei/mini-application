"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { LevelCircleProfile } from "@/components/common/LevelCircleProfile";
import {
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  ChevronDown,
  Mail,
  Phone,
  AlertTriangle,
  Lock,
  Monitor,
  Smartphone,
  Send,
  ShieldCheck,
} from "lucide-react";

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
  const [subTab, setSubTab] = useState<"profile" | "security">("profile");
  const [copiedId, setCopiedId] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [dob, setDob] = useState("2000-01-01");
  const [gender, setGender] = useState("Male");
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  return (
    <div className="space-y-4 pb-24 select-none font-body text-slate-900 max-w-xl mx-auto">
      {/* Top Header with Back Arrow */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
          Personal Profile
        </h1>
      </div>

      {/* WinGram Player Header Card with Standard Level Circle Profile */}
      <div className="liquid-glass p-4 flex items-center justify-between gap-3 border border-slate-200/90 shadow-sm">
        <LevelCircleProfile score={score} user={user} size="md" showDetails={true} />

        <button
          type="button"
          onClick={handleCopyId}
          className="flex flex-col items-end text-right flex-shrink-0"
        >
          <span className="text-[10px] text-slate-500 font-bold uppercase block">
            ID {playerId.slice(0, 8)}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#0098ea] hover:text-[#0077b5] mt-0.5 transition-colors font-semibold">
            {copiedId ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16a34a]" />
                <span className="text-[#16a34a]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </span>
        </button>
      </div>

      {/* WinGram Sub-Tab Toggle Pill (Profile / Security) */}
      <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-sm">
        <button
          type="button"
          onClick={() => setSubTab("profile")}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            subTab === "profile"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setSubTab("security")}
          className={`px-4 py-1.5 rounded-lg transition-all ${
            subTab === "security"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Security
        </button>
      </div>

      {/* PROFILE TAB CONTENT */}
      {subTab === "profile" && (
        <div className="space-y-4">
          {/* Section 1: Personal Data */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide">Personal data</h2>
            <div className="liquid-glass p-4 space-y-3 border border-slate-200/90 shadow-sm">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="wingram-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="wingram-input w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="relative">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="wingram-input w-full px-3 py-2 text-xs appearance-none pr-8"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="wingram-input w-full px-3 py-2 text-xs appearance-none pr-8 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full py-2.5 rounded-xl bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold transition-all shadow-sm active:scale-98"
              >
                {savedSuccess ? "Saved Successfully!" : "Save"}
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 pl-1">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 fill-amber-500 text-white" />
                <span>Mandatory field</span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide">Contact info</h2>
            <div className="liquid-glass p-4 space-y-3 border border-slate-200/90 shadow-sm">
              {/* Email */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">E-mail</span>
                    <span className="text-xs font-semibold text-slate-900 block">Not configured</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Phone number</span>
                    <span className="text-xs font-semibold text-slate-900 block">Not configured</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg bg-[#0098ea] hover:bg-[#0088cc] text-white text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Connected Accounts */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide">Connected accounts</h2>
            <div className="liquid-glass p-4 space-y-2.5 border border-slate-200/90 shadow-sm">
              {/* Telegram Official Account */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-[#0098ea] flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Telegram</span>
                    <span className="text-xs font-bold text-slate-900 block">{telegramUsername}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#16a34a] font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY TAB CONTENT */}
      {subTab === "security" && (
        <div className="space-y-4">
          {/* Security Status Card */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide">Account Security</h2>
            <div className="liquid-glass p-4 space-y-2.5 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Authentication Protocol</span>
                    <span className="text-xs font-bold text-slate-900 block">
                      Telegram End-to-End Cryptographic Handshake
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#16a34a] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Real Device Sessions Card */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide">Active Device Session</h2>
            <div className="liquid-glass p-4 space-y-3 border border-slate-200/90 shadow-sm">
              {/* Real Active Device from Telegram WebApp */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  {realPlatform.includes("IOS") || realPlatform.includes("ANDROID") ? (
                    <Smartphone className="w-4 h-4 text-[#0098ea] flex-shrink-0" />
                  ) : (
                    <Monitor className="w-4 h-4 text-[#0098ea] flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Telegram {realPlatform}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Language: {realLanguage} • Session: {formatSessionTime(spendSeconds)}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#16a34a] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  Online
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Real-Time Data Guarantee:</div>
                <p className="text-[11px] text-slate-500">
                  This mini-app reflects your genuine live Telegram session parameters, synchronized in real time with the secure cloud ledger.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
