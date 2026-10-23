"use client";

import React, { useEffect } from "react";
import Image from "next/image";

/**
 * GlitchOfflineScreen
 *
 * Authentic CRT / TV Static Glitch Offline Mode Screen.
 * Strictly adheres to the reference CRT aesthetic:
 * - Pure pitch black (#000000) canvas
 * - Authentic pixel-art "OFFLINE" wordmark with chromatic aberration (cyan/magenta split)
 * - CRT scanline raster overlay and perimeter tube vignette
 * - Horizontal displacement slice glitch jitter
 * - Monospace system telemetry: [ SYSTEM OFFLINE ]
 * - Completely unbypassable: zero interactive escape hatches or bypass links
 * - Zero Emojis rule strictly enforced
 */
export const GlitchOfflineScreen: React.FC = () => {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "OFFLINE";
    }
  }, []);

  return (
    <main
      role="alert"
      aria-label="Site Offline"
      className="fixed inset-0 w-screen h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden select-none z-[9999] font-mono"
    >
      {/* 1. CRT Screen Perimeter Tube Vignette & Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 z-30 crt-vignette" />

      {/* 2. CRT Scanline Raster Mesh Overlay */}
      <div className="pointer-events-none absolute inset-0 z-20 crt-scanlines opacity-75" />

      {/* 3. Sweeping CRT Vertical Scan Beam */}
      <div
        className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent z-25 animate-[scanline-sweep_8s_linear_infinite]"
        style={{ willChange: "transform" }}
      />

      {/* 4. Central Glitch OFFLINE Hero Graphic */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-2xl w-full">
        <div className="relative flex items-center justify-center p-4">
          {/* Chromatic Aberration Underlayer 1 (Cyan Shift Left) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center opacity-60 translate-x-[-3px] translate-y-[1px] mix-blend-screen filter drop-shadow-[0_0_8px_#00f0ff] pointer-events-none"
          >
            <Image
              src="/offline-glitch.png"
              alt=""
              width={520}
              height={240}
              priority
              className="w-auto h-28 sm:h-36 md:h-44 object-contain brightness-150 contrast-125"
            />
          </div>

          {/* Chromatic Aberration Underlayer 2 (Magenta Shift Right) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center opacity-60 translate-x-[3px] translate-y-[-1px] mix-blend-screen filter drop-shadow-[0_0_8px_#ff0055] pointer-events-none"
          >
            <Image
              src="/offline-glitch.png"
              alt=""
              width={520}
              height={240}
              priority
              className="w-auto h-28 sm:h-36 md:h-44 object-contain brightness-150 contrast-125"
            />
          </div>

          {/* Primary High-Contrast Center Image */}
          <div className="relative z-10 animate-[glitch-horizontal-1_3.5s_steps(2,end)_infinite]">
            <Image
              src="/offline-glitch.png"
              alt="OFFLINE"
              width={520}
              height={240}
              priority
              className="w-auto h-28 sm:h-36 md:h-44 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
            />
          </div>
        </div>

        {/* 5. Minimalist Retro Telemetry Status */}
        <div className="mt-8 text-center space-y-2 select-none tracking-widest uppercase">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0d1217] border border-cyan-500/30 text-cyan-400 text-xs font-black shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>SYSTEM OFFLINE</span>
          </div>

          <p className="text-[11px] text-slate-500 font-mono tracking-wider pt-2">
            STATUS: 503 SERVICE UNAVAILABLE • ACCESS SUSPENDED
          </p>
          <p className="text-[10px] text-slate-600 font-mono tracking-widest">
            ALL NETWORK NODES DISCONNECTED
          </p>
        </div>
      </div>

      {/* 6. Subtle Static Bottom Watermark */}
      <div className="absolute bottom-6 text-[10px] text-slate-700 tracking-widest font-mono z-10">
        SHILIAIWEI CORE // SYSTEM OFFLINE
      </div>
    </main>
  );
};
