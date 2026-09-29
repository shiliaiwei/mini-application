"use client";

import React, { useState } from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ScanLine,
  Send,
} from "@/components/icons/KeylineIcons";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { BanknoteCreditCards } from "@/components/cards/BanknoteCreditCards";
import { BrandStatsQuadGrid } from "@/components/cards/BrandStatsQuadGrid";
import { SecureTransferLedgerProduct } from "@/components/cards/SecureTransferLedgerProduct";
import { NavCategory } from "@/components/navigation/CategoryBar";

type TapSubView = "none" | "send" | "scan";

interface TapGameViewProps {
  score: number;
  spendSeconds?: number;
  tapPower?: number;
  showBalances?: boolean;
  onToggleBalances?: () => void;
  onAddScore?: (amount: number) => void;
  onGoToSwap?: () => void;
  onGoToEarn?: () => void;
  onGoToSettings?: () => void;
  onSelectCategory?: (cat: NavCategory) => void;
  user: TelegramUser | null;
  tgApp: TelegramWebApp | null;
}

export const TapGameView: React.FC<TapGameViewProps> = React.memo(({
  score,
  spendSeconds = 0,
  tapPower = 1,
  onAddScore,
  onGoToSwap,
  onGoToEarn,
  showBalances,
  onToggleBalances,
  user,
  tgApp,
}) => {
  const [subView, setSubView] = useState<TapSubView>("none");
  const [showLocalBalances, setShowLocalBalances] = useState(true);
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendCurrency, setSendCurrency] = useState<"USD" | "KHR">("USD");
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Conversion rates: 100 WEI COIN = $1.00 USD = 4,100 KHR
  const usdValue = (score / 100).toFixed(2);
  const khrValue = Math.floor(score * 41).toLocaleString();

  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendRecipient || !sendAmount || isSending) return;

    setSendError(null);
    setIsSending(true);

    try {
      const parsedAmount = parseFloat(sendAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setSendError("Please enter a valid amount greater than 0");
        setIsSending(false);
        return;
      }

      // Convert to whole WEI COIN integer
      const weiAmount =
        sendCurrency === "USD"
          ? Math.round(parsedAmount * 100)
          : Math.round(parsedAmount / 41);

      if (weiAmount <= 0) {
        setSendError("Amount too small. Minimum transfer is 1 WEI COIN");
        setIsSending(false);
        return;
      }

      if (weiAmount > score) {
        setSendError(`Insufficient balance: available ${score} WEI COIN`);
        setIsSending(false);
        return;
      }

      const initData =
        typeof window !== "undefined" && window.Telegram?.WebApp?.initData
          ? window.Telegram.WebApp.initData
          : "";

      // 1. Resolve recipient to valid WC address
      const resolveRes = await fetch(
        `/api/wallet/resolve?target=${encodeURIComponent(sendRecipient.trim())}`
      );
      const resolveData = await resolveRes.json();
      if (!resolveRes.ok || !resolveData.address) {
        setSendError(resolveData.error || "Recipient not found in wallet registry");
        setIsSending(false);
        return;
      }
      const toAddress = resolveData.address;

      // 2. Fetch current nonce
      const nonceRes = await fetch(
        `/api/wallet/nonce?initData=${encodeURIComponent(initData)}`
      );
      const nonceData = await nonceRes.json();
      if (!nonceRes.ok || typeof nonceData.nonce !== "number") {
        setSendError(nonceData.error || "Failed to retrieve transaction nonce");
        setIsSending(false);
        return;
      }
      const nonce = nonceData.nonce;

      // 3. Cryptographically sign transfer payload
      const signRes = await fetch("/api/wallet/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          to_address: toAddress,
          amount: weiAmount,
          nonce,
        }),
      });
      const signData = await signRes.json();
      if (!signRes.ok || !signData.signature) {
        setSendError(signData.error || "Failed to sign transaction");
        setIsSending(false);
        return;
      }
      const signature = signData.signature;

      // 4. Submit verified transfer to server
      const transferRes = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          to_address: toAddress,
          amount: weiAmount,
          nonce,
          signature,
        }),
      });
      const transferData = await transferRes.json();
      if (!transferRes.ok || !transferData.success) {
        setSendError(transferData.error || "Transfer failed");
        setIsSending(false);
        return;
      }

      // Success
      try {
        tgApp?.HapticFeedback?.notificationOccurred("success");
      } catch {}

      onAddScore?.(-weiAmount);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setSubView("none");
        setSendRecipient("");
        setSendAmount("");
        setIsSending(false);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error during transfer";
      setSendError(msg);
      setIsSending(false);
    }
  };

  // ==============================================================
  // FULL PAGE SPA SUBVIEW: SEND / TRANSFER CURRENCY
  // ==============================================================
  if (subView === "send") {
    return (
      <div className="w-full max-w-xl mx-auto space-y-4 pt-1 pb-28 animate-fadeIn select-none font-sans text-slate-900">
        <div className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-2">
          <button
            type="button"
            onClick={() => setSubView("none")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={16} className="text-[#0098ea]" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={18} className="text-[#0098ea]" />
            <span className="text-sm font-black uppercase text-slate-900">
              ផ្ទេរប្រាក់ (Send Currency)
            </span>
          </div>
          <div className="w-14" />
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          {sendSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <Check size={36} className="text-[#16a34a] mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">Transfer Successful!</h4>
              <p className="text-xs text-emerald-800">
                Transaction verified and recorded to player audit ledger.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Currency Type (Primary: Riel)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSendCurrency("KHR")}
                    className={`py-3 rounded-full border text-xs font-bold transition-all duration-300 ease-out cursor-pointer flex items-center justify-center gap-1.5 ${
                      sendCurrency === "KHR"
                        ? "bg-[#0098ea] text-white border-[#0098ea] shadow-xs"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base font-black">៛</span>
                    <span>៛{khrValue}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendCurrency("USD")}
                    className={`py-3 rounded-full border text-xs font-bold transition-all duration-300 ease-out cursor-pointer flex items-center justify-center gap-1.5 ${
                      sendCurrency === "USD"
                        ? "bg-[#0098ea] text-white border-[#0098ea] shadow-xs"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base font-black">$</span>
                    <span>${usdValue}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Recipient (@telegram_username or Address)
                </label>
                <input
                  type="text"
                  required
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                  placeholder="@username or wei_0x..."
                  className="w-full px-4 py-3 rounded-full border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-[#0098ea]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Amount ({sendCurrency === "KHR" ? "៛" : "$"})
                </label>
                <input
                  type="number"
                  step={sendCurrency === "KHR" ? "100" : "0.01"}
                  required
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder={sendCurrency === "KHR" ? "41000" : "10.00"}
                  className="w-full px-4 py-3 rounded-full border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:border-[#0098ea]"
                />
              </div>

              {sendError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {sendError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 rounded-full bg-[#0098ea] hover:bg-[#0088cc] text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-300 ease-out disabled:opacity-50"
              >
                <Send size={18} />
                <span>{isSending ? "Verifying & Transferring..." : "Confirm Transfer"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==============================================================
  // FULL PAGE SPA SUBVIEW: SCAN QR
  // ==============================================================
  if (subView === "scan") {
    return (
      <div className="w-full max-w-xl mx-auto space-y-4 pt-1 pb-28 animate-fadeIn select-none font-sans text-slate-900">
        <div className="flex items-center justify-between py-2 border-b border-slate-200/80 mb-2">
          <button
            type="button"
            onClick={() => setSubView("none")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={16} className="text-[#0098ea]" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <ScanLine size={18} className="text-[#0098ea]" />
            <span className="text-sm font-black uppercase text-slate-900">
              ស្កេន QR (Scan QR)
            </span>
          </div>
          <div className="w-14" />
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 text-center">
          <div className="w-64 h-64 bg-slate-900 rounded-2xl mx-auto flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            <div className="w-44 h-44 border-2 border-[#0098ea] rounded-[24px] flex items-center justify-center relative">
              <div className="w-full h-0.5 bg-[#0098ea] animate-pulse" />
            </div>
            <span className="text-xs text-slate-300 font-mono mt-3">
              Align QR Code in frame
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Scan KHQR, Bakong, or SHILIAIWEI Web3 peer-to-peer addresses.
          </p>
        </div>
      </div>
    );
  }

  // ==============================================================
  // MAIN HOME VIEW (DEFAULT)
  // ==============================================================
  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100dvh-150px)] pb-28 select-none font-sans text-slate-900 max-w-xl mx-auto w-full px-1">
      <div className="w-full space-y-3.5 pt-1">
        {/* 1. DUAL KHMER & DOLLAR BANKNOTE CREDIT CARDS */}
        <BanknoteCreditCards
          score={score}
          showBalance={showBalances !== undefined ? showBalances : showLocalBalances}
          onToggleBalance={onToggleBalances || (() => {
            setShowLocalBalances(!showLocalBalances);
            tgApp?.HapticFeedback?.selectionChanged();
          })}
          user={user}
          tgApp={tgApp}
          onOpenDeposit={onGoToEarn}
          onOpenSend={() => setSubView("send")}
          onOpenSwap={onGoToSwap}
          onOpenScan={() => setSubView("scan")}
        />

        {/* 2. STATS 4-BLOCK BRAND CARDS (WEI COIN, US DOLLAR, TAP POWER, PLAY TIME) */}
        <BrandStatsQuadGrid
          score={score}
          spendSeconds={spendSeconds}
          tapPower={tapPower}
          showBalance={showBalances !== undefined ? showBalances : showLocalBalances}
        />

        {/* 3. SECURE TRANSFER & DOUBLE-ENTRY LEDGER PRODUCT */}
        <SecureTransferLedgerProduct
          score={score}
          user={user}
          tgApp={tgApp}
          onTransferSuccess={(amount) => {
            onAddScore?.(-amount);
          }}
          onOpenScan={() => setSubView("scan")}
        />

        {/* 4. Brand Footer for screen consistency */}
        <BrandFooter height={16} className="mt-4 pb-2" />
      </div>
    </div>
  );
});

TapGameView.displayName = "TapGameView";
