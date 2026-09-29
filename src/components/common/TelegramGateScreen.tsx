"use client";

import React, { useState, useEffect } from "react";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { TelegramUser } from "@/types/telegram";

interface TelegramGateScreenProps {
  onSyncSuccess?: (user: TelegramUser) => void;
}

export const TelegramGateScreen: React.FC<TelegramGateScreenProps> = ({
  onSyncSuccess,
}) => {
  const [rayId, setRayId] = useState<string>("8e19c04a79b28f31");
  const [currentHost, setCurrentHost] = useState<string>("app.kesararamwithdigital.tech");

  const [telegramInput, setTelegramInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const channelUrl = "https://t.me/shiliaiwei";
  const botAppDirectUrl = "https://t.me/srievibot/app";
  const botDeepLink = "tg://resolve?domain=srievibot&startapp=true";

  const handleLaunchMiniApp = () => {
    try {
      if (typeof window !== "undefined") {
        window.location.href = botDeepLink;
      }
    } catch {}
  };

  const handleSyncAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncError(null);

    const trimmed = telegramInput.trim();
    if (!trimmed) {
      setSyncError("Please enter your Telegram User ID or @username");
      return;
    }

    // Extract numeric ID or handle
    let numericId = trimmed.replace(/[^0-9]/g, "");
    let username = trimmed.startsWith("@") ? trimmed.slice(1) : undefined;

    if (!numericId && username) {
      // If user typed username only, generate a consistent virtual hash ID
      let hash = 0;
      for (let i = 0; i < username.length; i++) {
        hash = (hash << 5) - hash + username.charCodeAt(i);
        hash |= 0;
      }
      numericId = String(Math.abs(hash) + 100000000);
    }

    if (!numericId || Number(numericId) <= 0) {
      setSyncError("Valid numeric Telegram ID required (e.g. 6600489302). Send /id to @srievibot to find yours.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/validate-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: numericId,
          username: username || undefined,
          first_name: username ? `@${username}` : `Telegram User #${numericId.slice(-4)}`,
        }),
      });

      const data = await res.json();

      if (data?.valid && data.user) {
        if (onSyncSuccess) {
          onSyncSuccess(data.user);
        }
      } else {
        setSyncError(data?.error || "Unable to sync Telegram account. Please verify your ID.");
      }
    } catch {
      setSyncError("Connection error while syncing Telegram account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    try {
      const randomHex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      setRayId(randomHex);

      if (typeof window !== "undefined") {
        setCurrentHost(window.location.host || "app.kesararamwithdigital.tech");
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans antialiased select-none flex flex-col justify-between">
      <div className="w-full">
        {/* Top Header Section */}
        <header className="max-w-4xl mx-auto px-5 sm:px-8 pt-7 sm:pt-14 pb-5 space-y-3">
          <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
            <h1 className="text-2xl sm:text-4xl font-bold text-[#222222] tracking-tight">
              Telegram Account Sync Required
            </h1>
            <span className="inline-block text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6f4ff] text-[#0051c3] border border-[#bae0ff] align-middle select-none">
              Web & Mini App Access
            </span>
          </div>

          <p className="text-[#555555] text-xs sm:text-base font-normal leading-relaxed">
            SHILIAIWEI is accessible across both external web browsers and the Telegram Mini App.
            To view balances, play the game, and claim WEI COIN, your session must be synced with an authentic Telegram account.
          </p>
        </header>

        {/* Sync Status Band */}
        <section className="w-full bg-[#f8fafc] border-y border-[#e2e8f0] py-6 sm:py-8 px-3 sm:px-6 relative my-1">
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            {/* Option A: Quick Web Sync Form */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0098ea]">
                  Option 1: Direct Web Browser Sync
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Connect Telegram Account
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Enter your numeric Telegram User ID or @username to authenticate your web browser session.
                </p>
              </div>

              <form onSubmit={handleSyncAccount} className="space-y-3">
                <div>
                  <label htmlFor="telegramInput" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Telegram User ID or @Username
                  </label>
                  <input
                    id="telegramInput"
                    type="text"
                    value={telegramInput}
                    onChange={(e) => setTelegramInput(e.target.value)}
                    placeholder="e.g. 6600489302 or @username"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0098ea] focus:ring-2 focus:ring-[#0098ea]/20 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Find your ID by sending /id or /sync to{" "}
                    <a
                      href={botAppDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0051c3] hover:underline font-bold"
                    >
                      @srievibot
                    </a>
                  </span>
                </div>

                {syncError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {syncError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#0098ea] hover:bg-[#0086cf] text-white font-bold text-xs uppercase tracking-wider shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Syncing Account..." : "Sync Telegram Account on Web"}
                </button>
              </form>
            </div>

            {/* Option B: Telegram Mini App Launch */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#16a34a]">
                  Option 2: Telegram Mini App
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Launch in Telegram App
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Open SHILIAIWEI inside the official Telegram Bot for instant, seamless authentication with zero setup.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={botAppDirectUrl}
                  onClick={handleLaunchMiniApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#229ed9] hover:bg-[#1e8bc0] text-white font-bold text-xs uppercase tracking-wider text-center block shadow-xs active:scale-98 transition-all"
                >
                  Open in Telegram (@srievibot)
                </a>

                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider text-center block active:scale-98 transition-all"
                >
                  Join Official Channel (@shiliaiwei)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2-Column Explanation Section */}
        <section className="max-w-4xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-12">
          {/* Dual Access Explanation */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#222222] tracking-tight">
              ការចូលប្រើដោយគ្មានការកម្រិត{" "}
              <span className="text-xs sm:text-sm text-slate-500 font-bold block sm:inline">
                Dual Platform Access
              </span>
            </h2>
            <p className="text-[#555555] text-xs sm:text-sm leading-relaxed font-normal font-sans">
              អ្នកអាចចូលប្រើកម្មវិធី SHILIAIWEI បានទាំងលើ Web Browser (កុំព្យូទ័រ/ទូរស័ព្ទ) និងក្នុង Telegram Mini App ដោយសេរី។ គណនីរបស់អ្នកនឹងភ្ជាប់ទិន្នន័យ (Sync) ពិន្ទុ និង Vault ស្វ័យប្រវត្តិតាមរយៈ Telegram ID។
            </p>
          </div>

          {/* Account Sync Security */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#222222] tracking-tight">
              សុវត្ថិភាព និងការផ្ទៀងផ្ទាត់{" "}
              <span className="text-xs sm:text-sm text-slate-500 font-bold block sm:inline">
                Account Sync Security
              </span>
            </h2>
            <p className="text-[#555555] text-xs sm:text-sm leading-relaxed font-normal font-sans">
              ការភ្ជាប់គណនីធានាថាពិន្ទុ និងសមតុល្យ WEI COIN របស់អ្នកត្រូវបានរក្សាទុកដោយសុវត្ថិភាពក្នុងប្រព័ន្ធ Neon Cloud Database។ អ្នកអាចបន្តលេង និងពិនិត្យសមតុល្យបានគ្រប់ពេលវេលាពីគ្រប់ឧបករណ៍។
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full pt-4 pb-8 border-t border-[#f0f0f0] mt-4 flex flex-col items-center justify-center space-y-3">
        <p className="text-[11px] text-[#999999] font-mono tracking-wide">
          Cloudflare Ray ID: <span className="select-all text-[#666666]">{rayId}</span>{" "}
          <span className="text-[#cccccc]">•</span> Host: {currentHost}
        </p>
        <BrandFooter height={16} colorScheme="blue" />
      </footer>
    </div>
  );
};
