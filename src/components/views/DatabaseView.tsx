"use client";

import React, { useState, useEffect } from "react";
import { TelegramListGroup, TelegramListItem } from "@/components/common/TelegramListGroup";
import {
  Database,
  Server,
  Activity,
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Cpu,
} from "lucide-react";

interface DatabaseViewProps {
  onTriggerHaptic: (style: "light" | "medium" | "heavy") => void;
}

interface DbStatusData {
  connected: boolean;
  latencyMs?: number;
  serverTime?: string;
  pgVersion?: string;
  projectName?: string;
  region?: string;
  host?: string;
  database?: string;
  tablesCount?: number;
  tables?: string[];
  error?: string;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ onTriggerHaptic }) => {
  const [dbData, setDbData] = useState<DbStatusData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDbStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/database/status");
      const data = await res.json();
      setDbData(data);
    } catch (e) {
      setDbData({
        connected: false,
        error: String(e),
        projectName: "WEB_kesararamwithdigital",
        host: "eastus2.azure.neon.tech",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleTestPing = () => {
    onTriggerHaptic("medium");
    fetchDbStatus();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Database Overview Card */}
      <div className="liquid-glass-card rounded-2xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl squircle-sky flex items-center justify-center text-white shadow-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Neon PostgreSQL
              </h2>
              <p className="text-xs text-slate-400">
                {dbData?.projectName || "WEB_kesararamwithdigital"}
              </p>
            </div>
          </div>

          {/* Live Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            {dbData?.connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ONLINE</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>SYNCING</span>
              </>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
            <span className="text-slate-400 block text-[11px] mb-1">LATENCY</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              {dbData?.latencyMs ? `${dbData.latencyMs} ms` : "Checking..."}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
            <span className="text-slate-400 block text-[11px] mb-1">REGION</span>
            <span className="text-sky-300 font-mono font-semibold truncate block">
              {dbData?.region || "azure-eastus2"}
            </span>
          </div>
        </div>

        {/* Live Ping Button */}
        <button
          type="button"
          onClick={handleTestPing}
          disabled={loading}
          className="mt-3 w-full py-2.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 active:scale-98 border border-sky-400/40 text-sky-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Pinging Neon Serverless..." : "Test Real-time Database Ping"}
        </button>
      </div>

      {/* Telemetry Grouped List (matches Image 2 style) */}
      <TelegramListGroup title="Database Architecture">
        <TelegramListItem
          icon={<Server className="w-5 h-5" />}
          iconBgClass="squircle-blue"
          title="Server Engine"
          subtitle={dbData?.pgVersion || "PostgreSQL 17 (Serverless)"}
        />

        <TelegramListItem
          icon={<Globe className="w-5 h-5" />}
          iconBgClass="squircle-purple"
          title="Host & Endpoint"
          subtitle="ep-tiny-water-a8u6wsj2-pooler.eastus2.azure.neon.tech"
        />

        <TelegramListItem
          icon={<Cpu className="w-5 h-5" />}
          iconBgClass="squircle-cyan"
          title="Autoscaling Compute"
          subtitle="k8s-neonvm (0.25 - 2.0 CU Autoscaling)"
        />

        <TelegramListItem
          icon={<Layers className="w-5 h-5" />}
          iconBgClass="squircle-green"
          title="Database Tables"
          subtitle={
            dbData?.tablesCount !== undefined
              ? `${dbData.tablesCount} Public Tables Detected`
              : "Scanning tables..."
          }
          badge={
            <span className="text-xs font-mono font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded">
              {dbData?.tablesCount || 0}
            </span>
          }
        />
      </TelegramListGroup>

      {/* Connection Security */}
      <TelegramListGroup title="Security & Authentication">
        <TelegramListItem
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgClass="squircle-green"
          title="SSL / TLS Encryption"
          subtitle="SSL Mode: require (Channel binding active)"
          showChevron={false}
        />
      </TelegramListGroup>
    </div>
  );
};
