"use client";

import React, { useState, useEffect } from "react";
import type { TelegramUser, TelegramWebApp } from "@/types/telegram";

import { WeiBalanceCard, type WalletPanel } from "@/components/wallet/WeiBalanceCard";
import { WeiHalvingBar }                    from "@/components/wallet/WeiHalvingBar";
import { WeiDailyClaimCard }                from "@/components/wallet/WeiDailyClaimCard";
import { WeiSendPanel }                     from "@/components/wallet/WeiSendPanel";
import { WeiExchangePanel }                 from "@/components/wallet/WeiExchangePanel";
import { WeiOverviewGrid }                  from "@/components/wallet/WeiOverviewGrid";

export interface WeiWalletDashboardProps {
  user:            TelegramUser;
  tgApp:           TelegramWebApp | null;
  weiBalance:      number;
  usdBalance:      number;
  khrBalance:      number;
  onBalanceUpdate: (n: number) => void;
}

/**
 * WeiWalletDashboard — thin orchestrator.
 * Owns: address, supply data, active panel.
 * Each panel is a self-contained sub-component with its own local state.
 */
export function WeiWalletDashboard({
  user,
  tgApp,
  weiBalance,
  usdBalance,
  khrBalance,
  onBalanceUpdate,
}: WeiWalletDashboardProps) {
  const [address,      setAddress]      = useState<string | null>(null);
  const [distributed,  setDistributed]  = useState(0);
  const [supplyLoaded, setSupplyLoaded] = useState(false);
  const [panel,        setPanel]        = useState<WalletPanel>("overview");

  const initData =
    typeof window !== "undefined"
      ? (window.Telegram?.WebApp?.initData ?? "")
      : "";

  // ─── Boot: wallet address + global supply ─────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    fetch(
      `/api/wallet/balance?telegram_id=${user.id}&initData=${encodeURIComponent(initData)}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.address) setAddress(d.address);
        if (typeof d.balance === "number") onBalanceUpdate(d.balance);
      })
      .catch(() => {});

    fetch("/api/wallet/supply")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.supply) setDistributed(d.supply.totalDistributed);
      })
      .catch(() => {})
      .finally(() => setSupplyLoaded(true));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── SSE: real-time balance stream ───────────────────────────────────────
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

  // ─── Claim callback: update supply + balance ──────────────────────────────
  const handleClaimed = (earned: number, newBalance: number) => {
    setDistributed((d) => d + earned);
    onBalanceUpdate(newBalance);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto space-y-4 pb-24 font-sans select-none">

      <WeiBalanceCard
        address={address}
        weiBalance={weiBalance}
        usdBalance={usdBalance}
        khrBalance={khrBalance}
        panel={panel}
        onPanel={setPanel}
        tgApp={tgApp}
      />

      <WeiHalvingBar
        distributed={distributed}
        supplyLoaded={supplyLoaded}
      />

      <WeiDailyClaimCard
        address={address}
        weiBalance={weiBalance}
        distributed={distributed}
        initData={initData}
        tgApp={tgApp}
        onClaimed={handleClaimed}
      />

      {panel === "send" && (
        <WeiSendPanel
          address={address}
          weiBalance={weiBalance}
          initData={initData}
          tgApp={tgApp}
          onBalanceUpdate={onBalanceUpdate}
        />
      )}

      {panel === "exchange" && (
        <WeiExchangePanel
          address={address}
          weiBalance={weiBalance}
          initData={initData}
          tgApp={tgApp}
          onBalanceUpdate={onBalanceUpdate}
        />
      )}

      {panel === "overview" && (
        <WeiOverviewGrid
          weiBalance={weiBalance}
          usdBalance={usdBalance}
          khrBalance={khrBalance}
          distributed={distributed}
        />
      )}
    </div>
  );
}

export default WeiWalletDashboard;
