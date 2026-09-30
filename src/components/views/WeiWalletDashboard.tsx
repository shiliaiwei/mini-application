"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WeiCoinBadge } from "@/components/brand/WeiCoinBadge";
import { WeiBitcoin3DCoin } from "@/components/brand/WeiBitcoin3DCoin";
import {
  Send,
  Repeat,
  Zap,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "@/components/icons/KeylineIcons";
import type { TelegramUser, TelegramWebApp } from "@/types/telegram";

// ─── Constants (mirrors gameSigner.ts) ───────────────────────────────────────
const MAX_SUPPLY    = 21_000_000;
const HALVING_STEP  = 10_500_000;
const INITIAL_BLOCK = 1_000;
const COOLDOWN_MS   = 24 * 60 * 60 * 1000;

// ─── Local Helpers ────────────────────────────────────────────────────────────
function blockRewardAt(distributed: number): number {
  const n = Math.floor(distributed / HALVING_STEP);
  return Math.max(1, Math.floor(INITIAL_BLOCK / Math.pow(2, n)));
}

function halvingPct(distributed: number): number {
  const n    = Math.floor(distributed / HALVING_STEP);
  const from = n * HALVING_STEP;
  const to   = Math.min(MAX_SUPPLY, (n + 1) * HALVING_STEP);
  if (distributed <= from || to <= from) return 0;
  return Math.min(100, ((distributed - from) / (to - from)) * 100);
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────
function useCountdown(targetMs: number): string {
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

// ─── Inline message helper ────────────────────────────────────────────────────
function InlineMsg({ state }: { state: { ok: boolean; text: string } | null }) {
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

// ─── Props ────────────────────────────────────────────────────────────────────
export interface WeiWalletDashboardProps {
  user:            TelegramUser;
  tgApp:           TelegramWebApp | null;
  weiBalance:      number;
  usdBalance:      number;
  khrBalance:      number;
  onBalanceUpdate: (n: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function WeiWalletDashboard({
  user,
  tgApp,
  weiBalance,
  usdBalance,
  khrBalance,
  onBalanceUpdate,
}: WeiWalletDashboardProps) {
  // Global supply state (fetched from /api/wallet/supply)
  const [distributed, setDistributed] = useState(0);
  const [supplyLoaded, setSupplyLoaded] = useState(false);

  // Wallet
  const [address, setAddress] = useState<string | null>(null);

  // Daily cooldown
  const [lastClaim, setLastClaim] = useState<number>(0);

  // Active panel
  const [panel, setPanel] = useState<"overview" | "send" | "exchange">("overview");

  // Claim state
  const [claiming, setClaiming]     = useState(false);
  const [claimMsg, setClaimMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  // Send state
  const [sendTo, setSendTo]     = useState("");
  const [sendAmt, setSendAmt]   = useState("");
  const [sendMsg, setSendMsg]   = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending]   = useState(false);

  // Exchange state
  const [xAmt, setXAmt]       = useState("");
  const [xPair, setXPair]     = useState<"WEI_USD" | "WEI_KHR">("WEI_USD");
  const [xMsg, setXMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [xSending, setXSending] = useState(false);

  // Derived halving values
  const nextClaimMs  = lastClaim + COOLDOWN_MS;
  const canClaim     = Date.now() >= nextClaimMs;
  const countdown    = useCountdown(nextClaimMs);
  const blockReward  = blockRewardAt(distributed);
  const halvingPct_  = halvingPct(distributed);
  const halvingCount = Math.floor(distributed / HALVING_STEP);
  const nextHalvingAt = Math.min(MAX_SUPPLY, (halvingCount + 1) * HALVING_STEP);

  const initData = typeof window !== "undefined"
    ? window.Telegram?.WebApp?.initData || ""
    : "";

  // ─── Haptics ───────────────────────────────────────────────────────────────
  const haptic = (t: "light" | "medium") => {
    try { tgApp?.HapticFeedback?.impactOccurred(t); } catch {}
  };
  const hapticOk = () => {
    try { tgApp?.HapticFeedback?.notificationOccurred("success"); } catch {}
  };
  const flash = (
    setter: (v: { ok: boolean; text: string } | null) => void,
    ok: boolean,
    text: string
  ) => {
    setter({ ok, text });
    setTimeout(() => setter(null), 4500);
  };

  // ─── Fetch wallet address & live supply on mount ───────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    // Wallet address + balance
    fetch(
      `/api/wallet/balance?telegram_id=${user.id}&initData=${encodeURIComponent(initData)}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.address) setAddress(d.address);
        if (typeof d.balance === "number") onBalanceUpdate(d.balance);
      })
      .catch(() => {});

    // Global supply stats
    fetch("/api/wallet/supply")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.supply) {
          setDistributed(d.supply.totalDistributed);
          setSupplyLoaded(true);
        }
      })
      .catch(() => { setSupplyLoaded(true); });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── SSE Real-Time Balance Stream ─────────────────────────────────────────
  useEffect(() => {
    if (!address) return;
    const es = new EventSource(
      `/api/wallet/stream?address=${encodeURIComponent(address)}`
    );
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof data.balance === "number") onBalanceUpdate(data.balance);
      } catch {}
    };
    return () => es.close();
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Daily Claim ──────────────────────────────────────────────────────────
  const handleClaim = useCallback(async () => {
    if (!canClaim || !address || claiming) return;
    setClaiming(true);
    setClaimMsg(null);
    haptic("medium");
    try {
      const res = await fetch("/api/wallet/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAddress:    address,
          gameId:       "daily_claim",
          score:        100,
          spendSeconds: 5,
          initData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLastClaim(Date.now());
        const earned = data.reward?.rewardAmount ?? 0;
        setDistributed((d) => d + earned);
        onBalanceUpdate(data.reward?.newBalance ?? weiBalance + earned);
        hapticOk();
        flash(setClaimMsg, true, `+${earned.toLocaleString()} WEI claimed`);
      } else {
        flash(setClaimMsg, false, data.error || "Claim failed");
      }
    } catch {
      flash(setClaimMsg, false, "Network error. Try again.");
    } finally {
      setClaiming(false);
    }
  }, [canClaim, address, claiming, initData, weiBalance]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Send WEI ─────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (sending) return;
    setSendMsg(null);
    const amt = parseInt(sendAmt, 10);
    if (!/^WC[a-fA-F0-9]{40}$/.test(sendTo)) {
      flash(setSendMsg, false, "Invalid WC address"); return;
    }
    if (!amt || amt <= 0) { flash(setSendMsg, false, "Enter a valid amount"); return; }
    if (amt > weiBalance) { flash(setSendMsg, false, "Insufficient WEI balance"); return; }

    setSending(true);
    haptic("light");
    try {
      // 1. Get nonce
      const nRes = await fetch(
        `/api/wallet/nonce?address=${encodeURIComponent(address!)}`
      );
      const { nonce } = await nRes.json();

      // 2. Server-side sign (server decrypts private key for user)
      const sRes = await fetch("/api/wallet/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          to_address: sendTo,
          amount:     amt,
          nonce,
        }),
      });
      const sData = await sRes.json();
      if (!sData.signature) {
        flash(setSendMsg, false, sData.error || "Signing failed"); return;
      }

      // 3. Execute transfer
      const tRes = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAddress: address,
          toAddress:   sendTo,
          amount:      amt,
          nonce,
          signature:   sData.signature,
          initData,
        }),
      });
      const tData = await tRes.json();
      if (tData.success) {
        hapticOk();
        onBalanceUpdate(tData.newSenderBalance ?? weiBalance - amt);
        flash(setSendMsg, true, `Sent ${amt.toLocaleString()} WEI`);
        setSendTo("");
        setSendAmt("");
      } else {
        flash(setSendMsg, false, tData.error || "Transfer failed");
      }
    } catch {
      flash(setSendMsg, false, "Network error");
    } finally {
      setSending(false);
    }
  }, [sending, sendTo, sendAmt, address, weiBalance, initData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Exchange & Burn ──────────────────────────────────────────────────────
  const handleExchange = useCallback(async () => {
    if (xSending) return;
    setXMsg(null);
    const amt = parseInt(xAmt, 10);
    if (!amt || amt < 100) { flash(setXMsg, false, "Minimum 100 WEI"); return; }
    if (amt > 25_000)     { flash(setXMsg, false, "Maximum 25,000 WEI per transaction"); return; }
    if (amt > weiBalance) { flash(setXMsg, false, "Insufficient WEI balance"); return; }

    setXSending(true);
    haptic("light");
    try {
      const res = await fetch("/api/wallet/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAddress: address,
          pair:        xPair,
          amount:      amt,
          initData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        hapticOk();
        const got =
          xPair === "WEI_USD"
            ? `$${Number(data.convertedAmount).toFixed(2)} USD`
            : `${Number(data.convertedAmount).toLocaleString()} ៛ KHR`;
        flash(setXMsg, true, `${amt.toLocaleString()} WEI → ${got} (burned)`);
        onBalanceUpdate(data.newBalance);
        setXAmt("");
      } else {
        flash(setXMsg, false, data.error || "Exchange failed");
      }
    } catch {
      flash(setXMsg, false, "Network error");
    } finally {
      setXSending(false);
    }
  }, [xSending, xAmt, xPair, address, weiBalance, initData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto space-y-4 pb-24 font-sans select-none">

      {/* ── HEADER BALANCE CARD ── */}
      <div
        className="relative rounded-[28px] p-5 overflow-hidden text-white"
        style={{
          background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
          boxShadow:
            "0 20px 50px -10px rgba(48,43,99,.5),inset 0 1px 1px rgba(255,255,255,.15)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <WeiCoinBadge size="sm" variant="badge-only" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-200">
              WEI WALLET
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/50 truncate max-w-[140px]">
            {address
              ? `${address.slice(0, 8)}...${address.slice(-6)}`
              : "Syncing..."}
          </span>
        </div>

        <div className="text-center py-3">
          <div className="flex items-center justify-center gap-3 mb-1">
            <WeiBitcoin3DCoin size={48} interactive={false} />
            <div>
              <span className="text-4xl font-black font-mono tracking-tight block">
                {weiBalance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-200/80">WEI COIN</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-white/60 font-mono">
            <span>${usdBalance.toFixed(2)} USD</span>
            <span>•</span>
            <span>{Math.floor(khrBalance).toLocaleString()} ៛</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {(["overview", "send", "exchange"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setPanel(t)}
              className={`flex-1 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                panel === t
                  ? "bg-white text-slate-900"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── BITCOIN HALVING PROGRESS BAR ── */}
      <div className="bg-white rounded-[22px] border border-amber-200/60 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            <span className="text-xs font-black uppercase text-slate-800">
              Halving #{halvingCount + 1}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-amber-400" />
            <span className="text-[10px] font-mono text-slate-500">
              Block Reward:{" "}
              <span className="text-amber-600 font-bold">
                {blockReward.toLocaleString()} WEI
              </span>
            </span>
          </div>
        </div>

        {supplyLoaded ? (
          <>
            <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{
                  width: `${halvingPct_}%`,
                  background: "linear-gradient(90deg,#f59e0b,#ef4444)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] font-mono text-slate-400">
              <span>
                {(halvingCount * HALVING_STEP).toLocaleString()} WEI
              </span>
              <span className="text-amber-500 font-bold">
                {halvingPct_.toFixed(1)}% to next halving
              </span>
              <span>{nextHalvingAt.toLocaleString()} WEI</span>
            </div>
            <div className="mt-1.5 text-center text-[9px] text-slate-400">
              {(MAX_SUPPLY - distributed).toLocaleString()} WEI remaining of{" "}
              21,000,000 hard cap
            </div>
          </>
        ) : (
          <div className="h-3 rounded-full bg-slate-100 animate-pulse" />
        )}
      </div>

      {/* ── DAILY CLAIM ── */}
      <div className="bg-white rounded-[22px] border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-xs font-black uppercase text-slate-800">
              Daily Reward
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Up to {Math.min(blockReward, 100).toLocaleString()} WEI / day
          </span>
        </div>
        <InlineMsg state={claimMsg} />
        {canClaim ? (
          <button
            onClick={handleClaim}
            disabled={claiming || !address}
            className="w-full mt-2 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {claiming ? "Processing..." : "Claim Daily WEI Reward"}
          </button>
        ) : (
          <div className="text-center mt-2">
            <span className="text-2xl font-black font-mono text-slate-700">
              {countdown}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">until next claim</p>
          </div>
        )}
      </div>

      {/* ── SEND PANEL ── */}
      {panel === "send" && (
        <div className="bg-white rounded-[22px] border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5">
            <Send size={14} className="text-[#0098ea]" />
            <span className="text-xs font-black uppercase text-slate-800">
              Send WEI
            </span>
          </div>
          <InlineMsg state={sendMsg} />
          <input
            type="text"
            placeholder="Recipient WC... address"
            value={sendTo}
            onChange={(e) => setSendTo(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-[#0098ea] bg-slate-50"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Amount (WEI)"
            value={sendAmt}
            onChange={(e) => setSendAmt(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-[#0098ea] bg-slate-50"
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full py-3 rounded-full bg-[#0098ea] hover:bg-[#0088cc] text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send WEI"}
          </button>
        </div>
      )}

      {/* ── EXCHANGE & BURN PANEL ── */}
      {panel === "exchange" && (
        <div className="bg-white rounded-[22px] border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5">
            <Repeat size={14} className="text-purple-500" />
            <span className="text-xs font-black uppercase text-slate-800">
              Exchange & Burn WEI
            </span>
          </div>
          <InlineMsg state={xMsg} />
          <div className="flex gap-2">
            {(["WEI_USD", "WEI_KHR"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setXPair(p)}
                className={`flex-1 py-2 rounded-full text-[11px] font-black transition-all active:scale-95 cursor-pointer ${
                  xPair === p
                    ? "bg-purple-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {p === "WEI_USD" ? "WEI → USD" : "WEI → KHR"}
              </button>
            ))}
          </div>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Amount WEI (min 100, max 25,000)"
            value={xAmt}
            onChange={(e) => setXAmt(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-purple-400 bg-slate-50"
          />
          <p className="text-[10px] text-slate-400 text-center">
            {xPair === "WEI_USD" ? "1 WEI = $0.01 USD" : "1 WEI = 41 KHR"} — WEI
            burned on exchange
          </p>
          <button
            onClick={handleExchange}
            disabled={xSending}
            className="w-full py-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {xSending ? "Processing..." : "Exchange & Burn WEI"}
          </button>
        </div>
      )}

      {/* ── OVERVIEW STATS ── */}
      {panel === "overview" && (
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "WEI Balance",
              value: weiBalance.toLocaleString(),
              unit: "WEI",
              color: "#f59e0b",
              Icon: Wallet,
            },
            {
              label: "USD Vault",
              value: `$${usdBalance.toFixed(2)}`,
              unit: "USD",
              color: "#10b981",
              Icon: TrendingUp,
            },
            {
              label: "KHR Bakong",
              value: Math.floor(khrBalance).toLocaleString(),
              unit: "KHR",
              color: "#8b5cf6",
              Icon: Repeat,
            },
            {
              label: "Block Reward",
              value: blockReward.toLocaleString(),
              unit: "WEI",
              color: "#0098ea",
              Icon: Zap,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-[18px] border border-slate-200 p-3 shadow-sm"
            >
              <div className="flex items-center gap-1 mb-1">
                <s.Icon size={11} style={{ color: s.color }} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {s.label}
                </span>
              </div>
              <span
                className="text-lg font-black font-mono"
                style={{ color: s.color }}
              >
                {s.value}
              </span>
              <span className="text-[9px] font-bold text-slate-400 ml-1">
                {s.unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WeiWalletDashboard;
