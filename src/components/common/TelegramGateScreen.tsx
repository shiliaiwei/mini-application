"use client";

import React, { useState, useEffect } from "react";
import {
  AppCheck,
  CloudCheck,
  DatabaseX,
  CircleAlert,
  Send,
} from "@keyline-icons/react/two-tone";
import { BrandFooter } from "@/components/brand/BrandFooter";

interface TelegramGateScreenProps {
  onBypass?: () => void;
  isDev?: boolean;
}

export const TelegramGateScreen: React.FC<TelegramGateScreenProps> = () => {
  const [telemetryTime, setTelemetryTime] = useState({
    localFormatted: "2026-09-28 14:48:56",
    utcFormatted: "2026-09-28 07:48:56 UTC",
    zoneLabel: "ICT (UTC+7 • Phnom Penh, Cambodia)",
  });
  const [currentHost, setCurrentHost] = useState<string>("app.kesararamwithdigital.tech");

  const botUrl = "https://t.me/srievibot";

  useEffect(() => {
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");

      const utcStr = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`;

      let detectedZone = "Asia/Phnom_Penh";
      try {
        detectedZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Phnom_Penh";
      } catch {}

      const localFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: detectedZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const localStr = localFormatter.format(now).replace(",", "");

      const isCambodiaRegion =
        detectedZone.includes("Phnom_Penh") ||
        detectedZone.includes("Bangkok") ||
        detectedZone.includes("Indochina") ||
        now.getTimezoneOffset() === -420;

      const zoneLabel = isCambodiaRegion
        ? "ICT (UTC+7 • Phnom Penh, Cambodia)"
        : `${detectedZone.replace("_", " ")} (UTC${now.getTimezoneOffset() <= 0 ? "+" : "-"}${Math.abs(now.getTimezoneOffset() / 60)})`;

      setTelemetryTime({
        localFormatted: localStr,
        utcFormatted: utcStr,
        zoneLabel: zoneLabel,
      });

      if (typeof window !== "undefined") {
        setCurrentHost(window.location.host || "app.kesararamwithdigital.tech");
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 font-sans antialiased select-none flex flex-col justify-between relative overflow-x-hidden">
      {/* Subtle Skeuomorphic Banknote Guilloche Texture Canvas */}
      <div className="fixed inset-0 bg-app-background opacity-[0.06] pointer-events-none z-0" />

      <div className="w-full relative z-10 max-w-4xl mx-auto px-3 sm:px-6 pt-5 sm:pt-10 pb-6 space-y-4 sm:space-y-6">
        {/* Skeuomorphic Header Plaque */}
        <header
          className="rounded-3xl p-5 sm:p-7 bg-gradient-to-b from-white via-[#fcfdfe] to-[#f4f7fa] border border-slate-200/90 space-y-2.5"
          style={{
            boxShadow:
              "0 10px 28px -6px rgba(15, 23, 42, 0.08), inset 0 2px 2px #ffffff, inset 0 -1.5px 2px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0098ea] shadow-[0_0_8px_#0098ea] animate-pulse" />
              <h1 className="text-2xl sm:text-4xl font-normal text-slate-900 tracking-tight leading-tight">
                Page restricted
              </h1>
            </div>

            {/* Recessed Debossed Error Code Pill */}
            <span
              className="inline-flex items-center text-xs sm:text-[13px] font-bold px-3 py-1 rounded-full bg-[#eef2f6] text-slate-700 border border-slate-300/80"
              style={{
                boxShadow: "inset 0 1.5px 2px rgba(0, 0, 0, 0.08), 0 1px 1px #ffffff",
              }}
            >
              Error code 403
            </span>
          </div>

          <p className="text-slate-600 text-xs sm:text-sm font-normal">
            Visit{" "}
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0098ea] hover:text-[#0077b5] underline font-medium"
            >
              telegram.org
            </a>{" "}
            or launch via <strong className="text-slate-800 font-semibold">@srievibot</strong> for more information.
          </p>

          {/* Tactile Inset Telemetry Bar (Cambodia Local Time & UTC) */}
          <div
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-500 text-[11px] sm:text-xs font-sans flex flex-wrap items-center gap-x-2 gap-y-1"
            style={{
              boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 1px #ffffff",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#22c55e]" />
            <span className="font-bold text-slate-800 select-text">
              {telemetryTime.localFormatted}
            </span>
            <span className="text-[#0098ea] font-semibold select-text">
              ({telemetryTime.zoneLabel})
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-400 font-mono text-[11px] select-text">
              {telemetryTime.utcFormatted}
            </span>
          </div>
        </header>

        {/* 3D Skeuomorphic Console with Official Keyline Two-Tone Icons & Animated Edge */}
        <section className="relative">
          <div
            className="relative rounded-3xl p-4 sm:p-7 overflow-hidden bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#eef2f6] border border-slate-300/80"
            style={{
              boxShadow:
                "0 20px 42px -10px rgba(15, 23, 42, 0.12), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(15, 23, 42, 0.05)",
            }}
          >
            {/* Subtle Banknote Pattern */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.05]"
              style={{
                backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "cover",
              }}
            />

            {/* Hardware Animated Conduit Edge Track */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="emeraldLaserGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="crimsonLaserGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Debossed Conduit Base Groove */}
              <line
                x1="17%"
                y1="50%"
                x2="83%"
                y2="50%"
                stroke="#cbd5e1"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.8"
              />
              <line
                x1="17%"
                y1="50%"
                x2="83%"
                y2="50%"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.4"
              />

              {/* Active Emerald Fiber Track (Node 1 -> Node 2) */}
              <line
                x1="17%"
                y1="50%"
                x2="50%"
                y2="50%"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#emeraldLaserGlow)"
              />

              {/* Animated Emerald Data Packet */}
              <circle r="4" fill="#34d399">
                <animate attributeName="cx" values="17%;50%" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="cy" values="50%;50%" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;1;0.4" dur="1.6s" repeatCount="indefinite" />
              </circle>

              <circle r="2.8" fill="#6ee7b7">
                <animate attributeName="cx" values="17%;50%" dur="1.6s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="cy" values="50%;50%" dur="1.6s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;1;0.3" dur="1.6s" begin="0.8s" repeatCount="indefinite" />
              </circle>

              {/* Interrupted Warning Track (Node 2 -> Node 3) */}
              <line
                x1="50%"
                y1="50%"
                x2="83%"
                y2="50%"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
                filter="url(#crimsonLaserGlow)"
              />

              {/* Warning Blocked Ping */}
              <circle r="3.5" fill="#fb7185">
                <animate attributeName="cx" values="50%;78%;50%" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="cy" values="50%;50%;50%" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2.2s" repeatCount="indefinite" />
              </circle>
            </svg>

            {/* 3 Skeuomorphic Tactile Node Pods with Official Keyline Two-Tone Icons */}
            <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-5 items-stretch text-center">
              {/* Pod 1: Browser (You) */}
              <div
                className="rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-between space-y-1.5 sm:space-y-2 bg-gradient-to-b from-white to-slate-100 border border-slate-300"
                style={{
                  boxShadow:
                    "0 8px 18px -4px rgba(15, 23, 42, 0.1), inset 0 2px 2px rgba(255, 255, 255, 1)",
                }}
              >
                <span className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-200/80 px-2 py-0.5 rounded-full border border-slate-300/60 shadow-2xs truncate max-w-full">
                  You
                </span>

                {/* Tactile Inset Well with Official Keyline AppCheck Icon */}
                <div
                  className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center my-0.5 sm:my-1 bg-gradient-to-b from-slate-100 to-white border border-slate-200"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(255, 255, 255, 0.9)",
                  }}
                >
                  <AppCheck
                    size={28}
                    className="text-[#16a34a] sm:w-[34px] sm:h-[34px] drop-shadow-xs"
                  />
                </div>

                <div className="space-y-0.5 sm:space-y-1 w-full">
                  <div className="text-[11px] sm:text-sm font-bold text-slate-800 truncate">
                    Browser
                  </div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[9px] sm:text-xs font-bold shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                    <span>Working</span>
                  </div>
                </div>
              </div>

              {/* Pod 2: Global Edge */}
              <div
                className="rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-between space-y-1.5 sm:space-y-2 bg-gradient-to-b from-white to-sky-50 border border-sky-300"
                style={{
                  boxShadow:
                    "0 8px 18px -4px rgba(0, 152, 234, 0.16), inset 0 2px 2px rgba(255, 255, 255, 1)",
                }}
              >
                <span className="text-[9px] sm:text-xs font-bold text-[#0077b5] uppercase tracking-wider bg-sky-100/90 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs truncate max-w-full">
                  Global Edge
                </span>

                {/* Tactile Inset Well with Official Keyline CloudCheck Icon */}
                <div
                  className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center my-0.5 sm:my-1 bg-gradient-to-b from-sky-50 to-white border border-sky-200"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px rgba(0, 152, 234, 0.1), 0 2px 4px rgba(255, 255, 255, 0.9)",
                  }}
                >
                  <CloudCheck
                    size={28}
                    className="text-[#0098ea] sm:w-[34px] sm:h-[34px] drop-shadow-xs"
                  />
                </div>

                <div className="space-y-0.5 sm:space-y-1 w-full">
                  <div className="text-[11px] sm:text-sm font-bold text-[#0077b5] truncate">
                    Secure Edge
                  </div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[9px] sm:text-xs font-bold shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                    <span>Working</span>
                  </div>
                </div>
              </div>

              {/* Pod 3: This Page */}
              <div
                className="rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-between space-y-1.5 sm:space-y-2 bg-gradient-to-b from-slate-900 to-[#070b14] border border-slate-700 text-white"
                style={{
                  boxShadow:
                    "0 10px 22px -3px rgba(15, 23, 42, 0.4), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.2)",
                }}
              >
                <span className="text-[9px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider bg-slate-800 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-slate-700 shadow-2xs truncate max-w-full" title={currentHost}>
                  Page Host
                </span>

                {/* Tactile Inset Well with Official Keyline DatabaseX Icon */}
                <div
                  className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center my-0.5 sm:my-1 bg-gradient-to-b from-[#090d16] to-[#161f30] border border-slate-800"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 1px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <DatabaseX
                    size={28}
                    className="text-[#ef4444] sm:w-[34px] sm:h-[34px] drop-shadow-sm"
                  />
                </div>

                <div className="space-y-0.5 sm:space-y-1 w-full">
                  <div className="text-[11px] sm:text-sm font-bold text-slate-200 truncate">
                    This Page
                  </div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[9px] sm:text-xs font-bold shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#ef4444] animate-pulse" />
                    <span>Restricted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skeuomorphic Triangular Callout Notch */}
          <div className="relative h-3">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[14px] border-t-[#eef2f6] mx-auto md:ml-[80%] drop-shadow-xs" />
          </div>
        </section>

        {/* Skeuomorphic Khmer Language Explanations (What Happened? What Can I Do?) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
          {/* Card 1: តើមានអ្វីកើតឡើង? (What happened?) */}
          <div
            className="rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-white via-[#fcfdfe] to-[#f8fafc] border border-slate-200/90 space-y-3"
            style={{
              boxShadow:
                "0 8px 24px -5px rgba(15, 23, 42, 0.07), inset 0 1.5px 2px #ffffff",
            }}
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <div
                className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs"
                style={{
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 1px #ffffff",
                }}
              >
                <CircleAlert size={18} className="text-[#0098ea]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-sans">
                  តើមានអ្វីកើតឡើង?
                </h2>
                <span className="text-[10px] text-slate-400 font-medium block">
                  What happened?
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-sans">
              ការចូលមើលទំព័រនេះដោយផ្ទាល់តាមរយៈកម្មវិធីរុករកបណ្ដាញ (Web Browser) ត្រូវបានដាក់កំហិត។ ទំព័រនេះត្រូវបានបង្កើតឡើងសម្រាប់ដំណើរការតែនៅក្នុងប្រព័ន្ធ Telegram តែប៉ុណ្ណោះ។ ប្រព័ន្ធមិនបានរកឃើញហត្ថលេខាសុវត្ថិភាពគ្រីបតូ (initData) ដែលចាំបាច់ដើម្បីផ្ទៀងផ្ទាត់សម័យប្រជុំ និងកាបូបរបស់អ្នកឡើយ។
            </p>
          </div>

          {/* Card 2: តើខ្ញុំត្រូវធ្វើយ៉ាងណា? (What can I do?) */}
          <div
            className="rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-white via-[#f0f9ff]/40 to-[#e0f2fe]/30 border border-sky-200/90 space-y-3"
            style={{
              boxShadow:
                "0 8px 24px -5px rgba(0, 152, 234, 0.08), inset 0 1.5px 2px #ffffff",
            }}
          >
            <div className="flex items-center gap-2.5 border-b border-sky-100 pb-2.5">
              <div
                className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-[#0098ea] shadow-2xs"
                style={{
                  boxShadow: "inset 0 1px 2px rgba(0, 152, 234, 0.1), 0 1px 1px #ffffff",
                }}
              >
                <Send size={18} className="text-[#0077b5]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-sans">
                  តើខ្ញុំត្រូវធ្វើយ៉ាងណា?
                </h2>
                <span className="text-[10px] text-slate-400 font-medium block">
                  What can I do?
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-sans">
              សូមបើកទំព័រនេះដោយផ្ទាល់តាមរយៈតេឡេក្រាមបូតផ្លូវការ <strong className="text-slate-900 font-semibold">@srievibot</strong> នៅក្នុងកម្មវិធី Telegram ទូរស័ព្ទដៃ ឬកុំព្យូទ័ររបស់អ្នក។ ប្រព័ន្ធបូតនឹងផ្ទៀងផ្ទាត់សុវត្ថិភាពដោយស្វ័យប្រវត្តិ និងអនុញ្ញាតឱ្យអ្នកចូលប្រើប្រាស់ទំព័រនេះភ្លាមៗ។
            </p>
          </div>
        </section>
      </div>

      {/* Official Shiliaiwei Brand Footer */}
      <footer className="w-full py-6 border-t border-slate-200/80 mt-10 flex flex-col items-center justify-center relative z-10">
        <BrandFooter height={18} colorScheme="blue" />
      </footer>
    </div>
  );
};
