"use client";

import React from "react";
import { TelegramUser } from "@/types/telegram";

export interface LeaderboardViewProps {
  userScore?: number;
  userSpendSeconds?: number;
  user?: TelegramUser | null;
  userRank?: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = () => {
  return <div className="w-full max-w-xl mx-auto min-h-[40vh]" />;
};
