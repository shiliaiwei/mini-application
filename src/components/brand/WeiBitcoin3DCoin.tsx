"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { RefreshCw, Zap } from "@/components/icons/KeylineIcons";

export interface WeiBitcoin3DCoinProps {
  /** Size of coin in pixels (width & height), defaults to 240 */
  size?: number;
  /** Whether the coin responds to user dragging & tapping */
  interactive?: boolean;
  /** Tap reward amount added per tap */
  tapPower?: number;
  /** Callback when user taps or mines the coin */
  onTap?: (amount: number) => void;
  /** Telegram WebApp context for native haptics */
  tgApp?: {
    HapticFeedback?: {
      impactOccurred?: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
      notificationOccurred?: (type: "error" | "success" | "warning") => void;
      selectionChanged?: () => void;
    };
  } | null;
  /** Additional container CSS classes */
  className?: string;
  /** Show interactive hint badge and quick-flip action bar */
  showControls?: boolean;
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  amount: number;
}

/**
 * 3D Bitcoin-Style WEI Coin Component
 * - 100% Vector & CSS 3D code design (zero external raster images)
 * - Milled reeded edge, raised concentric bevels, engraved cryptographic circuitry
 * - Centered bold embossed "WEI" typography with chiseled specular highlights
 * - Dual-sided: Front "WEI" standard + Reverse Genesis Block #0001 fair mining seal
 * - Interactive 360-degree rotation gesture via left/right drag (Telegram style)
 * - Physics momentum, idle floating levitation, and tactile tap mining feedback
 */
export const WeiBitcoin3DCoin: React.FC<WeiBitcoin3DCoinProps> = ({
  size = 240,
  interactive = true,
  tapPower = 1,
  onTap,
  tgApp,
  className = "",
  showControls = true,
}) => {
  // 3D Rotation State
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(8);
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);

  // Drag Tracking Refs
  const dragStartRef = useRef<{ x: number; y: number; rotY: number; rotX: number; time: number }>({
    x: 0,
    y: 0,
    rotY: 0,
    rotX: 8,
    time: 0,
  });
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const animFrameRef = useRef<number | null>(null);
  const particleIdCounter = useRef(0);
  const isInteractingRef = useRef(false);

  // Idle floating & subtle ambient drift animation
  useEffect(() => {
    let startTime = performance.now();
    let isRunning = true;

    const tick = (now: number) => {
      if (!isRunning) return;

      // Only apply idle floating & auto-rotation when user is NOT dragging or coasting
      if (!isInteractingRef.current) {
        const elapsed = (now - startTime) / 1000;
        // Subtle ambient levitation wobble (±4° Y-drift, ±3° X-pitch)
        const idleRotX = 8 + Math.sin(elapsed * 1.5) * 3;
        setRotX((prev) => prev * 0.95 + idleRotX * 0.05);

        // Apply friction to any remaining angular velocity
        if (Math.abs(velocityRef.current.vx) > 0.05) {
          setRotY((prev) => (prev + velocityRef.current.vx) % 360);
          velocityRef.current.vx *= 0.94;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Handle Pointer Down (Touch / Mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;

    // Capture pointer for reliable tracking across viewport
    e.currentTarget.setPointerCapture(e.pointerId);
    isInteractingRef.current = true;
    setIsDragging(true);
    setIsPressed(true);

    velocityRef.current = { vx: 0, vy: 0 };
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotY: rotY,
      rotX: rotX,
      time: performance.now(),
    };
  };

  // Handle Pointer Move (Left/Right 360° Drag & Vertical Pitch)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const now = performance.now();
    const dt = Math.max(1, now - dragStartRef.current.time);

    // Continuous 360° rotation along Y axis (0.65 deg per px)
    const newRotY = (dragStartRef.current.rotY + deltaX * 0.75) % 360;
    // Damped pitch along X axis (clamped between -28° and +28°)
    const rawRotX = dragStartRef.current.rotX - deltaY * 0.35;
    const newRotX = Math.max(-28, Math.min(28, rawRotX));

    // Calculate angular velocity for smooth momentum release
    velocityRef.current = {
      vx: (deltaX / dt) * 3.5,
      vy: (deltaY / dt) * 1.5,
    };

    setRotY(newRotY);
    setRotX(newRotX);
  };

  // Handle Pointer Up / Tap Recognition
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }

    setIsDragging(false);
    setIsPressed(false);

    const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
    const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
    const duration = performance.now() - dragStartRef.current.time;

    // TAP DETECTION: If movement < 8px and duration < 300ms, treat as mining tap!
    if (deltaX < 8 && deltaY < 8 && duration < 300) {
      handleCoinTap(e.clientX, e.clientY, e.currentTarget);
    }

    // Release interaction lock after brief momentum decay
    setTimeout(() => {
      isInteractingRef.current = false;
    }, 400);
  };

  // Handle Mining Tap Action
  const handleCoinTap = (clientX: number, clientY: number, container: HTMLElement) => {
    // Trigger Telegram native haptics
    tgApp?.HapticFeedback?.impactOccurred?.("medium");

    // Spawn floating "+tapPower WEI" score particle at tap location
    const rect = container.getBoundingClientRect();
    const spawnX = Math.max(20, Math.min(rect.width - 20, clientX - rect.left));
    const spawnY = Math.max(20, Math.min(rect.height - 20, clientY - rect.top));

    const newParticle: FloatingParticle = {
      id: ++particleIdCounter.current,
      x: spawnX,
      y: spawnY,
      amount: tapPower,
    };

    setParticles((prev) => [...prev.slice(-8), newParticle]);

    // Cleanup particle after animation finishes
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 850);

    // Invoke user tap callback
    onTap?.(tapPower);
  };

  // Quick 360° Spin Action
  const handleQuickFlip = useCallback(() => {
    tgApp?.HapticFeedback?.selectionChanged?.();
    isInteractingRef.current = true;
    velocityRef.current.vx = 14; // High initial angular velocity for full 360° spin
    setTimeout(() => {
      isInteractingRef.current = false;
    }, 1200);
  }, [tgApp]);

  // Reset to Front Action
  const handleResetFace = useCallback(() => {
    tgApp?.HapticFeedback?.selectionChanged?.();
    isInteractingRef.current = true;
    velocityRef.current.vx = 0;
    setRotY(0);
    setRotX(8);
    setTimeout(() => {
      isInteractingRef.current = false;
    }, 200);
  }, [tgApp]);

  // Generate 64 Milled Radial Reeding Notches around perimeter
  const reedingNotches = React.useMemo(() => {
    const notches = [];
    const count = 64;
    const r1 = 144;
    const r2 = 137;
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      const x1 = 150 + Math.cos(angle) * r1;
      const y1 = 150 + Math.sin(angle) * r1;
      const x2 = 150 + Math.cos(angle) * r2;
      const y2 = 150 + Math.sin(angle) * r2;
      notches.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={i % 2 === 0 ? "#78350f" : "#fef08a"}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity={0.85}
        />
      );
    }
    return notches;
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center select-none font-sans ${className}`}>
      {/* 3D SCENE STAGE CONTAINER */}
      <div
        className="relative flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          perspective: "1100px",
          WebkitPerspective: "1100px",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Ground Ambient Reflection Shadow (Scales & squashes realistically with tilt) */}
        <div
          className="absolute -bottom-4 w-4/5 h-6 rounded-full pointer-events-none transition-transform duration-75"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(180, 83, 9, 0.45) 0%, rgba(0, 0, 0, 0.35) 40%, transparent 75%)",
            filter: "blur(6px)",
            transform: `scaleX(${Math.max(0.3, Math.abs(Math.cos((rotY * Math.PI) / 180))) * 0.95 + 0.15}) scaleY(${
              1 + (rotX / 28) * 0.3
            })`,
          }}
        />

        {/* Ambient Pulsing Specular Halo */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle at center, rgba(245, 158, 11, 0.22) 0%, rgba(0, 152, 234, 0.12) 50%, transparent 72%)",
            filter: "blur(14px)",
            transform: "scale(1.2)",
            opacity: isPressed ? 0.75 : 0.45,
          }}
        />

        {/* 3D COIN ROTATING BODY (Full 360° Y-Rotation + X-Pitch) */}
        <div
          className="relative w-full h-full rounded-full transition-transform"
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) scale3d(${isPressed ? 0.93 : 1}, ${
              isPressed ? 0.93 : 1
            }, ${isPressed ? 0.93 : 1})`,
            transition: isDragging ? "transform 0.04s linear" : "transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          {/* ============================================================== */}
          {/* 3D CYLINDER EDGE DEPTH (Milled Metallic Rim Layers)            */}
          {/* ============================================================== */}
          {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((zOffset) => (
            <div
              key={`edge-${zOffset}`}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                transform: `translateZ(${zOffset}px)`,
                border: "2px solid #92400e",
                background: "linear-gradient(135deg, #b45309 0%, #fef08a 40%, #78350f 70%, #d97706 100%)",
                boxShadow: "inset 0 0 4px rgba(0,0,0,0.6)",
              }}
            />
          ))}

          {/* ============================================================== */}
          {/* FRONT FACE: BITCOIN-STYLE WEI COIN (Bold Center WEI)          */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-full overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "translateZ(5px)",
              filter: "drop-shadow(0 6px 14px rgba(69, 26, 3, 0.45))",
            }}
          >
            <svg
              viewBox="0 0 300 300"
              className="w-full h-full select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Metallic Gold Primary Gradient */}
                <linearGradient id="goldPlateFront" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="25%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#d97706" />
                  <stop offset="75%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>

                {/* Inner Bevel Sunken Floor */}
                <radialGradient id="sunkenFloor" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#451a03" />
                </radialGradient>

                {/* Chiseled 3D WEI Text Gradient */}
                <linearGradient id="weiTextGold" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="15%" stopColor="#fef08a" />
                  <stop offset="55%" stopColor="#f59e0b" />
                  <stop offset="85%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>

                {/* Cyber Cyan Accent Traces */}
                <linearGradient id="cyanTrace" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#0098ea" />
                </linearGradient>

                {/* Circumferential Path for Engraved Inscription */}
                <path
                  id="frontTextTrack"
                  d="M 150 28 A 122 122 0 1 1 149.9 28"
                  fill="none"
                />
              </defs>

              {/* 1. Base Coin Disc */}
              <circle cx="150" cy="150" r="148" fill="url(#goldPlateFront)" />

              {/* 2. Milled Radial Reeding Notches */}
              <g>{reedingNotches}</g>

              {/* 3. Outer Stepped Bevel Ring */}
              <circle
                cx="150"
                cy="150"
                r="136"
                fill="none"
                stroke="#451a03"
                strokeWidth="1.8"
                opacity="0.7"
              />
              <circle
                cx="150"
                cy="150"
                r="134"
                fill="none"
                stroke="#fffbeb"
                strokeWidth="1.2"
                opacity="0.9"
              />

              {/* 4. Engraved Circumferential Micro-Typography */}
              <text
                fill="#451a03"
                fontSize="8.5"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
                letterSpacing="2.8"
              >
                <textPath href="#frontTextTrack" startOffset="0%">
                  SHILIAIWEI NETWORK • L2 ATOMIC CONSENSUS • BLOCK #0001 • FAIR GENESIS •
                </textPath>
              </text>

              {/* 5. Inner Stepped Concentric Bevel */}
              <circle
                cx="150"
                cy="150"
                r="110"
                fill="none"
                stroke="#fef08a"
                strokeWidth="2.5"
                opacity="0.9"
              />
              <circle
                cx="150"
                cy="150"
                r="107"
                fill="none"
                stroke="#78350f"
                strokeWidth="1.8"
                opacity="0.8"
              />

              {/* 6. Sunken Core Coin Floor */}
              <circle cx="150" cy="150" r="105" fill="url(#sunkenFloor)" />

              {/* 7. Bitcoin-Style Cryptographic Circuitry Traces */}
              <g stroke="url(#cyanTrace)" strokeWidth="1.6" fill="none" opacity="0.45" strokeLinecap="round">
                {/* Circuit Track Top Left */}
                <path d="M 150 55 L 150 78 L 120 108 L 85 108" />
                <circle cx="85" cy="108" r="3.2" fill="#00f0ff" />
                <circle cx="120" cy="108" r="2.2" fill="#fef08a" />

                {/* Circuit Track Top Right */}
                <path d="M 150 55 L 150 78 L 180 108 L 215 108" />
                <circle cx="215" cy="108" r="3.2" fill="#00f0ff" />
                <circle cx="180" cy="108" r="2.2" fill="#fef08a" />

                {/* Circuit Track Bottom Left */}
                <path d="M 150 245 L 150 222 L 120 192 L 85 192" />
                <circle cx="85" cy="192" r="3.2" fill="#00f0ff" />
                <circle cx="120" cy="192" r="2.2" fill="#fef08a" />

                {/* Circuit Track Bottom Right */}
                <path d="M 150 245 L 150 222 L 180 192 L 215 192" />
                <circle cx="215" cy="192" r="3.2" fill="#00f0ff" />
                <circle cx="180" cy="192" r="2.2" fill="#fef08a" />

                {/* Horizontal Bus Lines */}
                <line x1="60" y1="150" x2="80" y2="150" strokeWidth="2" />
                <circle cx="60" cy="150" r="3" fill="#fef08a" />
                <line x1="220" y1="150" x2="240" y2="150" strokeWidth="2" />
                <circle cx="240" cy="150" r="3" fill="#fef08a" />
              </g>

              {/* 8. Center Decorative Medallion Shield */}
              <circle
                cx="150"
                cy="150"
                r="64"
                fill="none"
                stroke="#fffbeb"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.6"
              />

              {/* 9. CENTER CHISELED "WEI" TYPOGRAPHY */}
              {/* Deep Drop Shadow Relief Layer */}
              <text
                x="150"
                y="163"
                textAnchor="middle"
                fill="#270c01"
                fontSize="54"
                fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
                fontWeight="900"
                letterSpacing="3"
                opacity="0.9"
              >
                WEI
              </text>

              {/* Intermediate Dark Amber Shadow */}
              <text
                x="150"
                y="161.5"
                textAnchor="middle"
                fill="#78350f"
                fontSize="54"
                fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
                fontWeight="900"
                letterSpacing="3"
              >
                WEI
              </text>

              {/* Core Gold 3D Text */}
              <text
                x="150"
                y="160"
                textAnchor="middle"
                fill="url(#weiTextGold)"
                fontSize="54"
                fontFamily="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif"
                fontWeight="900"
                letterSpacing="3"
                stroke="#fffbeb"
                strokeWidth="0.8"
                style={{
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
                }}
              >
                WEI
              </text>

              {/* 10. Center Micro-Subtext & Official Badge Accent */}
              <rect
                x="105"
                y="178"
                width="90"
                height="14"
                rx="3.5"
                fill="#0098ea"
                stroke="#ffffff"
                strokeWidth="0.75"
                opacity="0.9"
              />
              <text
                x="150"
                y="188.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8.5"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
                letterSpacing="1.2"
              >
                COIN STANDARD
              </text>

              {/* 11. Diagonal Specular Metallic Sheen Glint */}
              <path
                d="M 40 40 L 120 20 L 260 260 L 180 280 Z"
                fill="url(#goldPlateFront)"
                opacity="0.18"
                style={{ mixBlendMode: "overlay" }}
              />
            </svg>
          </div>

          {/* ============================================================== */}
          {/* BACK FACE: GENESIS BLOCK #0001 FAIR PROOF SEAL (At 180° Flip) */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-full overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(5px)",
              filter: "drop-shadow(0 6px 14px rgba(69, 26, 3, 0.45))",
            }}
          >
            <svg
              viewBox="0 0 300 300"
              className="w-full h-full select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <path
                  id="backTextTrack"
                  d="M 150 28 A 122 122 0 1 1 149.9 28"
                  fill="none"
                />
              </defs>

              {/* 1. Base Coin Disc */}
              <circle cx="150" cy="150" r="148" fill="url(#goldPlateFront)" />

              {/* 2. Milled Radial Reeding Notches */}
              <g>{reedingNotches}</g>

              {/* 3. Outer Rings */}
              <circle cx="150" cy="150" r="136" fill="none" stroke="#451a03" strokeWidth="1.8" opacity="0.7" />
              <circle cx="150" cy="150" r="134" fill="none" stroke="#fffbeb" strokeWidth="1.2" opacity="0.9" />

              {/* 4. Engraved Inscription on Back */}
              <text
                fill="#451a03"
                fontSize="8.5"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
                letterSpacing="2.8"
              >
                <textPath href="#backTextTrack" startOffset="0%">
                  PROOF OF FAIR EARNING • 0.00010000 HALVING • ATOMIC SETTLEMENT •
                </textPath>
              </text>

              {/* 5. Inner Stepped Ring */}
              <circle cx="150" cy="150" r="110" fill="none" stroke="#fef08a" strokeWidth="2.5" opacity="0.9" />
              <circle cx="150" cy="150" r="105" fill="url(#sunkenFloor)" />

              {/* 6. Genesis Block Cryptographic Crest (#0001) */}
              <g transform="translate(150, 140)">
                {/* Atomic Orbit Rings */}
                <ellipse cx="0" cy="0" rx="55" ry="24" fill="none" stroke="#fde047" strokeWidth="1.4" opacity="0.6" transform="rotate(30)" />
                <ellipse cx="0" cy="0" rx="55" ry="24" fill="none" stroke="#00f0ff" strokeWidth="1.4" opacity="0.6" transform="rotate(-30)" />

                {/* Central Vault Shield Hexagon */}
                <polygon
                  points="0,-36 32,-18 32,18 0,36 -32,18 -32,-18"
                  fill="#0098ea"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))" }}
                />

                {/* "SHILIAI" Top Inscription */}
                <text
                  x="0"
                  y="-8"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="900"
                  letterSpacing="1.5"
                >
                  SHILIAI
                </text>

                {/* Center Genesis Block Badge */}
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  fill="#fef08a"
                  fontSize="15"
                  fontFamily="monospace"
                  fontWeight="900"
                  letterSpacing="1"
                >
                  #0001
                </text>
              </g>

              {/* Genesis Block Halving Standard Badge */}
              <rect
                x="85"
                y="200"
                width="130"
                height="16"
                rx="4"
                fill="#451a03"
                stroke="#fbbf24"
                strokeWidth="1"
              />
              <text
                x="150"
                y="212"
                textAnchor="middle"
                fill="#fde047"
                fontSize="9"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
                letterSpacing="1.5"
              >
                GENESIS BLOCK
              </text>
            </svg>
          </div>
        </div>

        {/* ============================================================== */}
        {/* FLOATING SCORE REWARD PARTICLES (+tapPower WEI on tap)        */}
        {/* ============================================================== */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none font-black text-sm font-mono tracking-wider animate-float-fade"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              color: "#fef08a",
              textShadow: "0 0 10px #f59e0b, 0 0 20px #0098ea, 0 2px 4px #000000",
              transform: "translate(-50%, -50%)",
            }}
          >
            +{p.amount} WEI
          </div>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 360-DEGREE ROTATION CONTROLS & GESTURE STATUS HINT             */}
      {/* ============================================================== */}
      {showControls && (
        <div className="w-full max-w-xs mt-2.5 flex flex-col items-center gap-1.5">
          {/* Subtle Gesture Instruction Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-400/25 text-amber-200 text-[10px] font-bold tracking-wide shadow-xs">
            <span className="text-cyan-300 font-mono">360°</span>
            <span>Drag left/right to rotate</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-300 font-mono">Tap to mine</span>
          </div>

          {/* Quick Action Buttons: 360° Flip & Center Front */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleQuickFlip}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white/80 hover:text-white text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <RefreshCw size={11} className="text-cyan-300" />
              <span>360° Flip</span>
            </button>

            <button
              type="button"
              onClick={handleResetFace}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white/80 hover:text-white text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Zap size={11} className="text-amber-300" />
              <span>Front</span>
            </button>

            <span className="text-[10px] font-mono text-white/50 px-1">
              {Math.round((((rotY % 360) + 360) % 360))}°
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

WeiBitcoin3DCoin.displayName = "WeiBitcoin3DCoin";
