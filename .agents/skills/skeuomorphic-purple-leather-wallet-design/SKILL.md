---
name: skeuomorphic-purple-leather-wallet-design
description: Authoritative primary design standard and component architecture for 3D Skeuomorphic Purple Textured Leather Pocket & Stitched Card UI across Web, React, Next.js, and Telegram Mini Apps. Enforces realistic leather pebble textures, perimeter and curved-lip simulated thread stitching, stacked satin gradient cards with authentic Wei Coin typographic logos, frosted glassmorphism action buttons, tactile 3D bevels, and ambient occlusion depth.
---

# 3D SKEUOMORPHIC PURPLE TEXTURED LEATHER WALLET & STITCHED CARD DESIGN SYSTEM

This specification establishes the authoritative, permanent **Primary Design Standard** for the agent when writing code. Whenever instructed to apply the brand style, agents MUST strictly implement the **Skeuomorphic Purple Leather Wallet design**, specifically the **Skeuomorphic Card Style**.

---

## 1. Primary Directives & Architecture Preservation

1. **Brand Style Instruction**:
   - When commanded to apply the brand style or card style, always use the 3D Skeuomorphic Purple Leather Wallet and Skeuomorphic Card Style.
   - Never use flat, generic minimalist cards or plain material containers.
2. **Reuse Existing Components & Avoid Duplication**:
   - Reusable Wallet Component: [`src/components/cards/BanknoteCreditCards.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/cards/BanknoteCreditCards.tsx)
   - Reusable Settings Component: [`src/components/views/UserSettingsView.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/views/UserSettingsView.tsx)
   - Reusable Brand Logo: [`src/components/brand/ShiliaiweiBrand.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/brand/ShiliaiweiBrand.tsx)
   - Reusable Verified Badge: [`src/components/common/TelegramVerifiedBadge.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/common/TelegramVerifiedBadge.tsx)
   - Reusable Icons: [`src/components/icons/KeylineIcons.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/icons/KeylineIcons.tsx)
   - Reusable Hooks & Settings: [`src/lib/userSettings.ts`](file:///Users/Apple16/Desktop/mini-app/src/lib/userSettings.ts)
   - Reusable Ledger & Crypto: [`src/lib/wallet/ledger.ts`](file:///Users/Apple16/Desktop/mini-app/src/lib/wallet/ledger.ts) and [`src/lib/wallet/crypto.ts`](file:///Users/Apple16/Desktop/mini-app/src/lib/wallet/crypto.ts)
3. **Preserve Business Logic & Architecture**:
   - Retain dual currency switching (USD / KHR) with localStorage persistence (`shi_wallet_currency`).
   - Retain the 3 tactile coin action triggers (SCAN, RECEIVE, WITHDRAW).
   - Retain tap-to-hide balance privacy on number balance click.
   - Retain immutable append-only ledger transaction execution.

---

## 2. Wei Coin Logo Specification & Location

* **Asset Location**: [`src/components/brand/ShiliaiweiBrand.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/brand/ShiliaiweiBrand.tsx)
* **Authoritative Rules**: [`src/components/brand/LOGO_RULES.md`](file:///Users/Apple16/Desktop/mini-app/src/components/brand/LOGO_RULES.md)
* **Logo Unit Construction**:
  - The official logo unit consists strictly of the wordmark unit: **`SHILIAI`** (bold text) + **`[WEI]`** (rounded rectangle badge, LinkedIn style).
  - Single line layout: The badge sits on the exact same line immediately adjacent to `SHILIAI` with a tight 2px–3px margin. Never wrap or break across lines.
  - Zero additions rule: Never add prefixes, suffixes, extra icons, shields, or auxiliary descriptive labels around the logo.
  - Mutual exclusivity rule: When the logo is displayed, never display extra plain text `SHILIAIWEI` or `WEI` alongside it in the same card or header.
* **On-Card Application**:
  - Placed at the top-right of the physical card face:
    ```tsx
    <ShiliaiweiBrand colorScheme="white" height={16} className="opacity-95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] flex-shrink-0" />
    ```

---

## 3. Skeuomorphic Card Style Visual Requirements

### A. Purple & Leather-Inspired Color Scheme and Texture
* **Base Gradient**: Multi-stop royal purple gradient simulating directional lighting on dyed calfskin leather:
  - Top highlight: `#6b22a8`
  - Mid-body tone: `#52188f`
  - Deep base shadow: `#380c63`
  - Seam and fold recesses: `#260742`
* **Pebble Leather Grain Texture**: High-resolution procedural radial matrix overlay:
  ```tsx
  <div
    className="absolute inset-0 rounded-[38px] opacity-15 pointer-events-none mix-blend-overlay"
    style={{
      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(0,0,0,0.5) 1px, transparent 1px)`,
      backgroundSize: "6px 6px, 8px 8px",
    }}
  />
  ```
* **Security Guilloche Engraving**: Banknote security watermark overlay from `/backgrounds/cardbanknote.svg` (`opacity: 0.25–0.30`, `mix-blend-overlay`, +35% contrast).

### B. Rounded Corners & Physical Card 3D Depth
* **Cardholder Container Radius**: `rounded-[38px]` outer radius.
* **Stacked Physical Card Radius**: `rounded-t-[26px]` upper card face peeking from the leather pocket slot.
* **Front Pocket Flap Radius**: `rounded-b-[32px]` with a curved scooped lip revealing the card.
* **Multi-Layer Elevation Shadows**:
  ```css
  box-shadow: 
    0 24px 48px -12px rgba(45, 10, 80, 0.55),
    0 12px 24px -6px rgba(30, 5, 55, 0.40),
    inset 0 2px 4px rgba(255, 255, 255, 0.35),
    inset 0 -3px 8px rgba(0, 0, 0, 0.55);
  ```
* **Simulated Thread Stitching (Threadwork)**:
  - Color: Light lavender `#e9d5ff` or pale cream `#f3e8ff`.
  - Perimeter stitch: `strokeWidth: 1.25px`, `strokeDasharray: 4 4`, `strokeLinecap: round`, `filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.60))`.
  - Curved lip stitch: Quadratic bezier path `M 2 2 Q 180 8 360 2`.
* **Specular Rim Highlight**: Hairline top edge highlight (`h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent`).

### C. Clear & Readable Typography with Adequate Spacing
* **Card Top Header Row**:
  - Left: Telegram `@username` in bold `text-base sm:text-lg` with `TelegramVerifiedBadge`.
  - Right: `ShiliaiweiBrand` logo (`colorScheme="white"`, `height={16}`).
* **Card Middle Address Row**:
  - Transparent monospace address (`0x...••••••••...`) in `text-[11px] font-mono text-white/60 tracking-wider`.
  - Right tag: Subtle uppercase `Skeuomorphic Card` label.
* **Card Bottom Balance Row**:
  - Left: Prominent currency symbol (`$` or `៛`) in `text-3xl sm:text-4xl font-black text-white`.
  - Right: Large readable formatted balance digits (`text-2xl sm:text-3xl font-black font-sans text-right`).
  - Spacing: Governed by `space-y-2` on card plate and `p-4 sm:p-5` container padding to prevent text overlap.

---

## 4. Reusable Primitives Blueprint

```tsx
// 1. Guilloche Banknote Security Texture
export const GuillocheBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.24 }) => (
  <div
    className="absolute inset-0 pointer-events-none mix-blend-overlay"
    style={{
      backgroundImage: `url("/backgrounds/cardbanknote.svg")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
      backgroundSize: "cover",
      opacity,
      filter: "contrast(1.35) brightness(1.1)",
    }}
  />
);

// 2. Simulated Perimeter Thread Stitching
export const ThreadStitching: React.FC<{ strokeColor?: string }> = ({ strokeColor = "#e9d5ff" }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="9"
      y="9"
      width="calc(100% - 18px)"
      height="calc(100% - 18px)"
      rx="30"
      ry="30"
      fill="none"
      stroke={strokeColor}
      strokeWidth="1.25"
      strokeDasharray="4 4"
      strokeLinecap="round"
      opacity="0.5"
      style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.60))" }}
    />
  </svg>
);

// 3. Pebble Leather Grain Matrix
export const LeatherGrain: React.FC = () => (
  <div
    className="absolute inset-0 rounded-[28px] opacity-15 pointer-events-none mix-blend-overlay"
    style={{
      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(0,0,0,0.5) 1px, transparent 1px)`,
      backgroundSize: "6px 6px, 8px 8px",
    }}
  />
);

// 4. Specular Top Rim Highlight
export const SpecularRim: React.FC = () => (
  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-20" />
);
```

---

## 5. Strict Compliance & Validation Checklist

1. **Visual Style Match**: Base gradient uses royal purple palette with leather grain and `#e9d5ff` stitching.
2. **Wei Coin Logo Correctness**: Uses `<ShiliaiweiBrand colorScheme="white" />` matching LinkedIn-style badge rules.
3. **No Broken Logic**: All state hooks (`handleCycleCurrency`, `handleActionClick`, `handleToggleClick`) and business endpoints remain functional.
4. **Zero Emojis**: Strictly no emojis anywhere in UI, copy, responses, or code.
5. **Zero Guide Labels & Zero Meta-Descriptors**: NEVER write, render, or display labels showing a guide example (e.g. `SKEUOMORPHIC CARD`, `Skeuomorphic Card Suite`, `Skeuomorphic Controls`), theme names, or place names on cards or UI components. Keep interface elements realistic, clean, and unpolluted by internal design jargon.
6. **Quality Gates**: All code must pass `pnpm test` and `pnpm run checkpoint` without warnings or failures.

