"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Send,
  ArrowUpRight,
  Check,
  Copy,
  ShieldCheck,
  RefreshCw,
  Coins,
  CircleCheck,
} from "@/components/icons/KeylineIcons";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";

interface SecureTransferLedgerProductProps {
  score: number;
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
  onTransferSuccess?: (amount: number, newBalance: number) => void;
  onOpenScan?: () => void;
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

  // Sample quick recipients
  const QUICK_RECIPIENTS = [
    { label: "Treasury Vault", address: "WC8888000011112222333344445555666677778888" },
    { label: "Liquidity Pool", address: "WCaabbccddeeff00112233445566778899aabbccdd" },
    { label: "Community Reserve", address: "WC1234567890abcdef1234567890abcdef12345678" },
  ];

  // Fetch live nonce and address on mount & user change
  const fetchWalletState = useCallback(async () => {
    try {
      const initData = typeof window !== "undefined" && window.Telegram?.WebApp?.initData
        ? window.Telegram.WebApp.initData
        : "";
      const userParam = user?.id ? `&telegram_id=${user.id}` : "";

      const res = await fetch(`/api/wallet/nonce?initData=${encodeURIComponent(initData)}${userParam}`);
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
  }, [user?.id]);

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
          telegram_id: user?.id,
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
          telegram_id: user?.id,
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

      // 3. Update local state
      const tx = transferData.transaction;
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

  return (
    <div className="w-full space-y-4 select-none my-2 font-sans">
      {/* ============================================================== */}
      {/* SKEUOMORPHIC PURPLE LEATHER SECURE TRANSFER CARD               */}
      {/* ============================================================== */}
      <div
        className="relative w-full rounded-[26px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#6420a7] via-[#4e1688] to-[#340b5c] text-white"
        style={{
          boxShadow:
            "0 20px 42px -10px rgba(45, 10, 80, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Guilloche Banknote Security Background */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
          style={{
            backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover",
            filter: "contrast(1.35) brightness(1.1)",
          }}
        />

        {/* Simulated Thread Perimeter Stitching */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="6"
            y="6"
            width="calc(100% - 12px)"
            height="calc(100% - 12px)"
            rx="20"
            ry="20"
            fill="none"
            stroke="#e9d5ff"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            opacity="0.45"
            style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
          />
        </svg>

        {/* Top Specular Rim */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

        {/* Header: Title and Nonce Security Shield */}
        <div className="relative z-10 flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0098ea] via-[#0088cc] to-[#005f99] border border-cyan-300/40 flex items-center justify-center text-white"
              style={{
                boxShadow:
                  "0 4px 12px rgba(0, 152, 234, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
              }}
            >
              <Send size={19} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight drop-shadow-sm">
                Secure Transfer (ផ្ទេរប្រាក់សុវត្ថិភាព)
              </h3>
              <p className="text-xs text-purple-200/80 font-medium">
                secp256k1 Cryptographic Signatures • Double-Entry Ledger
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/35 text-emerald-200 text-[11px] font-bold shadow-xs">
            <ShieldCheck size={14} className="text-emerald-300" />
            <span>Nonce #{currentNonce} Protected</span>
          </div>
        </div>

        {/* Sender Vault Address Leather Inset */}
        <div className="relative z-10 mb-4 p-3 rounded-2xl bg-black/25 border border-purple-300/20 flex items-center justify-between gap-2 backdrop-blur-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Coins size={16} className="text-cyan-300 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-purple-200/70 tracking-wider">
                My Vault Address (Sender)
              </div>
              <div className="text-xs font-mono font-bold text-white truncate">
                {myAddress || "Loading address..."}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyMyAddress}
            className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white active:scale-95 transition-all text-xs font-bold cursor-pointer shadow-xs"
          >
            {copiedAddress ? (
              <>
                <Check size={13} className="text-emerald-300" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-purple-200" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleExecuteTransfer} className="relative z-10 space-y-3.5">
          {/* Recipient Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-100 uppercase tracking-wide">
                Recipient Address (អាសយដ្ឋានទទួល)
              </label>
              {recipient.trim() && (
                <span className={`text-[11px] font-bold ${isValidRecipient ? "text-emerald-300" : "text-amber-300"}`}>
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
                className="w-full h-11 px-3.5 rounded-xl bg-black/30 border border-purple-300/30 text-white placeholder-purple-300/40 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-300 transition-all"
                disabled={isProcessing}
              />
            </div>
            {/* Quick Demo Recipient Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-purple-200/70 font-bold uppercase">Quick Fill:</span>
              {QUICK_RECIPIENTS.map((rec) => (
                <button
                  key={rec.label}
                  type="button"
                  onClick={() => setRecipient(rec.address)}
                  className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-[11px] font-medium text-purple-100 active:scale-95 transition-all cursor-pointer"
                >
                  {rec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-100 uppercase tracking-wide">
                Transfer Amount (ចំនួនទឹកប្រាក់)
              </label>
              <span className="text-[11px] font-bold text-purple-200/80">
                Available: <strong className="text-white font-mono">{score}</strong> WEI COIN
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
                className="w-full h-11 px-3.5 rounded-xl bg-black/30 border border-purple-300/30 text-white placeholder-purple-300/40 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-300 transition-all"
                disabled={isProcessing}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-cyan-300">
                WEI COIN
              </span>
            </div>

            {/* Quick Amount Chips & Conversion */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                {[100, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-[11px] font-bold text-white active:scale-95 transition-all cursor-pointer"
                  >
                    +{val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(String(score))}
                  className="px-2.5 py-0.5 rounded-lg bg-purple-400/30 hover:bg-purple-400/40 border border-purple-300/40 text-[11px] font-bold text-purple-100 active:scale-95 transition-all cursor-pointer"
                >
                  Max
                </button>
              </div>
              <div className="text-[11px] text-purple-200/80 font-medium">
                ≈ ${usdValue} USD • {khrValue} KHR
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {transferError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs font-semibold text-rose-200 animate-fadeIn">
              {transferError}
            </div>
          )}
          {transferSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs font-semibold text-emerald-200 flex items-center gap-2 animate-fadeIn">
              <CircleCheck size={16} className="text-emerald-300 shrink-0" />
              <span>{transferSuccess}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isProcessing || !isValidAmount || !isValidRecipient}
            className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-all cursor-pointer ${
              isProcessing || !isValidAmount || !isValidRecipient
                ? "bg-white/10 border border-white/15 text-white/40 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-[#0098ea] via-[#0088cc] to-[#0066aa] text-white hover:brightness-110 active:scale-[0.99] border border-cyan-300/40 shadow-[0_8px_20px_-3px_rgba(0,152,234,0.5)]"
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
    </div>
  );
});

SecureTransferLedgerProduct.displayName = "SecureTransferLedgerProduct";
