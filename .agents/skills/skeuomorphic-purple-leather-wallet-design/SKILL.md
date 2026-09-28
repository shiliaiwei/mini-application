---
name: skeuomorphic-purple-leather-wallet-design
description: Authoritative design standard and architectural specification for 3D Skeuomorphic Purple Textured Leather Pocket & Stitched Card UI across Web, React, Next.js, and Mobile Mini Apps. Enforces realistic leather pebble textures, perimeter and curved-lip simulated thread stitching, stacked satin gradient cards with typographic logos, frosted glassmorphism action buttons, tactile 3D bevels, and ambient occlusion depth. Trigger on: "skeuomorphic wallet", "purple leather", "leather pocket", "stitched card", "3d wallet ui", "simulated stitching", "visa stacked card", "skeuomorphic design".
---

# 3D SKEUOMORPHIC PURPLE TEXTURED LEATHER WALLET & STITCHED CARD DESIGN SYSTEM

This specification establishes the authoritative, permanent Design and Component Architecture for the **3D Skeuomorphic Purple Textured Leather Pocket & Stitched Card UI System**. It delivers a high-tactility, ultra-luxurious physical cardholder experience in digital interfaces.

---

## 1. Core Visual Directives

### 1. 3D Skeuomorphic Leather Material
- **Base Gradient**: Multi-stop royal purple gradient simulating directional lighting on dyed leather:
  - Top highlight: `#6b22a8`
  - Mid-body tone: `#52188f`
  - Deep base shadow: `#380c63`
  - Seam and fold recesses: `#260742`
- **Pebble Leather Grain Texture**: High-resolution procedural SVG noise or fine radial matrix overlay (`mix-blend-overlay`, opacity `0.12–0.18`), providing organic tactile grain.
- **3D Depth & Elevation**:
  ```css
  box-shadow: 
    0 24px 48px -12px rgba(45, 10, 80, 0.55),
    0 12px 24px -6px rgba(30, 5, 55, 0.40),
    inset 0 2px 4px rgba(255, 255, 255, 0.35),
    inset 0 -3px 8px rgba(0, 0, 0, 0.55);
  ```

### 2. Simulated Thread Stitching (Threadwork)
- **Thread Color**: Light lavender / pale cream `#E9D5FF` or `#F3E8FF`.
- **Stitch Geometry**:
  - `strokeWidth`: `1.2px` to `1.35px`
  - `strokeDasharray`: `4 4` or `5 4`
  - `strokeLinecap`: `round`
- **Embossed 3D Indentation**: Every stitch must carry a subtle downward drop shadow mimicking physical thread pressed into leather:
  ```css
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.60));
  ```
- **Dual Placement**:
  1. *Perimeter Stitching*: Inset `8px` to `10px` along the outer rounded wallet boundary (`rx="30" ry="30"`).
  2. *Curved Lip Stitching*: Parallel to the scooped front pocket flap with `Q` quadratic bezier curve (`M 2 2 Q 180 8 360 2`).

### 3. Stacked Cards in Top Slot & Dual Currency System
- **Rear Layer**: Dark indigo/purple card top rim (`#3B0764`, opacity `0.80`, `rounded-t-[20px]`) with `cardbanknote.svg` texture visible behind the primary card.
- **Front Primary Card (Sticky Currency Card)**:
  - Vector Security Texture: Exclusively uses `cardbanknote.svg` (`/backgrounds/cardbanknote.svg`) at `25%` opacity with `mix-blend-overlay` and +35% contrast.
  - Satin gradient: `linear-gradient(135deg, #D8B4FE 0%, #C084FC 40%, #A855F7 75%, #9333EA 100%)`.
  - Specular sheen: Diagonal top-left light wash (`linear-gradient(115deg, rgba(255,255,255,0.7) 0%, transparent 60%)`).
  - Cardholder & Telegram Owner: Shows authenticated Telegram `@username` paired directly with the official blue Telegram Verified Badge (`TelegramVerifiedBadge`).
  - Encrypted Address: Transparent monospace address (`0x...••••••••...`) with tap-to-copy (zero icons).
  - Dual Currency Toggle: Strictly switches between US Dollar (`$`) and Cambodian Riel (`៛`). SAR is strictly excluded.
  - Zero Switch Animation: When switching currency, values toggle instantly with zero text translation, zero card hanging/tilt animation, and zero layout shift.
  - Sticky Persistence: The user's chosen currency preference is saved to `localStorage ("shi_wallet_currency")` and restored on startup.

### 4. Front Leather Pocket Flap, Curved Lip & Single Currency Display
- **Curved Lip Geometry**: Scooped down in the center by `6px–12px` to reveal the stacked cards with simulated thread stitching.
- **Banknote Security Texture**: Uses `cardbanknote.svg` overlay with 25% opacity and contrast boost.
- **Rolled Edge Highlight**: Upper specular highlight rim (`h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent`).
- **Inner Pocket Shadow**: Casts an upward shadow onto the card slot (`box-shadow: 0 -8px 20px -4px rgba(25, 4, 45, 0.6)`).
- **Single Currency Display (Zero Duplicate Symbols)**:
  - Total balance displays strictly as formatted numbers without prepended currency symbols (e.g. `1,071,986` or `1,250.00`).
  - The currency sign pill (`$` or `៛`) sits solely on the right of the total balance.

### 5. Mobile Background Architecture & Asset Isolation
- **App Background on Mobile**: Strictly uses `background.svg` (`/backgrounds/background.svg` via `.bg-app-background`) scaled to `min(100vw, 540px)`.
- **Zero Banknote Background Behind App**: `cardbanknote.svg` is strictly prohibited behind the entire app canvas or settings views.
- **Card Wallet Texture**: Strictly uses `cardbanknote.svg` (`/backgrounds/cardbanknote.svg`) for the card wallet (card face, back card edge, and 3D banknote pocket).

### 6. Permanent Tactile Coin Actions & Direct Balance Privacy
- **Permanent Quick Actions Display (No Plus Button)**:
  - The plus button toggle (`+` / `x`) is completely removed.
  - The 3 tactile 3D coin buttons (**SCAN**, **RECEIVE**, **WITHDRAW**) are permanently rendered directly inside the front leather pocket flap.
- **Zero Dark Container / Background (Seamless Leather Match)**:
  - Zero dark black/purple background box (`bg-[#180528]`, borders, and shadows removed).
  - The 3 coins sit natively on the purple leather material with banknote guilloche watermark.
  - Zero rectangular hover/focus highlight (`hover:bg-white/10` removed, `select-none outline-none`).
- **Direct Tap-to-Hide Balance Privacy (No Eye Button & No Context Guide)**:
  - The separate Eye / EyeOff button is completely removed from the pocket flap.
  - Users toggle balance visibility (`••••••••` vs real balance) by tapping directly on the balance numbers.
  - Zero context guides, tooltips, or clutter labels for an ultra-clean skeuomorphic design.
- **3D Coin Buttons**:
  1. **SCAN**: Sapphire Cyan circle with milled rim and `ScanLine` icon.
  2. **RECEIVE**: Emerald Green circle with milled rim and `ArrowDownLeft` icon.
  3. **WITHDRAW**: Amber Gold circle with milled rim and `ArrowUpRight` icon.

---

## 2. Mandatory WEI Coin Terminology & Supported Currencies Directives
- **Strict Supported Currencies (3 Only)**: The platform strictly supports **WEI COIN** (in-game asset), **US Dollar** (`USD` / `$`), and **Cambodian Riel** (`KHR` / `៛`).
- **Complete Elimination of TON, PTS, and SAR**: All references to `TON`, `PTS` (generic points), and `SAR` are completely prohibited and excluded from the codebase, UI, and exchange engines.
- **Universal Currency Terminology**: All in-game points, claim rewards, upgrade costs, and conversion listings MUST strictly use the term **WEI COIN** (or **WEI** / **$WEI**).
- **Strict Prohibition of "PTS"**: Generic abbreviations such as "PTS" or generic "points" are strictly prohibited in user-facing UI, notification feeds, or button labels.
- **Conversion Standards**:
  - `100 WEI COIN = $1.00 USD`
  - `100 WEI COIN = 4,100 KHR (Cambodian Riel)`
- **Economy Terms & Logic**: Users claim, play, collect, and earn WEI Coin every day through daily check-in, tapping, interactive mini-games, and completing verified missions. Users exchange their collected WEI Coin directly into virtual currencies: Cambodian Riel (KHR ៛) and US Dollar (USD $).

---

## 3. Brand Mascot Standard: Weibot
- **Component**: `src/components/brand/ShiliaiweiMascot.tsx`
- **Visual Design**:
  - Electric Cyan (`#00A3FF`) to Royal Blue (`#0066FE`) spherical coat with feline ear crests.
  - Large glossy indigo eyes with dual specular highlight points.
  - Polished gold collar emblem stamped with `[WEI]`.
- **4 Distinct Poses**:
  - `idle`: Harmonic floating hover with soft shadow pulsation.
  - `wave`: Raised welcoming greeting paw.
  - `announce`: Retro red/white megaphone with dual acoustic soundwave arcs.
  - `cheer`: Dual raised victory arms with star spark bursts.
- **Integration**: Placed interactively in `TapGameView.tsx` with tap-to-cycle pose interactivity and haptic feedback.

---

## 4. Universal Application Across All Shapes & Skeuomorphic Card Style

All agent skills, workflows, and frontend components MUST ALWAYS apply the **3D Skeuomorphic Purple Leather Wallet Design & Skeuomorphic Card Style** across all brand shapes, card containers, dialogs, and settings modules:

1. **Brand Shape Design & 5 Master Pocket Colorways**:
   - **Master Purple Leather Pocket**: `from-[#5c1c99] via-[#48127f] to-[#320a59]`, thread stitching `#e9d5ff`, drop shadow `0 18px 40px -10px rgba(35, 6, 65, 0.75)`. Used for hero cards, wallet containers, and primary modals.
   - **Banknote Blue Pocket**: `from-[#1d4ed8] via-[#1e40af] to-[#172554]`, thread stitching `#93c5fd`, shadow `0 16px 36px -10px rgba(30, 64, 175, 0.45)`. Used for Personal Info and Identity cards.
   - **Emerald Green Pocket**: `from-[#0f766e] via-[#115e59] to-[#134e4a]`, thread stitching `#6ee7b7`, shadow `0 16px 36px -10px rgba(13, 148, 136, 0.45)`. Used for Contact, Security, and Verified badges.
   - **Indigo Address Pocket**: `from-[#4338ca] via-[#3730a3] to-[#312e81]`, thread stitching `#c7d2fe`, shadow `0 16px 36px -10px rgba(67, 56, 202, 0.45)`. Used for physical and delivery addresses.
   - **Slate System Pocket**: `from-[#1e293b] via-[#0f172a] to-[#020617]`, thread stitching `#94a3b8`, shadow `0 16px 36px -10px rgba(15, 23, 42, 0.55)`. Used for Display, Haptics, Device, and System settings.

2. **Every Card & Pocket Shape Must Include**:
   - `LeatherGrain`: Radial dot matrix overlay (`mix-blend-overlay`, opacity `0.15`).
   - `GuillocheBackground`: Security banknote watermark overlay (`/backgrounds/cardbanknote.svg`, opacity `0.20-0.25`).
   - `ThreadStitching`: Perimeter SVG dashed rectangle (`stroke-dasharray="4 4"`, strokeWidth `1.2px`, drop shadow `0 1px 1px rgba(0,0,0,0.6)`).
   - `SpecularRim`: Top hairline gradient specular highlight (`h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent`).
   - Rounded corners: `rounded-[28px]` outer radius.

3. **Modals, Dialogs & Edit Sheets**:
   - Never use flat white or plain gray backgrounds for modals or settings sheets.
   - Every modal container must be built as a physical 3D purple leather pocket with Guilloche background, perimeter thread stitching, and specular rim.
   - Input fields: Frosted dark glass pills (`bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30`).
   - Primary buttons: Cyan/Blue tactile bevel pills (`bg-gradient-to-r from-[#0098ea] to-[#0081c7] shadow-[0_4px_16px_rgba(0,152,234,0.4)]`).

4. **Bottom Navigation Dock & Floating Controls**:
   - Construct dock frames with the deep purple leather gradient (`#5c1c99` -> `#340b5c`).
   - Inset perimeter thread stitching, Keyline icons, and luminous indicator pills.

---

## 5. Strict Compliance Rules
- **ZERO EMOJIS**: Strictly no emojis anywhere in UI, copy, responses, or code.
- **Exclusive Keyline Icons**: Use Keyline stroke-based vector icons exclusively from `https://keylineicons.com/icons` (`@/components/icons/KeylineIcons`). Outside icon packages (lucide-react, heroicons, fontawesome) are strictly prohibited.
- **All Agents Instruction**: Whenever designing, refactoring, or generating views, cards, or dialogs, all agent skills MUST ALWAYS apply the `skeuomorphic-purple-leather-wallet-design/` and Skeuomorphic Card Style standard.
- **Performance Standard**: Sub-3-second load times via `next/dynamic` code splitting, `React.memo` re-render elimination, and throttled network sync.
- **Single Source of Truth**: Wallet component lives in `src/components/cards/BanknoteCreditCards.tsx` and Settings in `src/components/views/UserSettingsView.tsx`.
