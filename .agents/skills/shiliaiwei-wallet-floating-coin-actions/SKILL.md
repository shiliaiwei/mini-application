---
name: shiliaiwei-wallet-floating-coin-actions
description: Authoritative design standard and architectural specification for SHILIAIWEI 3D Wallet Floating Coin Actions Pod, Icon-Only Plus Trigger, and Skeuomorphic Receive QR Modal. Defines tactile coin token physics, 3D milled rim geometry, 45-degree plus-to-close rotation, ambient glow states, and quick actions for Scan, Receive, and Withdraw. Trigger on: "wallet quick actions", "floating coin", "wallet actions pod", "scan receive withdraw", "coin design", "wallet plus sign", "skeuomorphic receive modal".
---

# SHILIAIWEI WALLET FLOATING COIN ACTIONS & QUICK ACTIONS SPECIFICATION

This specification establishes the authoritative, permanent design and component architecture for the **SHILIAIWEI Wallet Floating Coin Actions Pod, Icon-Only Plus Trigger, and Skeuomorphic Receive Modal**.

---

## 1. Icon-Only Plus Sign Trigger Button

### 1. Zero Text Mandate
- The wallet card front pocket MUST NOT display text labels such as `"Add Balance"`.
- The trigger button MUST strictly feature **only the plus sign vector icon (`+`)**.

### 2. Geometry & Touch Target
- **Shape**: Perfect circular button (`w-10 h-10 sm:w-11 sm:h-11 rounded-full`).
- **Placement**: Directly paired adjacent to the circular Eye visibility toggle button on the left side of the front pocket action row.
- **Styling**:
  - Inactive / Resting state:
    ```tsx
    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all duration-300 ease-out border border-white/20 backdrop-blur-md flex items-center justify-center text-white cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_16px_rgba(0,0,0,0.25)]"
    ```
  - Active / Open state:
    ```tsx
    className="bg-gradient-to-br from-[#0098ea] to-[#005f99] border-cyan-300 ring-2 ring-cyan-400/40 rotate-45 shadow-[0_0_16px_rgba(0,152,234,0.6)]"
    ```
- **45-Degree Morph Animation**:
  - When tapped, the plus icon smoothly rotates 45 degrees (`rotate-45`), organically transforming into a dismissal close mark (`x`).

---

## 2. Floating Quick Actions Coin Pod

### 1. Container Pod Architecture
- Positioned immediately within/elevated above the front wallet pocket below the action row.
- **Elevation & Material**:
  - Gradient: `bg-gradient-to-b from-[#180528]/95 via-[#0e021a]/95 to-[#080110]/95`
  - Border: `border border-purple-300/25 backdrop-blur-xl`
  - Specular Rim: `h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent`
  - Shadows: `shadow-[0_16px_36px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.35)]`
  - Corner Radius: `rounded-2xl`
  - Motion Entrance: Smooth fade & spring scale (`animate-fadeIn`).

### 2. Header Status Strip
- **Left Indicator**: Pulsing cyan live status dot (`w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse`) with text `FLOATING QUICK ACTIONS` in `text-[10px] font-black uppercase tracking-widest text-cyan-200`.
- **Right Badge**: Monospace container badge `WALLET COIN` in `text-[9px] font-mono font-bold text-white/50 px-2 py-0.5 rounded-full bg-white/10 border border-white/10`.

---

## 3. 3D Floating Coin Token Anatomy (Icon + Title)

The quick action pod hosts exactly 3 tactile coin tokens arranged in a 3-column responsive grid (`grid grid-cols-3 gap-2 sm:gap-3`):

```
+-----------------------------------------------------------+
|  * FLOATING QUICK ACTIONS                     WALLET COIN |
|                                                           |
|       ( [ ] )               ( [v] )             ( [^] )   |
|        SCAN                 RECEIVE            WITHDRAW   |
+-----------------------------------------------------------+
```

### 1. Coin Token 1: SCAN
- **Purpose**: Opens QR camera scanner or peer-to-peer address scanner.
- **Coin Visual**: Circular 3D coin (`w-12 h-12 sm:w-13 sm:h-13 rounded-full`).
- **Gradient**: Sapphire Blue `from-[#0098ea] via-[#0088cc] to-[#005f99]`.
- **Milled Rim**: Inset double concentric ring (`absolute inset-1 rounded-full border border-white/30`).
- **Specular & Shadow**:
  - Border: `border-2 border-cyan-300/50`
  - Shadow: `0 8px 20px -3px rgba(0, 152, 234, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.5), inset 0 -2px 3px rgba(0, 0, 0, 0.4)`
- **Icon**: `ScanLine` (`size={22}`, white, drop shadow).
- **Title**: `SCAN` (`text-xs font-black tracking-wider text-white uppercase drop-shadow-xs`).
- **Action**: Triggers `onOpenScan()` to navigate to the camera QR scanning view.

### 2. Coin Token 2: RECEIVE
- **Purpose**: Opens the skeuomorphic Vault Deposit QR modal.
- **Coin Visual**: Circular 3D coin (`w-12 h-12 sm:w-13 sm:h-13 rounded-full`).
- **Gradient**: Emerald Green `from-[#10b981] via-[#059669] to-[#047857]`.
- **Milled Rim**: Inset double concentric ring (`absolute inset-1 rounded-full border border-white/30`).
- **Specular & Shadow**:
  - Border: `border-2 border-emerald-300/50`
  - Shadow: `0 8px 20px -3px rgba(16, 185, 129, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.5), inset 0 -2px 3px rgba(0, 0, 0, 0.4)`
- **Icon**: `ArrowDownLeft` (`size={22}`, white, drop shadow).
- **Title**: `RECEIVE` (`text-xs font-black tracking-wider text-white uppercase drop-shadow-xs`).
- **Action**: Opens the integrated Skeuomorphic Receive Modal.

### 3. Coin Token 3: WITHDRAW
- **Purpose**: Opens token transfer / cash-out subview.
- **Coin Visual**: Circular 3D coin (`w-12 h-12 sm:w-13 sm:h-13 rounded-full`).
- **Gradient**: Amber/Gold `from-[#f59e0b] via-[#d97706] to-[#b45309]`.
- **Milled Rim**: Inset double concentric ring (`absolute inset-1 rounded-full border border-white/30`).
- **Specular & Shadow**:
  - Border: `border-2 border-amber-300/50`
  - Shadow: `0 8px 20px -3px rgba(245, 158, 11, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.5), inset 0 -2px 3px rgba(0, 0, 0, 0.4)`
- **Icon**: `ArrowUpRight` (`size={22}`, white, drop shadow).
- **Title**: `WITHDRAW` (`text-xs font-black tracking-wider text-white uppercase drop-shadow-xs`).
- **Action**: Triggers `onOpenSend()` to open the currency transfer / withdrawal subview.

---

## 4. Skeuomorphic Receive Modal Architecture

### 1. Modal Container
- Backdrop: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn`.
- Card Body:
  - Gradient: `from-[#064e3b] via-[#043328] to-[#021f18]` (Deep Emerald Banknote).
  - Background Texture: `cardbanknote.svg` fine-line guilloche overlay with 25% opacity.
  - Specular Rim: `h-[1.5px] bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent`.
  - Border: `border border-emerald-400/35`.
  - Shadows: `shadow-[0_24px_60px_-12px_rgba(4,120,87,0.6),inset_0_2px_3px_rgba(255,255,255,0.35),inset_0_-3px_6px_rgba(0,0,0,0.5)]`.
  - Radius: `rounded-[32px]`.

### 2. High-Contrast QR Code Visual
- Rendered in a high-contrast white container (`w-48 h-48 sm:w-52 sm:h-52 rounded-2xl bg-white p-4 shadow-inner`).
- Features authentic 3-corner finder patterns with cyan/blue accents and central 3D `WEI` brand badge.

### 3. Destination Address Pill
- Dark contrast container (`bg-black/40 border border-white/15 rounded-2xl p-3`).
- Displays full cryptographic vault address with monospace formatting.
- Integrated copy button provides immediate feedback (`COPIED` indicator, green highlight, and Telegram success haptic feedback).

### 4. Network Badging
- `Network: SHILIAIWEI L2 • TON Mainnet (Zero Fee)` in `text-[10px] text-emerald-100/70`.
