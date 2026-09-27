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

### 3. Stacked Cards in Top Slot & Dynamic Currency Switcher
- **Rear Layer**: Dark indigo/purple card top rim (`#3B0764`, opacity `0.80`, `rounded-t-[20px]`) visible behind the primary card.
- **Front Primary Card (Sticky Currency Card)**:
  - Satin gradient: `linear-gradient(135deg, #D8B4FE 0%, #C084FC 40%, #A855F7 75%, #9333EA 100%)`.
  - Specular sheen: Diagonal top-left light wash (`linear-gradient(115deg, rgba(255,255,255,0.7) 0%, transparent 60%)`).
  - Cardholder & Telegram Owner: Shows authenticated Telegram `@username` paired directly with the official blue Telegram Verified Badge (`TelegramVerifiedBadge`).
  - Interactive Lift & Currency Toggle: Tapping the card plays an upward lift animation (`-translate-y-3.5`) and cycles the active balance display between `$ USD`, `៛ KHR`, and `SAR`.
  - Sticky Persistence: The user's chosen currency preference is saved to `localStorage ("shi_wallet_currency")` and restored on startup.

### 4. Front Leather Pocket Flap & Curved Lip
- **Curved Lip Geometry**: Scooped down in the center by `6px–12px` to reveal the stacked cards.
- **Rolled Edge Highlight**: Upper specular highlight rim (`h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent`).
- **Inner Pocket Shadow**: Casts an upward shadow onto the card slot (`box-shadow: 0 -8px 20px -4px rgba(25, 4, 45, 0.6)`).

### 5. Frosted Glassmorphism Controls
- **Translucent Pill Button (`+ Add Balance`)**:
  - Background: `rgba(255, 255, 255, 0.15)` with `hover:bg-white/25`
  - Border: `1px solid rgba(255, 255, 255, 0.20)`
  - Backdrop Blur: `backdrop-blur-md`
  - Tactile Bevel: `box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.35), 0 4px 12px rgba(0, 0, 0, 0.18)`
  - Active State: `active:scale-95`
- **Circular Utility Buttons**:
  - Geometry: `42px x 42px` rounded circle (`rounded-full`).
  - Icons:
    - Transfer / Swap: Keyline arrow swap icon (`KeylineArrowUpDown`).
    - Visibility Toggle: Eye / EyeOff.

---

## 2. Mandatory WEI Coin Terminology Directives
- **Universal Currency Terminology**: All in-game points, claim rewards, upgrade costs, and conversion listings MUST strictly use the term **WEI COIN** (or **WEI** / **$WEI**).
- **Strict Prohibition of "PTS"**: Generic abbreviations such as "PTS" or generic "points" are strictly prohibited in user-facing UI, notification feeds, or button labels.
- **Conversion Standards**:
  - `100 WEI COIN = $1.00 USD`
  - `100 WEI COIN = 4,100 KHR (Cambodian Riel)`
  - `100 WEI COIN ≈ 3.75 SAR`
  - `500 WEI COIN ≈ 1 TON`

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

## 4. Universal Application Across All Shapes

When applying this style across secondary modules and shapes:

1. **Banners & Promo Cards**:
   - Wrap containers in the 3D purple leather texture with perimeter simulated stitching (`strokeDasharray="4 4"`).
   - Use inset curved card slots, satin gradient badges, and frosted glass action pills.
2. **Bottom Navigation Dock**:
   - Construct the dock frame with the deep purple leather gradient (`#5c1c99` -> `#340b5c`).
   - Inset perimeter thread stitching and luminous indicator pill.
3. **Modals & Dialogs**:
   - Style dialog containers as leather pocket cards with embossed perimeter stitching and soft ambient backdrop glows.
4. **Action Buttons**:
   - Apply the frosted glassmorphism pill with white border and inner specular highlight.

---

## 5. Strict Compliance Rules
- **ZERO EMOJIS**: Strictly no emojis anywhere in UI, copy, or code.
- **Real SVG Vector Icons**: Use Keyline stroke-based vector icons exclusively.
- **Performance Standard**: Sub-3-second load times via `next/dynamic` code splitting, `React.memo` re-render elimination, and throttled network sync.
- **Single Source of Truth**: Component lives in `src/components/cards/BanknoteCreditCards.tsx` with unified props.
