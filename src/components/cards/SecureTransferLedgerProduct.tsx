"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Copy,
  ShieldCheck,
  RefreshCw,
  Coins,
  QrCode,
  CircleCheck,
  Sparkles,
} from "@/components/icons/KeylineIcons";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";

interface SecureTransferLedgerProductProps {
  score: number;
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
  onTransferSuccess?: (amount: number, newBalance: number) => void;
  onOpenScan?: () => void;
}

interface LedgerHistoryItem {
  id: string;
  txHash: string;
  type: "DEBIT" | "CREDIT";
  entryType: "TRANSFER_OUT" | "TRANSFER_IN" | "INITIAL_GRANT" | "REWARD";
  counterparty: string;
  amount: number;
  nonce: number;
  status: "CONFIRMED";
  timestamp: string;
}

const WC_REGEX = /^WC[a-fA-F0-9]{40}$/;

export const SecureTransferLedgerProduct: React.FC<SecureTransferLedgerProductProps> = React.memo(({
  score,
  user,
  tgApp,
  onTransferSuccess,
}) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [currentNonce, setCurrentNonce] = useState<number>(0);
  const [myAddress, setMyAddress] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "DEBIT" | "CREDIT">("ALL");

  // Sample DEMO recipients for 1-tap testing
  const QUICK_RECIPIENTS = [
    { label: "Treasury Vault", address: "WC8888000011112222333344445555666677778888" },
    { label: "Liquidity Pool", address: "WCaabbccddeeff00112233445566778899aabbccdd" },
    { label: "Community Reserve", address: "WC1234567890abcdef1234567890abcdef12345678" },
  ];

  // Live transaction ledger entries
  const [history, setHistory] = useState<LedgerHistoryItem[]>([
    {
      id: "tx_init_01",
      txHash: "7b4e9f2a01d6c8b3e5a7f920485d1e2c3b4a5f60718293a4b5c6d7e8f9a0b1c2",
      type: "CREDIT",
      entryType: "INITIAL_GRANT",
      counterparty: "WC0000000000000000000000000000000000000000",
      amount: 1000,
      nonce: 0,
      status: "CONFIRMED",
      timestamp: "Just now",
    },
    {
      id: "tx_init_02",
      txHash: "9a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
      type: "CREDIT",
      entryType: "REWARD",
      counterparty: "WC8888000011112222333344445555666677778888",
      amount: 250,
      nonce: 1,
      status: "CONFIRMED",
      timestamp: "5m ago",
    },
  ]);

  // Fetch live nonce and address on mount
  const fetchWalletState = useCallback(async () => {
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : "";

      const res = await fetch(`/api/wallet/nonce?initData=${encodeURIComponent(initData)}`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.nonce === "number") {
          setCurrentNonce(data.nonce);
        }
        if (data.address) {
          setMyAddress(data.address);
        }
      }
    } catch {
      // Fallback local address derivation
      if (!myAddress) {
        const fallbackId = user?.id ? String(user.id) : "88888888";
        setMyAddress(`WC${fallbackId.padStart(8, "0")}${"a".repeat(32)}`);
      }
    }
  }, [user, myAddress]);

  useEffect(() => {
    fetchWalletState();
  }, [fetchWalletState]);

  const parsedAmount = parseInt(amount, 10);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0 && Number.isInteger(parsedAmount);
  const isValidRecipient = WC_REGEX.test(recipient.trim());
  const usdValue = isValidAmount ? (parsedAmount / 100).toFixed(2) : "0.00";
  const khrValue = isValidAmount ? (parsedAmount * 41).toLocaleString("en-US") : "0";

  const handleCopyMyAddress = () => {
    if (!myAddress) return;
    try {
      navigator.clipboard.writeText(myAddress);
      setCopiedAddress(true);
      tgApp?.HapticFeedback?.notificationOccurred?.("success");
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {}
  };

  const handleCopyHash = (hash: string) => {
    try {
      navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      tgApp?.HapticFeedback?.impactOccurred?.("light");
      setTimeout(() => setCopiedHash(null), 1500);
    } catch {}
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess(null);

    const cleanRecipient = recipient.trim();
    if (!WC_REGEX.test(cleanRecipient)) {
      setTransferError("Invalid recipient format. Must start with WC followed by 40 hex characters.");
      tgApp?.HapticFeedback?.notificationOccurred?.("error");
      return;
    }

    if (!isValidAmount) {
      setTransferError("Amount must be a whole positive integer of WEI COIN.");
      tgApp?.HapticFeedback?.notificationOccurred?.("error");
      return;
    }

    if (parsedAmount > score) {
      setTransferError(`Insufficient balance: available ${score} WEI COIN, required ${parsedAmount} WEI COIN.`);
      tgApp?.HapticFeedback?.notificationOccurred?.("error");
      return;
    }

    if (myAddress && cleanRecipient.toLowerCase() === myAddress.toLowerCase()) {
      setTransferError("Self-transfers to your own address are prohibited.");
      tgApp?.HapticFeedback?.notificationOccurred?.("error");
      return;
    }

    setIsProcessing(true);

    try {
      tgApp?.HapticFeedback?.impactOccurred?.("medium");
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : "";

      // 1. Request cryptographic signature from server vault
      const signRes = await fetch("/api/wallet/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          to_address: cleanRecipient,
          amount: parsedAmount,
          nonce: currentNonce,
        }),
      });

      const signData = await signRes.json();
      if (!signRes.ok || !signData.signature) {
        throw new Error(signData.error || "Failed to generate secp256k1 transaction signature");
      }

      // 2. Submit atomic transfer to /api/transfer
      const transferRes = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          to_address: cleanRecipient,
          amount: parsedAmount,
          nonce: currentNonce,
          signature: signData.signature,
        }),
      });

      const transferData = await transferRes.json();
      if (!transferRes.ok || !transferData.success) {
        throw new Error(transferData.error || "Transfer failed");
      }

      // 3. Update local history and state
      const tx = transferData.transaction;
      const newHistoryItem: LedgerHistoryItem = {
        id: tx.id || `tx_${Date.now()}`,
        txHash: tx.txHash,
        type: "DEBIT",
        entryType: "TRANSFER_OUT",
        counterparty: cleanRecipient,
        amount: parsedAmount,
        nonce: currentNonce,
        status: "CONFIRMED",
        timestamp: "Just now",
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
      setCurrentNonce((prev) => prev + 1);
      setTransferSuccess(`Transferred ${parsedAmount} WEI COIN successfully. TX: ${tx.txHash.slice(0, 16)}...`);
      setAmount("");
      setRecipient("");

      tgApp?.HapticFeedback?.notificationOccurred?.("success");

      if (onTransferSuccess) {
        onTransferSuccess(parsedAmount, tx.newSenderBalance ?? (score - parsedAmount));
      }
    } catch (err: any) {
      setTransferError(err?.message || "Transfer transaction failed");
      tgApp?.HapticFeedback?.notificationOccurred?.("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filterType === "ALL") return true;
    return item.type === filterType;
  });

  return (
    <div className="w-full space-y-4 select-none my-3">
      {/* 1. MAIN INTERACTIVE SECURE TRANSFER CARD */}
      <div className="relative w-full rounded-[26px] p-5 sm:p-6 overflow-hidden bg-white border border-slate-200/90 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.08)]">
        {/* Top Header & Security Badges */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0098ea] to-[#0077c2] flex items-center justify-center text-white shadow-sm">
              <Send size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Secure Transfer (ផ្ទេរប្រាក់សុវត្ថិភាព)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                secp256k1 Cryptographic Signatures • Double-Entry Ledger
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Nonce #{currentNonce} Protected</span>
          </div>
        </div>

        {/* Sender Vault Address Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Coins size={16} className="text-[#0098ea] shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                My Vault Address (Sender)
              </div>
              <div className="text-xs font-mono font-bold text-slate-800 truncate">
                {myAddress || "Loading address..."}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyMyAddress}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all text-xs font-bold cursor-pointer"
          >
            {copiedAddress ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleExecuteTransfer} className="space-y-3.5">
          {/* Recipient Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Recipient Address (អាសយដ្ឋានទទួល)
              </label>
              {recipient.trim() && (
                <span className={`text-[11px] font-bold ${isValidRecipient ? "text-emerald-600" : "text-amber-600"}`}>
                  {isValidRecipient ? "Valid WC Standard" : "Invalid Format"}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="WC..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0098ea]/20 focus:border-[#0098ea] transition-all"
                disabled={isProcessing}
              />
            </div>
            {/* Quick Demo Recipient Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Fill:</span>
              {QUICK_RECIPIENTS.map((rec) => (
                <button
                  key={rec.label}
                  type="button"
                  onClick={() => setRecipient(rec.address)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-[11px] font-medium text-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  {rec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Transfer Amount (ចំនួនទឹកប្រាក់)
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                Available: <strong className="text-slate-900 font-mono">{score}</strong> WEI COIN
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in WEI COIN"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0098ea]/20 focus:border-[#0098ea] transition-all"
                disabled={isProcessing}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#0098ea]">
                WEI COIN
              </span>
            </div>

            {/* Quick Amount Chips & Conversion */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                {[100, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 active:scale-95 transition-all cursor-pointer"
                  >
                    +{val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(String(score))}
                  className="px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[11px] font-bold text-purple-700 active:scale-95 transition-all cursor-pointer"
                >
                  Max
                </button>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                ≈ ${usdValue} USD • {khrValue} KHR
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {transferError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-fadeIn">
              {transferError}
            </div>
          )}
          {transferSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CircleCheck size={16} className="text-emerald-600 shrink-0" />
              <span>{transferSuccess}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isProcessing || !isValidAmount || !isValidRecipient}
            className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-all cursor-pointer ${
              isProcessing || !isValidAmount || !isValidRecipient
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-[#0098ea] via-[#0087d1] to-[#0070ad] text-white hover:brightness-105 active:scale-[0.99] shadow-[#0098ea]/20"
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Verifying & Executing Transfer...</span>
              </>
            ) : (
              <>
                <ArrowUpRight size={18} className="text-white" />
                <span>Confirm & Transfer WEI COIN</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 2. REALTIME DOUBLE-ENTRY LEDGER TRANSACTIONS CARD */}
      <div className="relative w-full rounded-[26px] p-5 sm:p-6 overflow-hidden bg-white border border-slate-200/90 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Double-Entry Ledger (កំណត់ត្រាប្រតិបត្តិការ)
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(["ALL", "DEBIT", "CREDIT"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterType(mode)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === mode
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {mode === "ALL" ? "All" : mode === "DEBIT" ? "Debits" : "Credits"}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Entries List */}
        <div className="space-y-2.5">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-medium">
              No ledger transactions recorded in this view.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === "DEBIT"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.type === "DEBIT" ? (
                      <ArrowUpRight size={18} />
                    ) : (
                      <ArrowDownLeft size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {item.entryType}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Nonce #{item.nonce}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono truncate">
                      <span>Counterparty:</span>
                      <span className="truncate">{item.counterparty.slice(0, 10)}...{item.counterparty.slice(-6)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-black font-mono ${
                      item.type === "DEBIT" ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {item.type === "DEBIT" ? "-" : "+"}
                    {item.amount.toLocaleString()} WEI
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(item.txHash)}
                    className="text-[10px] text-slate-400 hover:text-slate-700 font-mono transition-colors cursor-pointer"
                    title="Copy full transaction hash"
                  >
                    {copiedHash === item.txHash ? (
                      <span className="text-emerald-600 font-bold">Copied TX</span>
                    ) : (
                      <span>TX: {item.txHash.slice(0, 8)}...</span>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

SecureTransferLedgerProduct.displayName = "SecureTransferLedgerProduct";
