"use client";

import React, { useEffect } from "react";

/**
 * SVG Path Coordinates for Pixelated "OFFLINE" Letters & CRT Artifacts
 * Pure Vector Implementation — Zero Image Dependencies
 */
const LETTERS_PATH =
  "M34,68h8v8h-8z M44,68h8v8h-8z M54,68h8v8h-8z M24,78h8v8h-8z M64,78h8v8h-8z M24,88h8v8h-8z M64,88h8v8h-8z M24,98h8v8h-8z M64,98h8v8h-8z M24,108h8v8h-8z M64,108h8v8h-8z M24,118h8v8h-8z M64,118h8v8h-8z M34,128h8v8h-8z M44,128h8v8h-8z M54,128h8v8h-8z M90,68h8v8h-8z M100,68h8v8h-8z M110,68h8v8h-8z M120,68h8v8h-8z M130,68h8v8h-8z M90,78h8v8h-8z M90,88h8v8h-8z M100,88h8v8h-8z M110,88h8v8h-8z M120,88h8v8h-8z M90,98h8v8h-8z M90,108h8v8h-8z M90,118h8v8h-8z M90,128h8v8h-8z M156,68h8v8h-8z M166,68h8v8h-8z M176,68h8v8h-8z M186,68h8v8h-8z M196,68h8v8h-8z M156,78h8v8h-8z M156,88h8v8h-8z M166,88h8v8h-8z M176,88h8v8h-8z M186,88h8v8h-8z M156,98h8v8h-8z M156,108h8v8h-8z M156,118h8v8h-8z M156,128h8v8h-8z M222,68h8v8h-8z M222,78h8v8h-8z M222,88h8v8h-8z M222,98h8v8h-8z M222,108h8v8h-8z M222,118h8v8h-8z M222,128h8v8h-8z M232,128h8v8h-8z M242,128h8v8h-8z M252,128h8v8h-8z M262,128h8v8h-8z M288,68h8v8h-8z M298,68h8v8h-8z M308,68h8v8h-8z M298,78h8v8h-8z M298,88h8v8h-8z M298,98h8v8h-8z M298,108h8v8h-8z M298,118h8v8h-8z M288,128h8v8h-8z M298,128h8v8h-8z M308,128h8v8h-8z M334,68h8v8h-8z M374,68h8v8h-8z M334,78h8v8h-8z M344,78h8v8h-8z M374,78h8v8h-8z M334,88h8v8h-8z M354,88h8v8h-8z M374,88h8v8h-8z M334,98h8v8h-8z M364,98h8v8h-8z M374,98h8v8h-8z M334,108h8v8h-8z M374,108h8v8h-8z M334,118h8v8h-8z M374,118h8v8h-8z M334,128h8v8h-8z M374,128h8v8h-8z M400,68h8v8h-8z M410,68h8v8h-8z M420,68h8v8h-8z M430,68h8v8h-8z M440,68h8v8h-8z M400,78h8v8h-8z M400,88h8v8h-8z M410,88h8v8h-8z M420,88h8v8h-8z M430,88h8v8h-8z M400,98h8v8h-8z M400,108h8v8h-8z M400,118h8v8h-8z M400,128h8v8h-8z M410,128h8v8h-8z M420,128h8v8h-8z M430,128h8v8h-8z M440,128h8v8h-8z";

const GLITCH_1_PATH =
  "M96,20h8v8h-8z M106,20h8v8h-8z M116,20h8v8h-8z M126,20h8v8h-8z M96,30h8v8h-8z M106,30h8v8h-8z M116,30h8v8h-8z M126,30h8v8h-8z M74,40h8v8h-8z M84,40h8v8h-8z M94,40h8v8h-8z M104,40h8v8h-8z M114,40h8v8h-8z M74,50h8v8h-8z M84,50h8v8h-8z M94,50h8v8h-8z M104,50h8v8h-8z";

const GLITCH_2_PATH =
  "M330,42h8v8h-8z M340,42h8v8h-8z M350,42h8v8h-8z M360,42h8v8h-8z M370,42h8v8h-8z M340,52h8v8h-8z M350,52h8v8h-8z M360,52h8v8h-8z M370,52h8v8h-8z";

/**
 * GlitchOfflineScreen
 *
 * Full-page, 100% in-code vector CRT cyber glitch offline display.
 * - ZERO image elements: entire typography and glitch graphics rendered via SVG code.
 * - Zero waving style: static stationary scanline raster with sharp digital twitch animations.
 * - Layered RGB chromatic aberration jitter (Cyan & Magenta split).
 * - Sporadic floating digital artifacts and horizontal tear slices.
 * - Completely unbypassable: no escape links, modals, or bypass controls.
 * - Strict Zero Emojis compliance.
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
      className="fixed inset-0 w-screen h-screen bg-[#020508] text-white flex flex-col items-center justify-center overflow-hidden select-none z-[9999] font-mono"
      style={{
        background: "radial-gradient(ellipse at center, #07121a 0%, #03080c 55%, #000000 100%)",
      }}
    >
      {/* 1. CRT Deep Screen Vignette Overlay */}
      <div className="pointer-events-none absolute inset-0 z-30 crt-vignette" />

      {/* 2. Stationary CRT Scanline Raster Mesh (Zero Waving / Non-Moving) */}
      <div className="pointer-events-none absolute inset-0 z-20 crt-scanlines-stationary opacity-60" />

      {/* 3. Central In-Code Vector Glitch Display */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-3xl">
        {/* Vector SVG OFFLINE Graphic Stack */}
        <div className="relative w-full max-w-[560px] aspect-[480/160] flex items-center justify-center">
          {/* Layer A: Cyan Chromatic Split (Underlayer, Left Offset) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 480 160"
            className="absolute inset-0 w-full h-full fill-[#00f0ff] pointer-events-none mix-blend-screen animate-[glitch-sharp-cyan_4s_steps(1,end)_infinite]"
            style={{ filter: "drop-shadow(0 0 14px rgba(0,240,255,0.75))" }}
          >
            <path d={LETTERS_PATH} />
            <path d={GLITCH_1_PATH} />
            <path d={GLITCH_2_PATH} />
          </svg>

          {/* Layer B: Magenta Chromatic Split (Underlayer, Right Offset) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 480 160"
            className="absolute inset-0 w-full h-full fill-[#ff0055] pointer-events-none mix-blend-screen animate-[glitch-sharp-magenta_4s_steps(1,end)_infinite]"
            style={{ filter: "drop-shadow(0 0 14px rgba(255,0,85,0.75))" }}
          >
            <path d={LETTERS_PATH} />
            <path d={GLITCH_1_PATH} />
            <path d={GLITCH_2_PATH} />
          </svg>

          {/* Layer C: Floating Glitch Artifact Block 1 (Top Left, Erratic Twitch) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 480 160"
            className="absolute inset-0 w-full h-full fill-[#cffafe] pointer-events-none animate-[glitch-artifact-1_3.2s_steps(1,end)_infinite]"
            style={{ filter: "drop-shadow(0 0 10px rgba(0,240,255,0.9))" }}
          >
            <path d={GLITCH_1_PATH} />
          </svg>

          {/* Layer D: Floating Glitch Artifact Block 2 (Top Right, Erratic Twitch) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 480 160"
            className="absolute inset-0 w-full h-full fill-[#cffafe] pointer-events-none animate-[glitch-artifact-2_2.8s_steps(1,end)_infinite]"
            style={{ filter: "drop-shadow(0 0 10px rgba(0,240,255,0.9))" }}
          >
            <path d={GLITCH_2_PATH} />
          </svg>

          {/* Layer E: Main High-Phosphor White Vector Graphic (Center, Sharp Glitch Jitter) */}
          <svg
            viewBox="0 0 480 160"
            className="relative z-10 w-full h-full fill-[#ffffff] animate-[glitch-sharp-white_4s_steps(1,end)_infinite]"
            style={{
              filter: "drop-shadow(0 0 10px rgba(0,240,255,0.85)) drop-shadow(0 0 32px rgba(0,240,255,0.45))",
            }}
          >
            <path d={LETTERS_PATH} />
          </svg>

          {/* Layer F: Sporadic Horizontal Tear Cut (Slice Glitch, Zero Wave) */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 h-[6px] bg-white/90 z-20 pointer-events-none animate-[glitch-slice-cut_4.5s_steps(1,end)_infinite] top-[52%]"
            style={{ filter: "drop-shadow(0 0 8px #00f0ff)" }}
          />
        </div>

        {/* 4. Minimalist Retro Telemetry Status HUD */}
        <div className="mt-10 text-center space-y-3 select-none tracking-widest uppercase">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#030c14] border border-cyan-500/40 text-cyan-300 text-xs font-black shadow-[0_0_20px_rgba(0,240,255,0.25)]">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
            <span className="tracking-widest">SYSTEM OFFLINE</span>
          </div>

          {/* Diagnostic Lines */}
          <p className="text-xs text-slate-400 font-mono tracking-wider pt-2">
            STATUS: 503 SERVICE UNAVAILABLE • ACCESS SUSPENDED
          </p>
          <p className="text-[11px] text-slate-500 font-mono tracking-widest">
            ALL NETWORK NODES DISCONNECTED
          </p>
        </div>
      </div>

      {/* 5. Minimalist Terminal Metrics Footer */}
      <div className="absolute bottom-6 text-[10px] text-slate-600 tracking-widest font-mono z-10 flex items-center gap-3">
        <span>CORE: LOCKED</span>
        <span>•</span>
        <span>PORT: 443 [OFFLINE]</span>
        <span>•</span>
        <span>ZERO BYPASS ENFORCED</span>
      </div>
    </main>
  );
};
