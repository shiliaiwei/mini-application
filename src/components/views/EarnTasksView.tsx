"use client";

import React from "react";
import { TelegramUser, TelegramWebApp } from "@/types/telegram";

export interface EarnTasksViewProps {
  score?: number;
  onAddScore?: (amount: number) => void;
  tapPower?: number;
  onUpgradeTapPower?: () => void;
  passiveRate?: number;
  onUpgradePassiveRate?: () => void;
  user?: TelegramUser | null;
  tgApp?: TelegramWebApp | null;
}

export const EarnTasksView: React.FC<EarnTasksViewProps> = () => {
  return <div className="w-full max-w-xl mx-auto min-h-[40vh]" />;
};
