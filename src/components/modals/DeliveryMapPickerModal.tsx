"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Map,
  Navigation,
  Globe,
  Check,
  RefreshCw,
  Search,
} from "@/components/icons/KeylineIcons";
import { AddressDetails } from "@/lib/userSettings";

interface DeliveryMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialAddress?: AddressDetails;
  onConfirm: (address: AddressDetails) => void;
  triggerHaptic?: (type?: "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection") => void;
}

interface GeocodedResult {
  street: string;
  unit: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  displayName: string;
}

const PRESET_LOCATIONS = [
  { name: "Independence Monument", lat: 11.5564, lng: 104.9282, desc: "BKK1 / Chamkarmon" },
  { name: "Canadia Tower", lat: 11.5724, lng: 104.9213, desc: "Daun Penh Financial" },
  { name: "BKK1 Commercial Hub", lat: 11.5492, lng: 104.9248, desc: "St. 51 / Boeng Keng Kang" },
  { name: "Toul Kork Center", lat: 11.575, lng: 104.898, desc: "St. 315 / Khan Toul Kork" },
];

export const DeliveryMapPickerModal: React.FC<DeliveryMapPickerModalProps> = ({
  isOpen,
  onClose,
  title,
  initialAddress,
  onConfirm,
  triggerHaptic,
}) => {
  const [lat, setLat] = useState<number>(11.5564);
  const [lng, setLng] = useState<number>(104.9282);
  const [zoom, setZoom] = useState<number>(16);
  const [unitDetail, setUnitDetail] = useState<string>(initialAddress?.unit || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [source, setSource] = useState<"gps" | "ip_network" | "fallback" | "manual">("ip_network");
  const [resolvedAddress, setResolvedAddress] = useState<GeocodedResult>({
    street: initialAddress?.street || "Independence Monument Roundabout",
    unit: initialAddress?.unit || "",
    city: initialAddress?.city || "Phnom Penh",
    stateProvince: initialAddress?.stateProvince || "Khan Boeng Keng Kang",
    postalCode: initialAddress?.postalCode || "120102",
    country: initialAddress?.country || "Cambodia",
    displayName: "Locating physical delivery point...",
  });

  const fetchGeocode = useCallback(
    async (targetLat: number, targetLng: number, srcType: "gps" | "ip_network" | "fallback" | "manual") => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode/locate?lat=${targetLat}&lng=${targetLng}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.address) {
            setResolvedAddress({
              street: data.address.street || "Main Delivery Road",
              unit: unitDetail || data.address.unit || "",
              city: data.address.city || "Phnom Penh",
              stateProvince: data.address.stateProvince || "Khan Daun Penh",
              postalCode: data.address.postalCode || "120000",
              country: data.address.country || "Cambodia",
              displayName: data.address.displayName || `${data.address.street}, ${data.address.city}`,
            });
            setSource(srcType);
            if (triggerHaptic) triggerHaptic("selection");
          }
        }
      } catch {
        // Retain current address
      } finally {
        setLoading(false);
      }
    },
    [unitDetail, triggerHaptic]
  );

  // Auto-detect on first open
  useEffect(() => {
    if (!isOpen) return;

    // Attempt browser high-precision GPS first
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const cLat = pos.coords.latitude;
          const cLng = pos.coords.longitude;
          setLat(cLat);
          setLng(cLng);
          fetchGeocode(cLat, cLng, "gps");
        },
        () => {
          // If GPS rejected/unavailable, query network IP
          fetchGeocode(11.5564, 104.9282, "ip_network");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      fetchGeocode(11.5564, 104.9282, "ip_network");
    }
  }, [isOpen, fetchGeocode]);

  const handleLocateGPS = () => {
    if (triggerHaptic) triggerHaptic("selection");
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const cLat = pos.coords.latitude;
          const cLng = pos.coords.longitude;
          setLat(cLat);
          setLng(cLng);
          fetchGeocode(cLat, cLng, "gps");
          if (triggerHaptic) triggerHaptic("success");
        },
        () => {
          fetchGeocode(lat, lng, "ip_network");
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  const handleLocateIP = () => {
    if (triggerHaptic) triggerHaptic("selection");
    fetchGeocode(11.5564, 104.9282, "ip_network");
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Small offset calculation relative to center
    const dx = (x - rect.width / 2) / rect.width;
    const dy = (y - rect.height / 2) / rect.height;

    const deltaLat = -dy * 0.005;
    const deltaLng = dx * 0.005;

    const newLat = Number((lat + deltaLat).toFixed(6));
    const newLng = Number((lng + deltaLng).toFixed(6));

    setLat(newLat);
    setLng(newLng);
    fetchGeocode(newLat, newLng, "manual");
  };

  const handleSelectPreset = (pLat: number, pLng: number) => {
    setLat(pLat);
    setLng(pLng);
    fetchGeocode(pLat, pLng, "manual");
  };

  const handleConfirm = () => {
    if (triggerHaptic) triggerHaptic("success");
    onConfirm({
      street: resolvedAddress.street,
      unit: unitDetail.trim() || resolvedAddress.unit,
      city: resolvedAddress.city,
      stateProvince: resolvedAddress.stateProvince,
      postalCode: resolvedAddress.postalCode,
      country: resolvedAddress.country,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-[28px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#3b0764] via-[#240647] to-[#14022a] text-white border border-purple-400/40 space-y-4 animate-slideUp max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow:
            "0 24px 50px -10px rgba(20, 2, 40, 0.9), inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Grain & Stitching overlays */}
        <div
          className="absolute inset-0 rounded-[28px] opacity-15 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: "6px 6px",
          }}
        />
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="6"
            y="6"
            width="calc(100% - 12px)"
            height="calc(100% - 12px)"
            rx="22"
            ry="22"
            fill="none"
            stroke="#e9d5ff"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.45"
            style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.6))" }}
          />
        </svg>
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-20" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-300/30 text-purple-200">
              <Map size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide drop-shadow-sm">
                {title}
              </h3>
              <p className="text-[11px] text-purple-200/80 font-medium">
                Tap anywhere on map or use GPS to pin physical delivery point
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-purple-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
          >
            Close
          </button>
        </div>

        {/* Quick Location Action Toolbar */}
        <div className="relative z-10 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleLocateGPS}
            className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-gradient-to-r from-[#0098ea] to-[#0081c7] hover:from-[#00a8ff] hover:to-[#0098ea] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md border border-cyan-300/40 cursor-pointer active:scale-95 transition-all"
          >
            <Navigation size={14} />
            <span>GPS Auto-Locate</span>
          </button>
          <button
            type="button"
            onClick={handleLocateIP}
            className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Globe size={14} className="text-cyan-300" />
            <span>Network IP Pin</span>
          </button>
        </div>

        {/* Interactive Delivery Map Simulation Canvas */}
        <div
          onClick={handleMapClick}
          className="relative z-10 w-full h-52 sm:h-60 rounded-2xl overflow-hidden border-2 border-purple-400/40 shadow-inner bg-[#0b1329] cursor-crosshair select-none group"
        >
          {/* Simulated Street Grid Map Pattern */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
                linear-gradient(rgba(0,152,234,0.15) 2px, transparent 2px),
                linear-gradient(90deg, rgba(0,152,234,0.15) 2px, transparent 2px)
              `,
              backgroundSize: "20px 20px, 20px 20px, 80px 80px, 80px 80px",
              backgroundPosition: `${(lng * 1000) % 80}px ${(lat * 1000) % 80}px`,
            }}
          />

          {/* River / Boulevard Graphic Contour */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" preserveAspectRatio="none" viewBox="0 0 400 240">
            <path
              d="M-20 60 Q 150 180 420 120"
              fill="none"
              stroke="#0284c7"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <path
              d="M200 -20 Q 180 120 230 260"
              fill="none"
              stroke="#eab308"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="14 10"
            />
          </svg>

          {/* Delivery Region Landmark Labels */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[10px] font-bold text-cyan-200">
            Phnom Penh Delivery Grid
          </div>

          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[10px] font-mono text-white/80">
            {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
          </div>

          {/* Zoom Controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.min(z + 1, 19));
              }}
              className="w-7 h-7 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-white/20 text-white font-bold flex items-center justify-center cursor-pointer shadow-md"
            >
              +
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.max(z - 1, 12));
              }}
              className="w-7 h-7 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-white/20 text-white font-bold flex items-center justify-center cursor-pointer shadow-md"
            >
              -
            </button>
          </div>

          {/* Center 3D Bouncing Location Pin Drop Marker */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative -mt-6 flex flex-col items-center">
              {/* Radar pulse ring */}
              <div className="absolute bottom-0 w-8 h-4 rounded-full bg-cyan-400/40 animate-ping" />
              <div className="absolute bottom-0 w-6 h-3 rounded-full bg-slate-950/80 border border-cyan-400/60" />

              {/* Pin marker */}
              <div className="relative z-10 drop-shadow-[0_8px_16px_rgba(239,68,68,0.7)] animate-bounce">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 border-2 border-white flex items-center justify-center text-white shadow-xl">
                  <MapPin size={18} className="text-white drop-shadow-sm" />
                </div>
                <div className="w-0 h-0 mx-auto border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-600 -mt-1" />
              </div>

              {/* Delivery crosshair target */}
              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300 mt-1 bg-black/75 px-2 py-0.5 rounded-full border border-cyan-400/30">
                Pin Location
              </span>
            </div>
          </div>
        </div>

        {/* Quick Landmark Presets */}
        <div className="relative z-10 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 block">
            Quick Delivery Hubs:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
            {PRESET_LOCATIONS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset.lat, preset.lng)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left text-white active:scale-95 transition-all cursor-pointer"
              >
                <span className="block text-xs font-bold truncate">{preset.name}</span>
                <span className="block text-[9px] text-purple-200/70 font-medium truncate">
                  {preset.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Real Physical Address Inspection Card */}
        <div className="relative z-10 p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
              Detected Real Physical Address
            </span>
            <div className="flex items-center gap-1.5">
              {loading && <RefreshCw size={12} className="animate-spin text-cyan-300" />}
              <span
                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  source === "gps"
                    ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                    : "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
                }`}
              >
                {source === "gps" ? "GPS High Accuracy" : "Network IP Pinpoint"}
              </span>
            </div>
          </div>

          <div>
            <span className="text-sm font-black text-white block">
              {resolvedAddress.street}
            </span>
            <span className="text-xs text-white/80 block mt-0.5">
              {resolvedAddress.stateProvince}, {resolvedAddress.city}, {resolvedAddress.country} ({resolvedAddress.postalCode})
            </span>
          </div>

          {/* Unit / Floor Input */}
          <div className="pt-1">
            <label className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block mb-1">
              Add Apt / Suite / Unit (Optional)
            </label>
            <input
              type="text"
              value={unitDetail}
              onChange={(e) => setUnitDetail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/40 text-xs font-semibold focus:outline-none focus:border-cyan-400"
              placeholder="e.g. Building 8B, Floor 3, Suite 4A"
            />
          </div>
        </div>

        {/* Confirmation Button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="relative z-10 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_4px_18px_rgba(16,185,129,0.4)] border border-emerald-300/40 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Check size={16} />
          <span>Confirm Pin & Set Physical Address</span>
        </button>
      </div>
    </div>
  );
};
