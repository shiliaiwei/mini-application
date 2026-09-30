"use client";

import { useState, useEffect } from "react";
import { COOLDOWN_MS, type FlashMsg } from "./weiWalletUtils";

// ─── Countdown Timer Hook ─────────────────────────────────────────────────────
export function useCountdown(targetMs: number): string {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => {
      const r = targetMs - Date.now();
      if (r <= 0) { setLabel("Ready"); return; }
      const h = Math.floor(r / 3600000);
      const m = Math.floor((r % 3600000) / 60000);
      const s = Math.floor((r % 60000) / 1000);
      setLabel(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return label;
}

// ─── Inline Flash Message Component ──────────────────────────────────────────
export function InlineMsg({ state }: { state: FlashMsg }) {
  if (!state) return null;
  return (
    <div
      className={`py-2 px-3 rounded-xl text-xs font-bold animate-fadeIn ${
        state.ok
          ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
          : "bg-red-50 border border-red-200 text-red-600"
      }`}
    >
      {state.text}
    </div>
  );
}

// ─── useDailyCooldown: tracks last claim and exposes canClaim ─────────────────
export function useDailyCooldown(): {
  lastClaim:    number;
  canClaim:     boolean;
  nextClaimMs:  number;
  recordClaim:  () => void;
} {
  const [lastClaim, setLastClaim] = useState<number>(0);
  const nextClaimMs = lastClaim + COOLDOWN_MS;
  const canClaim    = Date.now() >= nextClaimMs;

  const recordClaim = () => setLastClaim(Date.now());

  return { lastClaim, canClaim, nextClaimMs, recordClaim };
}
