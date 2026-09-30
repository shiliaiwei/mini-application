"use client";

import React, { useState, useCallback } from "react";
import { Send } from "@/components/icons/KeylineIcons";
import { flash, WC_ADDRESS_REGEX, type FlashMsg } from "./weiWalletUtils";
import { InlineMsg } from "./weiWalletHooks";
import type { TelegramWebApp } from "@/types/telegram";

interface WeiSendPanelProps {
  address:         string | null;
  weiBalance:      number;
  initData:        string;
  tgApp:           TelegramWebApp | null;
  onBalanceUpdate: (n: number) => void;
}

/**
 * WeiSendPanel — send WEI to a WC address.
 * Fetches nonce → server-signs → executes transfer atomically.
 */
export function WeiSendPanel({
  address,
  weiBalance,
  initData,
  tgApp,
  onBalanceUpdate,
}: WeiSendPanelProps) {
  const [sendTo,   setSendTo]   = useState("");
  const [sendAmt,  setSendAmt]  = useState("");
  const [msg,      setMsg]      = useState<FlashMsg>(null);
  const [sending,  setSending]  = useState(false);

  const handleSend = useCallback(async () => {
    if (sending) return;
    setMsg(null);
    const amt = parseInt(sendAmt, 10);

    if (!WC_ADDRESS_REGEX.test(sendTo)) {
      flash(setMsg, false, "Invalid WC address"); return;
    }
    if (!amt || amt <= 0) { flash(setMsg, false, "Enter a valid amount"); return; }
    if (amt > weiBalance) { flash(setMsg, false, "Insufficient WEI balance"); return; }

    setSending(true);
    try { tgApp?.HapticFeedback?.impactOccurred("light"); } catch {}

    try {
      // 1. Fetch nonce
      const nRes = await fetch(
        `/api/wallet/nonce?address=${encodeURIComponent(address!)}`
      );
      const { nonce } = await nRes.json();

      // 2. Server-side sign
      const sRes = await fetch("/api/wallet/sign", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ initData, to_address: sendTo, amount: amt, nonce }),
      });
      const sData = await sRes.json();
      if (!sData.signature) {
        flash(setMsg, false, sData.error || "Signing failed"); return;
      }

      // 3. Execute transfer
      const tRes = await fetch("/api/wallet/transfer", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
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
        try { tgApp?.HapticFeedback?.notificationOccurred("success"); } catch {}
        onBalanceUpdate(tData.newSenderBalance ?? weiBalance - amt);
        flash(setMsg, true, `Sent ${amt.toLocaleString()} WEI`);
        setSendTo("");
        setSendAmt("");
      } else {
        flash(setMsg, false, tData.error || "Transfer failed");
      }
    } catch {
      flash(setMsg, false, "Network error");
    } finally {
      setSending(false);
    }
  }, [sending, sendTo, sendAmt, address, weiBalance, initData, tgApp, onBalanceUpdate]);

  return (
    <div className="bg-white rounded-[22px] border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-1.5">
        <Send size={14} className="text-[#0098ea]" />
        <span className="text-xs font-black uppercase text-slate-800">Send WEI</span>
      </div>

      <InlineMsg state={msg} />

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
  );
}
