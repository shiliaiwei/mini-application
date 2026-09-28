"use client";

import React, { useState, useEffect } from "react";
import { BrandFooter } from "@/components/brand/BrandFooter";

interface StatusCodeDefinition {
  code: number;
  title: string;
  category: "Client Error" | "Server Error" | "Cloudflare Error";
  categoryCode: "4xx" | "5xx";
  meaning: string;
  hostStatusText: string;
  badgeTheme: "amber" | "rose";
}

const CLOUDFLARE_STATUS_CODES: StatusCodeDefinition[] = [
  {
    code: 403,
    title: "Forbidden",
    category: "Client Error",
    categoryCode: "4xx",
    meaning: "The request contains bad syntax or cannot be fulfilled without verified session credentials.",
    hostStatusText: "Forbidden",
    badgeTheme: "amber",
  },
  {
    code: 401,
    title: "Unauthorized",
    category: "Client Error",
    categoryCode: "4xx",
    meaning: "Authentication credentials or Telegram initData cryptographic signature are missing.",
    hostStatusText: "Unauthorized",
    badgeTheme: "amber",
  },
  {
    code: 502,
    title: "Bad Gateway",
    category: "Server Error",
    categoryCode: "5xx",
    meaning: "The edge proxy received an invalid authentication response from the upstream origin host.",
    hostStatusText: "Bad Gateway",
    badgeTheme: "rose",
  },
  {
    code: 503,
    title: "Service Unavailable",
    category: "Server Error",
    categoryCode: "5xx",
    meaning: "The origin server is temporarily unable to handle direct requests without verified bot session.",
    hostStatusText: "Unavailable",
    badgeTheme: "rose",
  },
  {
    code: 520,
    title: "Web Server Returned Unknown Error",
    category: "Cloudflare Error",
    categoryCode: "5xx",
    meaning: "Cloudflare edge detected a non-standard handshake response from non-Telegram web client.",
    hostStatusText: "Origin Error",
    badgeTheme: "rose",
  },
  {
    code: 522,
    title: "Connection Timed Out",
    category: "Cloudflare Error",
    categoryCode: "5xx",
    meaning: "Connection to secure vault origin timed out due to missing cryptographic authorization token.",
    hostStatusText: "Timeout",
    badgeTheme: "rose",
  },
];

interface TelegramGateScreenProps {
  onBypass?: () => void;
  isDev?: boolean;
}

export const TelegramGateScreen: React.FC<TelegramGateScreenProps> = () => {
  const [statusInfo, setStatusInfo] = useState<StatusCodeDefinition>(CLOUDFLARE_STATUS_CODES[0]);
  const [rayId, setRayId] = useState<string>("8e19c04a79b28f31");
  const [currentHost, setCurrentHost] = useState<string>("app.kesararamwithdigital.tech");

  const channelUrl = "https://t.me/shiliaiwei";
  const botUrl = "https://t.me/srievibot";

  useEffect(() => {
    try {
      // Randomly pick a realistic Cloudflare status code per visit
      const randomStatus =
        CLOUDFLARE_STATUS_CODES[Math.floor(Math.random() * CLOUDFLARE_STATUS_CODES.length)];
      setStatusInfo(randomStatus);

      // Generate a realistic 16-hex Cloudflare Ray ID
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
        {/* Top Header Section (Authentic Cloudflare Mobile-First Header) */}
        <header className="max-w-4xl mx-auto px-5 sm:px-8 pt-7 sm:pt-14 pb-5 space-y-2.5">
          <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
            <h1 className="text-3xl sm:text-5xl font-light text-[#222222] tracking-tight">
              {statusInfo.code} {statusInfo.title}
            </h1>
            <span className="inline-block text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#efefef] text-[#555555] border border-[#e2e2e2] align-middle select-none">
              Error code {statusInfo.code}
            </span>
            <span
              className={`inline-block text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded border select-none ${
                statusInfo.badgeTheme === "amber"
                  ? "bg-amber-50 text-amber-800 border-amber-200/80"
                  : "bg-rose-50 text-rose-800 border-rose-200/80"
              }`}
            >
              {statusInfo.categoryCode} {statusInfo.category}
            </span>
          </div>

          <p className="text-[#475569] text-xs sm:text-sm font-normal leading-relaxed">
            {statusInfo.meaning}
          </p>

          <p className="text-[#555555] text-xs sm:text-base font-normal pt-0.5 leading-relaxed">
            Visit our{" "}
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0051c3] hover:underline font-semibold"
            >
              channel
            </a>{" "}
            for more information, then launch via{" "}
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0051c3] hover:underline font-semibold"
            >
              @srievibot
            </a>{" "}
            to access this page.
          </p>
        </header>

        {/* Real Cloudflare Status Band (Full-Width Gray Strip #efefef) */}
        <section className="w-full bg-[#efefef] border-y border-[#e2e2e2] py-8 sm:py-12 px-3 sm:px-6 relative my-1">
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2 sm:gap-6 items-start text-center relative">
            {/* Column 1: Browser (You) */}
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <span className="text-[11px] sm:text-sm font-normal text-[#797979]">
                You
              </span>

              {/* Authentic Cloudflare Monitor Device */}
              <div className="w-14 h-12 sm:w-24 sm:h-20 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 80"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="8" y="8" width="84" height="64" rx="8" fill="#797979" />
                  <rect x="14" y="20" width="72" height="46" rx="4" fill="#a4b0be" opacity="0.35" />
                  <circle cx="18" cy="14" r="2" fill="#ffffff" opacity="0.9" />
                  <circle cx="25" cy="14" r="2" fill="#ffffff" opacity="0.9" />
                  <circle cx="32" cy="14" r="2" fill="#ffffff" opacity="0.9" />
                  <circle cx="50" cy="44" r="16" fill="#78be20" />
                  <path
                    d="M42 44l5 5 11-11"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="pt-0.5 space-y-0.5">
                <div className="text-xs sm:text-lg font-normal text-[#444444]">
                  Browser
                </div>
                <div className="text-xs sm:text-base font-normal text-[#78be20]">
                  Working
                </div>
              </div>
            </div>

            {/* Column 2: Cloudflare (Phnom Penh Edge) */}
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <span className="text-[11px] sm:text-sm font-normal text-[#797979] truncate max-w-full">
                Phnom Penh
              </span>

              {/* Authentic Cloudflare Cloud Silhouette */}
              <div className="w-14 h-12 sm:w-24 sm:h-20 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 80"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M78 40c0-2-.2-4-.6-6-3.2-11.5-13.8-20-26.1-20-12.5 0-23 8.6-26 20.3C11.3 36.7 6.7 42.4 6.7 49.2c0 8.3 6.7 15 15 15h53.4c7.5 0 13.7-6.2 13.7-13.7 0-6.7-4.8-12.3-10.8-13.5z"
                    fill="#797979"
                  />
                  <circle cx="48" cy="46" r="16" fill="#78be20" />
                  <path
                    d="M40 46l5 5 11-11"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="pt-0.5 space-y-0.5">
                <div className="text-xs sm:text-lg font-normal text-[#0051c3] truncate max-w-full">
                  Cloudflare
                </div>
                <div className="text-xs sm:text-base font-normal text-[#78be20]">
                  Working
                </div>
              </div>
            </div>

            {/* Column 3: Page Host (Error / Restricted) */}
            <div className="flex flex-col items-center space-y-1 sm:space-y-2 relative">
              <span
                className="text-[11px] sm:text-sm font-normal text-[#797979] truncate max-w-full"
                title={currentHost}
              >
                Website
              </span>

              {/* Authentic Cloudflare Server Unit with Red X */}
              <div className="w-14 h-12 sm:w-24 sm:h-20 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 80"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="18" y="8" width="64" height="64" rx="12" fill="#797979" />
                  <rect x="28" y="52" width="44" height="2.5" rx="1.25" fill="#a4b0be" opacity="0.6" />
                  <circle cx="68" cy="20" r="2.5" fill="#22c55e" />
                  <circle cx="50" cy="40" r="16" fill="#e74c3c" />
                  <path
                    d="M43 33l14 14M57 33L43 47"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="pt-0.5 space-y-0.5">
                <div className="text-xs sm:text-lg font-normal text-[#444444]">
                  Host
                </div>
                <div className="text-xs sm:text-base font-normal text-[#e74c3c]">
                  {statusInfo.hostStatusText}
                </div>
              </div>

              {/* Authentic Cloudflare Downward Triangle Notch - Directly Anchored to Host Column */}
              <div className="absolute -bottom-8 sm:-bottom-12 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-transparent border-r-[12px] sm:border-r-[16px] border-r-transparent border-t-[12px] sm:border-t-[16px] border-t-[#efefef]" />
            </div>
          </div>
        </section>

        {/* Real Cloudflare 2-Column Explanations in Khmer Bold Text */}
        <section className="max-w-4xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-8 grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-12">
          {/* What happened? */}
          <div className="space-y-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
              តើមានអ្វីកើតឡើង?{" "}
              <span className="text-xs sm:text-sm text-slate-400 font-normal block sm:inline">
                What happened?
              </span>
            </h2>
            <p className="text-[#1e293b] text-xs sm:text-sm leading-relaxed font-bold font-sans">
              ការចូលមើលទំព័រនេះត្រូវបានដាក់កំហិតដើម្បីសុវត្ថិភាពរបស់អ្នក។ ម៉ាស៊ីនមេគេហទំព័រ (Host server) តម្រូវឱ្យមានសម័យប្រជុំដែលបានផ្ទៀងផ្ទាត់ត្រឹមត្រូវ មុនពេលបង្ហាញគណនីផ្ទាល់ខ្លួន និងទិន្នន័យកាបូបសុវត្ថិភាព (Vault data)។
            </p>
          </div>

          {/* What can I do? */}
          <div className="space-y-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
              តើខ្ញុំត្រូវធ្វើយ៉ាងណា?{" "}
              <span className="text-xs sm:text-sm text-slate-400 font-normal block sm:inline">
                What can I do?
              </span>
            </h2>
            <p className="text-[#1e293b] text-xs sm:text-sm leading-relaxed font-bold font-sans">
              សូមចូលមើល{" "}
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0051c3] hover:underline font-bold"
              >
                channel ផ្លូវការរបស់យើង (@shiliaiwei)
              </a>{" "}
              សម្រាប់ព័ត៌មានបន្ថែម បន្ទាប់មកបើកតាមរយៈតេឡេក្រាមបូតផ្លូវការ{" "}
              <a
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0051c3] hover:underline font-bold"
              >
                @srievibot
              </a>
              ។ ប្រព័ន្ធបូតនឹងផ្ទៀងផ្ទាត់សម័យប្រជុំរបស់អ្នកដោយស្វ័យប្រវត្តិ និងបើកការចូលប្រើប្រាស់ប្រកបដោយសុវត្ថិភាពភ្លាមៗ។
            </p>
          </div>
        </section>
      </div>

      {/* Cloudflare Telemetry Line & Official Shiliaiwei Brand Footer */}
      <footer className="w-full pt-4 pb-8 border-t border-[#f0f0f0] mt-8 flex flex-col items-center justify-center space-y-3">
        <p className="text-[11px] text-[#999999] font-mono tracking-wide">
          Cloudflare Ray ID: <span className="select-all text-[#666666]">{rayId}</span>{" "}
          <span className="text-[#cccccc]">•</span> Phnom Penh, Cambodia (ICT)
        </p>
        <BrandFooter height={16} colorScheme="blue" />
      </footer>
    </div>
  );
};


