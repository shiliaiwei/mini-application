/**
 * Shared constants, pure math helpers, and hooks for the WEI wallet dashboard.
 * Import from here in all wallet sub-components — single source of truth.
 */

// ─── Tokenomics Constants ─────────────────────────────────────────────────────
export const MAX_SUPPLY    = 21_000_000;
export const HALVING_STEP  = 10_500_000;
export const INITIAL_BLOCK = 1_000;
export const COOLDOWN_MS   = 24 * 60 * 60 * 1000;

// ─── Pure Math Helpers ────────────────────────────────────────────────────────
export function blockRewardAt(distributed: number): number {
  const n = Math.floor(distributed / HALVING_STEP);
  return Math.max(1, Math.floor(INITIAL_BLOCK / Math.pow(2, n)));
}

export function halvingPct(distributed: number): number {
  const n    = Math.floor(distributed / HALVING_STEP);
  const from = n * HALVING_STEP;
  const to   = Math.min(MAX_SUPPLY, (n + 1) * HALVING_STEP);
  if (distributed <= from || to <= from) return 0;
  return Math.min(100, ((distributed - from) / (to - from)) * 100);
}

// ─── Flash message helper ─────────────────────────────────────────────────────
export type FlashMsg = { ok: boolean; text: string } | null;

export function flash(
  setter: (v: FlashMsg) => void,
  ok: boolean,
  text: string
): void {
  setter({ ok, text });
  setTimeout(() => setter(null), 4500);
}

// ─── Shared WC address regex ──────────────────────────────────────────────────
export const WC_ADDRESS_REGEX = /^WC[a-fA-F0-9]{40}$/;
