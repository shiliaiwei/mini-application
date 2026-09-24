"use client";

import React from "react";
import {
  Wallet,
  Trophy,
  Gift,
  Repeat,
  User,
  Search,
  Headphones,
  Check,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Coins,
  Zap,
  Star,
  Flame,
  Shield,
  ShieldCheck,
  Sparkles,
  Send,
  Eye,
  EyeOff,
  Bell,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  QrCode,
  Scan,
  ScanLine,
  Copy,
  Timer,
  TrendingUp,
  RefreshCw,
  Grid2x2,
  Crown,
  CirclePlay,
  Play,
  Award,
  CircleAlert,
  Info,
} from "@keyline-icons/react/two-tone";

export interface KeylineIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Keyline Two-Tone Rounded Gamepad on strict 24x24 grid
 */
export const KeylineGamepad: React.FC<KeylineIconProps> = ({
  size = 24,
  className = "",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Keyline Two-tone soft fill layer */}
    <path
      d="M6 11h12c2.2 0 4 1.8 4 4v1c0 2.2-1.8 4-4 4-1.2 0-2.3-.5-3.1-1.4L13.5 17h-3l-1.4 1.6C8.3 19.5 7.2 20 6 20c-2.2 0-4-1.8-4-4v-1c0-2.2 1.8-4 4-4z"
      fill="currentColor"
      fillOpacity="0.35"
      stroke="none"
    />
    {/* Keyline Primary Stroke layer */}
    <path
      d="M6 7h12c2.2 0 4 1.8 4 4v1c0 2.2-1.8 4-4 4-1.2 0-2.3-.5-3.1-1.4L13.5 13h-3l-1.4 1.6C8.3 15.5 7.2 16 6 16c-2.2 0-4-1.8-4-4v-1c0-2.2 1.8-4 4-4z"
      fill="none"
    />
    {/* D-Pad */}
    <path d="M7 10v3M5.5 11.5h3" fill="none" />
    {/* Action Buttons */}
    <circle cx="16" cy="11" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Keyline Two-Tone Rounded ArrowUpDown (Swap / Exchange)
 */
export const KeylineArrowUpDown: React.FC<KeylineIconProps> = ({
  size = 24,
  className = "",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path
      d="M7 4v16M7 4L3 8M7 4l4 4"
      fill="currentColor"
      fillOpacity="0.35"
      stroke="none"
    />
    <path d="M7 4v16M7 4L3 8M7 4l4 4M17 20V4M17 20l4-4M17 20l-4-4" fill="none" />
  </svg>
);

export {
  Wallet,
  Trophy,
  Gift,
  Repeat,
  User,
  Search,
  Headphones,
  Check,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Coins,
  Zap,
  Star,
  Flame,
  Shield,
  ShieldCheck,
  Sparkles,
  Send,
  Eye,
  EyeOff,
  Bell,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  QrCode,
  Scan,
  ScanLine,
  Copy,
  Timer,
  TrendingUp,
  RefreshCw,
  Grid2x2,
  Crown,
  CirclePlay,
  Play,
  Award,
  CircleAlert,
  Info,
};
