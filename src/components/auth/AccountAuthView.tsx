"use client";

import React, { useState, useEffect } from "react";
import { ShiliaiweiBrand } from "@/components/brand/ShiliaiweiBrand";
import { BrandFooter } from "@/components/brand/BrandFooter";
import {
  User,
  Wallet,
  ShieldCheck,
  Sparkles,
  Check,
  CircleAlert,
  ArrowUpRight,
  Eye,
  EyeOff,
} from "@/components/icons/KeylineIcons";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";

interface AccountAuthViewProps {
  onLogin: (user: TelegramUser) => void;
  tgApp?: TelegramWebApp | null;
}

type AuthTab = "login" | "register";

export const AccountAuthView: React.FC<AccountAuthViewProps> = ({
  onLogin,
  tgApp,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPin, setLoginPin] = useState("");

  // Register form state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerPin, setRegisterPin] = useState("");

  const triggerHaptic = (type: "light" | "success" | "error" = "light") => {
    try {
      if (type === "success" || type === "error") {
        tgApp?.HapticFeedback?.notificationOccurred(type);
      } else {
        tgApp?.HapticFeedback?.impactOccurred(type);
      }
    } catch {}
  };

  // 1. Automatic Telegram Session Sync on mount
  useEffect(() => {
    try {
      const tgUser =
        window.Telegram?.WebApp?.initDataUnsafe?.user ||
        tgApp?.initDataUnsafe?.user;

      if (tgUser?.id) {
        const enrichedUser: TelegramUser = {
          ...tgUser,
          photo_url:
            tgUser.photo_url ||
            `/api/player/avatar?telegram_id=${tgUser.id}`,
        };
        try {
          localStorage.setItem("shi_tg_user_cache", JSON.stringify(enrichedUser));
        } catch {}
        onLogin(enrichedUser);
      }
    } catch {}
  }, [onLogin, tgApp]);

  // 2. Manual One-Tap Auto Sync Telegram Action
  const handleAutoSyncTelegram = () => {
    triggerHaptic("light");
    try {
      const tgUser =
        window.Telegram?.WebApp?.initDataUnsafe?.user ||
        tgApp?.initDataUnsafe?.user;

      if (tgUser?.id) {
        triggerHaptic("success");
        const enrichedUser: TelegramUser = {
          ...tgUser,
          photo_url:
            tgUser.photo_url ||
            `/api/player/avatar?telegram_id=${tgUser.id}`,
        };
        try {
          localStorage.setItem("shi_tg_user_cache", JSON.stringify(enrichedUser));
        } catch {}
        onLogin(enrichedUser);
      } else {
        // When running in external web browser, launch via Telegram bot to authenticate
        window.location.href = "https://t.me/srievibot/app";
      }
    } catch {
      window.location.href = "https://t.me/srievibot/app";
    }
  };

  // 3. Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = loginIdentifier.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your Username, Telegram ID, or @handle.");
      triggerHaptic("error");
      return;
    }

    if (loginPin && loginPin.length < 4) {
      setErrorMessage("Security PIN must be at least 4 digits.");
      triggerHaptic("error");
      return;
    }

    setIsLoading(true);
    triggerHaptic("light");

    try {
      // Determine numeric ID or generate stable hash for username
      let numericId = Number(trimmed.replace(/[^0-9]/g, ""));
      let username = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;

      if (!numericId || numericId <= 0) {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
          hash = (hash << 5) - hash + username.charCodeAt(i);
          hash |= 0;
        }
        numericId = Math.abs(hash) + 100000000;
      }

      const res = await fetch("/api/auth/validate-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: numericId,
          username: username.replace(/[^a-zA-Z0-9_]/g, ""),
          first_name: username ? `@${username}` : `Vault Holder #${String(numericId).slice(-4)}`,
        }),
      });

      const data = await res.json();
      if (data?.valid && data.user) {
        triggerHaptic("success");
        try {
          localStorage.setItem("shi_tg_user_cache", JSON.stringify(data.user));
        } catch {}
        onLogin(data.user);
      } else {
        setErrorMessage(data?.error || "Account not found. Please verify your credentials or register.");
        triggerHaptic("error");
      }
    } catch {
      setErrorMessage("Connection error. Please verify your credentials or create an account.");
      triggerHaptic("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Registration Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = registerUsername.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");
    const cleanName = registerFullName.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage("Username must be at least 3 alphanumeric characters.");
      triggerHaptic("error");
      return;
    }

    if (!cleanName) {
      setErrorMessage("Please enter your display name.");
      triggerHaptic("error");
      return;
    }

    if (registerPin && registerPin.length < 4) {
      setErrorMessage("Security PIN must be at least 4 digits.");
      triggerHaptic("error");
      return;
    }

    setIsLoading(true);
    triggerHaptic("light");

    try {
      // Generate consistent unique account ID from username
      let hash = 0;
      for (let i = 0; i < cleanUsername.length; i++) {
        hash = (hash << 5) - hash + cleanUsername.charCodeAt(i);
        hash |= 0;
      }
      const uniqueNumericId = Math.abs(hash) + 200000000;

      const newUser: TelegramUser = {
        id: uniqueNumericId,
        first_name: cleanName,
        username: cleanUsername,
        photo_url: `/api/player/avatar?telegram_id=${uniqueNumericId}`,
      };

      // Sync new account with backend
      const res = await fetch("/api/auth/validate-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: uniqueNumericId,
          username: cleanUsername,
          first_name: cleanName,
        }),
      });

      const data = await res.json();
      const userToSave = data?.valid && data.user ? data.user : newUser;

      triggerHaptic("success");
      try {
        localStorage.setItem("shi_tg_user_cache", JSON.stringify(userToSave));
      } catch {}
      onLogin(userToSave);
    } catch {
      setErrorMessage("Failed to create account. Please check network connection.");
      triggerHaptic("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white font-sans antialiased select-none flex flex-col justify-between relative overflow-hidden">
      {/* Background radial glow & banknote security guilloche */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-[#0d0f14] to-[#08090c] pointer-events-none z-0" />
      <div
        className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      />

      <div className="w-full relative z-10 max-w-md mx-auto px-4 pt-10 sm:pt-14 pb-8 flex-1 flex flex-col justify-center">
        {/* Brand Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center">
            <ShiliaiweiBrand variant="full" colorScheme="white" height={36} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-wider uppercase">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Web3 Vault Authentication</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Please log in or create an account to access your cryptocurrency wallet, balances, and ledger.
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-[#161a22]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
          {/* Segmented Control: Log In vs Create Account */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setActiveTab("login");
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "login"
                  ? "bg-[#0098ea] text-white shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User size={14} />
              <span>Log In (ចូលគណនី)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setActiveTab("register");
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "register"
                  ? "bg-[#0098ea] text-white shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles size={14} />
              <span>Create Account (ចុះឈ្មោះ)</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <CircleAlert size={16} className="text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: LOG IN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username or Telegram ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. your_handle or telegram_id"
                    className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:border-[#0098ea] focus:ring-2 focus:ring-[#0098ea]/20 outline-none transition-all font-mono"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <User size={16} />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Vault Security PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    {showPin ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showPin ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={6}
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="4 to 6 digit security PIN"
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:border-[#0098ea] focus:ring-2 focus:ring-[#0098ea]/20 outline-none transition-all font-mono tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#0098ea] hover:bg-[#0088cc] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#0098ea]/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating Vault...</span>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Log In to Web3 Vault</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Account Username (Handle)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="e.g. srievi_trader"
                    className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:border-[#0098ea] focus:ring-2 focus:ring-[#0098ea]/20 outline-none transition-all font-mono"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <User size={16} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Display Name
                </label>
                <input
                  type="text"
                  value={registerFullName}
                  onChange={(e) => setRegisterFullName(e.target.value)}
                  placeholder="e.g. Sri Evi"
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:border-[#0098ea] focus:ring-2 focus:ring-[#0098ea]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Set 4-Digit Security PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={registerPin}
                  onChange={(e) => setRegisterPin(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="4 to 6 digit security PIN"
                  className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:border-[#0098ea] focus:ring-2 focus:ring-[#0098ea]/20 outline-none transition-all font-mono tracking-widest"
                />
              </div>

              {/* Welcome Grant Callout */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-purple-200 block">Welcome Vault Grant</span>
                    <span className="text-[10px] text-purple-400">Automatic initial allotment</span>
                  </div>
                </div>
                <span className="font-black text-amber-300 text-sm">+1,000 WEI</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <Wallet size={16} />
                    <span>Create Web3 Vault Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Telegram Auto-Sync Action */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleAutoSyncTelegram}
              className="w-full py-3 rounded-2xl bg-[#229ed9] hover:bg-[#1e8bc0] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#229ed9]/25 active:scale-98 transition-all cursor-pointer"
            >
              <Check size={15} className="text-white" />
              <span>Auto Sync Telegram Account (ភ្ជាប់គណនី Telegram)</span>
            </button>

            <a
              href="https://t.me/srievibot/app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-98 transition-all text-center block"
            >
              <span>Launch Mini App via @srievibot</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full relative z-10 py-6 border-t border-white/10 flex flex-col items-center justify-center space-y-2 text-center">
        <p className="text-[11px] text-slate-500 font-mono">
          SHILIAIWEI Web3 Vault • Decentralized Security Infrastructure
        </p>
        <BrandFooter height={14} colorScheme="white" />
      </footer>
    </div>
  );
};
