"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Map,
  Navigation,
  Globe,
  Check,
  RefreshCw,
} from "@/components/icons/KeylineIcons";
import { AddressDetails } from "@/lib/userSettings";

export interface WorkingAddressMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
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

function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const rad = (lat * Math.PI) / 180;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

export const WorkingAddressMapModal: React.FC<WorkingAddressMapModalProps> = ({
  isOpen,
  onClose,
  title = "Pin Working Office Location",
  initialAddress,
  onConfirm,
  triggerHaptic,
}) => {
  const [lat, setLat] = useState<number>(11.5564);
  const [lng, setLng] = useState<number>(104.9282);
  const [zoom, setZoom] = useState<number>(16);
  const [unitDetail, setUnitDetail] = useState<string>(initialAddress?.unit || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [source, setSource] = useState<"gps" | "ip_network" | "map_pin" | "manual">("map_pin");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; lat: number; lng: number } | null>(null);

  const [resolvedAddress, setResolvedAddress] = useState<GeocodedResult>({
    street: initialAddress?.street || "Independence Monument Roundabout",
    unit: initialAddress?.unit || "",
    city: initialAddress?.city || "Phnom Penh",
    stateProvince: initialAddress?.stateProvince || "Khan Boeng Keng Kang",
    postalCode: initialAddress?.postalCode || "120102",
    country: initialAddress?.country || "Cambodia",
    displayName: "Pin your physical working address on map...",
  });

  const fetchGeocode = useCallback(
    async (targetLat: number, targetLng: number, srcType: "gps" | "ip_network" | "map_pin" | "manual") => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode/locate?lat=${targetLat}&lng=${targetLng}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.address) {
            setResolvedAddress({
              street: data.address.street || "Main Commercial Road",
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
        // Keep current coordinates
      } finally {
        setLoading(false);
      }
    },
    [unitDetail, triggerHaptic]
  );

  // Auto-detect location on first open
  useEffect(() => {
    if (!isOpen) return;

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

  // Map Click to drop pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = (x - rect.width / 2) / rect.width;
    const dy = (y - rect.height / 2) / rect.height;

    const deltaLat = -dy * 0.006;
    const deltaLng = dx * 0.006;

    const newLat = Number((lat + deltaLat).toFixed(6));
    const newLng = Number((lng + deltaLng).toFixed(6));

    setLat(newLat);
    setLng(newLng);
    fetchGeocode(newLat, newLng, "map_pin");
  };

  // Mouse & Touch Drag & Drop on the Map
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, lat, lng };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const deltaLat = dy * 0.00008;
    const deltaLng = -dx * 0.00008;

    setLat(Number((dragStartRef.current.lat + deltaLat).toFixed(6)));
    setLng(Number((dragStartRef.current.lng + deltaLng).toFixed(6)));
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      fetchGeocode(lat, lng, "map_pin");
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        lat,
        lng,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    const deltaLat = dy * 0.00008;
    const deltaLng = -dx * 0.00008;

    setLat(Number((dragStartRef.current.lat + deltaLat).toFixed(6)));
    setLng(Number((dragStartRef.current.lng + deltaLng).toFixed(6)));
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      fetchGeocode(lat, lng, "map_pin");
    }
  };

  const handleSelectPreset = (pLat: number, pLng: number) => {
    setLat(pLat);
    setLng(pLng);
    fetchGeocode(pLat, pLng, "map_pin");
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

  // Compute 3x3 real OpenStreetMap tiles around center
  const centerTile = latLngToTile(lat, lng, zoom);
  const tiles: Array<{ x: number; y: number; key: string }> = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      tiles.push({
        x: centerTile.x + dx,
        y: centerTile.y + dy,
        key: `${zoom}-${centerTile.x + dx}-${centerTile.y + dy}`,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fadeIn select-none font-sans">
      <div
        className="relative w-full max-w-lg rounded-[28px] p-5 sm:p-6 overflow-hidden bg-gradient-to-b from-[#1e1b4b] via-[#1e1b4b] to-[#0f172a] text-white border border-indigo-400/40 space-y-4 animate-slideUp max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow:
            "0 24px 50px -10px rgba(15, 23, 42, 0.9), inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -3px 8px rgba(0, 0, 0, 0.6)",
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
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-20" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-300/30 text-indigo-200">
              <Map size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide drop-shadow-sm">
                {title}
              </h3>
              <p className="text-[11px] text-indigo-200/80 font-medium">
                Drag and drop the pin anywhere to set your working office
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
          >
            Close
          </button>
        </div>

        {/* Quick Toolbar */}
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

        {/* Interactive OpenStreetMap Canvas */}
        <div
          onClick={handleMapClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative z-10 w-full h-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-indigo-400/40 shadow-inner bg-slate-900 cursor-grab active:cursor-grabbing select-none group"
        >
          {/* Real OpenStreetMap Tile Grid */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-85">
            {tiles.map((t) => (
              <img
                key={t.key}
                src={`https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${t.x}/${t.y}.png`}
                alt="OpenStreetMap Tile"
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
            ))}
          </div>

          {/* Coordinate Badge */}
          <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[10px] font-mono text-cyan-200 z-20">
            {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
          </div>

          {/* Map Controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.min(z + 1, 18));
              }}
              className="w-7 h-7 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-white/20 text-white font-bold flex items-center justify-center cursor-pointer shadow-md"
            >
              +
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.max(z - 1, 13));
              }}
              className="w-7 h-7 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-white/20 text-white font-bold flex items-center justify-center cursor-pointer shadow-md"
            >
              -
            </button>
          </div>

          {/* Draggable Center Pin Marker */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="relative -mt-7 flex flex-col items-center">
              {/* Pin Shadow */}
              <div className="absolute bottom-0 w-5 h-2 rounded-full bg-slate-950/80 blur-[2px]" />

              {/* Pin Head */}
              <div className="relative z-10 drop-shadow-[0_8px_16px_rgba(0,152,234,0.7)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0077b5] via-[#0098ea] to-[#38bdf8] border-2 border-white flex items-center justify-center text-white shadow-xl">
                  <MapPin size={20} className="text-white drop-shadow-sm" />
                </div>
                <div className="w-0 h-0 mx-auto border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#0077b5] -mt-1" />
              </div>

              {/* Pin Tag */}
              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-200 mt-1 bg-slate-950/90 px-2 py-0.5 rounded-full border border-cyan-400/40">
                Working Office Pin
              </span>
            </div>
          </div>
        </div>

        {/* Quick Landmarks */}
        <div className="relative z-10 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 block">
            Popular Commercial Hubs:
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
                <span className="block text-[9px] text-indigo-200/70 font-medium truncate">
                  {preset.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Physical Address Inspection Card */}
        <div className="relative z-10 p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
              Auto-Resolved Working Address
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
                {source === "gps" ? "GPS High Accuracy" : "OpenStreetMap Pinpoint"}
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
            <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block mb-1">
              Building, Tower, Floor, Suite (Optional)
            </label>
            <input
              type="text"
              value={unitDetail}
              onChange={(e) => setUnitDetail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/40 text-xs font-semibold focus:outline-none focus:border-cyan-400"
              placeholder="e.g. Canadia Tower, 18th Floor, Suite 1802"
            />
          </div>
        </div>

        {/* Confirmation Button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="relative z-10 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0098ea] via-[#0284c7] to-[#0369a1] hover:from-[#00a8ff] hover:to-[#0098ea] text-white font-black text-xs uppercase tracking-wider shadow-[0_4px_18px_rgba(0,152,234,0.4)] border border-cyan-300/40 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Check size={16} />
          <span>Confirm & Set Working Address</span>
        </button>
      </div>
    </div>
  );
};

