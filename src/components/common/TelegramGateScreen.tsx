"use client";

import React, { useState, useEffect, useId } from "react";
import { BrandFooter } from "@/components/brand/BrandFooter";

interface TelegramGateScreenProps {
  onBypass?: () => void;
  isDev?: boolean;
}

export const TelegramGateScreen: React.FC<TelegramGateScreenProps> = () => {
  const [telemetryTime, setTelemetryTime] = useState({
    localFormatted: "2026-09-28 15:00:00",
    utcFormatted: "2026-09-28 08:00:00 UTC",
    zoneLabel: "ICT • Phnom Penh, Cambodia",
  });
  const [rayId, setRayId] = useState<string>("8e19c04a79b28f31");
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
        ? "ICT • Phnom Penh, Cambodia"
        : `${detectedZone.replace("_", " ")} (UTC${now.getTimezoneOffset() <= 0 ? "+" : "-"}${Math.abs(now.getTimezoneOffset() / 60)})`;

      setTelemetryTime({
        localFormatted: localStr,
        utcFormatted: utcStr,
        zoneLabel: zoneLabel,
      });

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
        <header className="max-w-4xl mx-auto px-5 sm:px-8 pt-7 sm:pt-14 pb-5 space-y-2">
          <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
            <h1 className="text-3xl sm:text-5xl font-light text-[#222222] tracking-tight">
              Page restricted
            </h1>
            <span className="inline-block text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#efefef] text-[#555555] border border-[#e2e2e2] align-middle select-none">
              Error code 403
            </span>
          </div>

          <p className="text-[#555555] text-xs sm:text-base font-normal pt-0.5">
            Visit{" "}
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0051c3] hover:underline font-normal"
            >
              cloudflare.com
            </a>{" "}
            or launch via{" "}
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0051c3] hover:underline font-medium"
            >
              @srievibot
            </a>{" "}
            for more information.
          </p>

          <p className="text-[#888888] text-[11px] sm:text-xs font-sans tracking-wide pt-0.5">
            <span className="font-medium text-[#444444] select-text">{telemetryTime.localFormatted}</span>{" "}
            <span className="text-[#0051c3] font-medium select-text">({telemetryTime.zoneLabel})</span>{" "}
            <span className="text-[#cccccc]">•</span>{" "}
            <span className="font-mono text-[#888888] select-text">{telemetryTime.utcFormatted}</span>
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
                  Error
                </div>
              </div>

              {/* Authentic Cloudflare Downward Triangle Notch - Directly Anchored to Host Column */}
              <div className="absolute -bottom-8 sm:-bottom-12 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-transparent border-r-[12px] sm:border-r-[16px] border-r-transparent border-t-[12px] sm:border-t-[16px] border-t-[#efefef]" />
            </div>
          </div>
        </section>

        {/* Real Cloudflare 2-Column Explanations in Standard Khmer & English */}
        <section className="max-w-4xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-8 grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-12">
          {/* What happened? */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-light text-[#222222] tracking-tight">
              តើមានអ្វីកើតឡើង?{" "}
              <span className="text-xs sm:text-sm text-[#888888] font-normal block sm:inline">
                What happened?
              </span>
            </h2>
            <p className="text-[#555555] text-xs sm:text-sm leading-relaxed font-normal font-sans">
              ការចូលមើលទំព័រនេះត្រូវបានការពារដោយសុវត្ថិភាពខ្ពស់។ ម៉ាស៊ីនបម្រើគេហទំព័រ (Host) បានកំណត់ការអនុញ្ញាតចំពោះការបើកមើលដោយផ្ទាល់ពីកម្មវិធីរុករក ពីព្រោះមិនទាន់មានការផ្ទៀងផ្ទាត់សម័យប្រជុំផ្លូវការនៅឡើយ។
            </p>
            <p className="text-[#888888] text-[11px] sm:text-xs leading-relaxed font-normal font-sans">
              Access to this page is restricted for your security. The host server requires an authenticated session before displaying private account and vault data.
            </p>
          </div>

          {/* What can I do? */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-light text-[#222222] tracking-tight">
              តើខ្ញុំត្រូវធ្វើយ៉ាងណា?{" "}
              <span className="text-xs sm:text-sm text-[#888888] font-normal block sm:inline">
                What can I do?
              </span>
            </h2>
            <p className="text-[#555555] text-xs sm:text-sm leading-relaxed font-normal font-sans">
              សូមបើកទំព័រនេះតាមរយៈតេឡេក្រាមបូតផ្លូវការ{" "}
              <a
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0051c3] hover:underline font-semibold"
              >
                @srievibot
              </a>{" "}
              ដើម្បីផ្ទៀងផ្ទាត់សម័យប្រជុំ និងទទួលបានការណែនាំលម្អិត។ ប្រព័ន្ធនឹងភ្ជាប់សុវត្ថិភាពដោយស្វ័យប្រវត្តិ និងបើកទំព័រជូនអ្នកភ្លាមៗ។
            </p>
            <p className="text-[#888888] text-[11px] sm:text-xs leading-relaxed font-normal font-sans">
              Please open this page via our verified Telegram bot{" "}
              <a
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0051c3] hover:underline font-semibold"
              >
                @srievibot
              </a>
              . The bot will automatically verify your session and unlock instant, secure access.
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

