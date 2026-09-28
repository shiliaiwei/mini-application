"use client";

import React from "react";

interface DevModeToolbarProps {
  isGateActive: boolean;
  onToggleGate: () => void;
}

export const DevModeToolbar: React.FC<DevModeToolbarProps> = ({
  isGateActive,
  onToggleGate,
}) => {
  return (
    <aside
      aria-label="Developer Mode Toolbar"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 bg-slate-900/95 text-white border border-slate-700/80 px-3.5 py-2 rounded-full shadow-xl text-xs backdrop-blur-md select-none"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="font-mono text-slate-300 font-semibold tracking-wide">
        DEV MODE
      </span>
      <span className="text-slate-600">|</span>
      <button
        type="button"
        onClick={onToggleGate}
        className={`px-3 py-1 rounded-full font-bold transition-all active:scale-95 cursor-pointer shadow-xs ${
          isGateActive
            ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
            : "bg-[#0098ea] hover:bg-[#0086cf] text-white"
        }`}
      >
        {isGateActive ? "Exit Gate Preview" : "Preview 403 Gate"}
      </button>
    </aside>
  );
};
