"use client";

import React, { useState } from "react";
import { TelegramListGroup, TelegramListItem } from "@/components/common/TelegramListGroup";
import { TelegramWebApp } from "@/types/telegram";
import {
  Sliders,
  Bell,
  Sparkles,
  CreditCard,
  Cloud,
  HelpCircle,
  Info,
  LogOut,
  Vibrate,
  Shield,
  Palette,
} from "lucide-react";

interface SettingsViewProps {
  tgApp: TelegramWebApp | null;
  onTriggerHaptic: (style: "light" | "medium" | "heavy") => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  tgApp,
  onTriggerHaptic,
}) => {
  const [hapticMode, setHapticMode] = useState<"light" | "medium" | "heavy">("medium");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const cycleHaptic = () => {
    const nextMode =
      hapticMode === "light" ? "medium" : hapticMode === "medium" ? "heavy" : "light";
    setHapticMode(nextMode);
    onTriggerHaptic(nextMode);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    onTriggerHaptic("light");
  };

  const handleCloseMiniApp = () => {
    onTriggerHaptic("medium");
    try {
      tgApp?.close();
    } catch {}
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Section 1: App Settings (matches Image 2 middle group) */}
      <TelegramListGroup title="App Settings">
        <TelegramListItem
          icon={<Sliders className="w-5 h-5" />}
          iconBgClass="squircle-sky"
          title="App settings"
          subtitle="Configure Mini App behavior & theme"
          onClick={() => onTriggerHaptic("light")}
        />

        <TelegramListItem
          icon={<Bell className="w-5 h-5" />}
          iconBgClass="squircle-red"
          title="Bot notifications"
          subtitle="Direct push alerts from @srievibot"
          badge={
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                notificationsEnabled
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {notificationsEnabled ? "ON" : "OFF"}
            </span>
          }
          onClick={toggleNotifications}
        />

        <TelegramListItem
          icon={<Vibrate className="w-5 h-5" />}
          iconBgClass="squircle-purple"
          title="Haptic feedback"
          subtitle={`Current intensity: ${hapticMode.toUpperCase()}`}
          badge={
            <span className="text-xs font-mono font-bold text-sky-400 uppercase bg-white/5 px-2 py-0.5 rounded">
              {hapticMode}
            </span>
          }
          onClick={cycleHaptic}
        />
      </TelegramListGroup>

      {/* Section 2: Monetization (matches Image 3) */}
      <TelegramListGroup title="Monetization">
        <TelegramListItem
          icon={<Sparkles className="w-5 h-5" />}
          iconBgClass="squircle-amber"
          title="Telegram Stars"
          subtitle="Digital in-app purchases & gifts"
          badge={
            <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
              SUPPORTED
            </span>
          }
          onClick={() => onTriggerHaptic("light")}
        />

        <TelegramListItem
          icon={<CreditCard className="w-5 h-5" />}
          iconBgClass="squircle-green"
          title="Payments"
          subtitle="Telegram Native Checkout & Wallets"
          onClick={() => onTriggerHaptic("light")}
        />
      </TelegramListGroup>

      {/* Section 3: Serverless & Infrastructure (matches Image 3) */}
      <TelegramListGroup title="Cloud Infrastructure">
        <TelegramListItem
          icon={<Cloud className="w-5 h-5" />}
          iconBgClass="squircle-blue"
          title="Serverless Engine"
          subtitle="Next.js 16 + Neon Autoscaling DB"
          badge={
            <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-md shadow-sm">
              NEW
            </span>
          }
          onClick={() => onTriggerHaptic("light")}
        />

        <TelegramListItem
          icon={<Shield className="w-5 h-5" />}
          iconBgClass="squircle-indigo"
          title="Telegram HMAC Security"
          subtitle="Cryptographically verified initData"
          showChevron={false}
        />
      </TelegramListGroup>

      {/* Section 4: Support & About (matches Image 2 bottom group) */}
      <TelegramListGroup title="Support & About">
        <TelegramListItem
          icon={<HelpCircle className="w-5 h-5" />}
          iconBgClass="squircle-orange"
          title="Help"
          subtitle="Frequently asked questions & docs"
          onClick={() => onTriggerHaptic("light")}
        />

        <TelegramListItem
          icon={<Info className="w-5 h-5" />}
          iconBgClass="squircle-blue"
          title="About"
          subtitle="Version 2.0 (Telegram WebApp 8.0+)"
          onClick={() => onTriggerHaptic("light")}
        />

        <TelegramListItem
          icon={<LogOut className="w-5 h-5" />}
          iconBgClass="squircle-red"
          title="Close Mini App"
          subtitle="Exit back to Telegram chat"
          onClick={handleCloseMiniApp}
        />
      </TelegramListGroup>
    </div>
  );
};
