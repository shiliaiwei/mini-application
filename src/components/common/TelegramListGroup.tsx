"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export interface TelegramListItemProps {
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
}

export const TelegramListItem: React.FC<TelegramListItemProps> = ({
  icon,
  iconBgClass,
  title,
  subtitle,
  badge,
  showChevron = true,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center justify-between p-3.5 text-left transition-colors telegram-list-item ${
        onClick ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {/* Left: Squircle Icon & Title (matches Image 2) */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-md ${iconBgClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate tracking-tight">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-slate-400 truncate mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right: Badge & Chevron */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge}
        {showChevron && (
          <ChevronRight className="w-4 h-4 text-slate-400 opacity-70" />
        )}
      </div>
    </button>
  );
};

interface TelegramListGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const TelegramListGroup: React.FC<TelegramListGroupProps> = ({
  title,
  children,
  className = "",
}) => {
  // Convert children into array to insert dividers
  const items = React.Children.toArray(children);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {title && (
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
          {title}
        </h4>
      )}

      {/* Liquid Glass Grouped Box (matches rounded containers in Image 2 & 3) */}
      <div className="liquid-glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
        {items}
      </div>
    </div>
  );
};
