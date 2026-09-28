---
name: keyline-icons-official-standard
description: Authoritative standard and architectural specification for Official Keyline Icons across the SHILIAIWEI platform. Mandates using strictly and exclusively Keyline Icons from https://keylineicons.com/icons (@keyline-icons/react/two-tone) exported via src/components/icons/KeylineIcons.tsx. Strictly prohibits any outside icon packages (lucide-react, heroicons, react-icons, fontawesome) and emojis. Trigger on: "keyline icons", "official icons", "keylineicons", "icon standard", "icon library", "replace icons".
---

# OFFICIAL KEYLINE ICONS STANDARD & EXCLUSIVE SPECIFICATION

This specification establishes the authoritative, mandatory Icon Standard for the **SHILIAIWEI** platform. It strictly enforces the exclusive use of official **Keyline Icons** sourced from `https://keylineicons.com/icons`.

---

## 1. Core Directives

### 1. Exclusive Single Source of Truth
- **Official Source**: `https://keylineicons.com/icons` (`@keyline-icons/react/two-tone`).
- **Export Gateway**: Every icon used across the entire codebase MUST be imported from `@/components/icons/KeylineIcons` (`src/components/icons/KeylineIcons.tsx`).
- **Zero Outside Icon Libraries**:
  - Strictly **PROHIBITED**: `lucide-react`, `@heroicons/react`, `react-icons`, `@tabler/icons`, `fontawesome`, or unvetted SVG icon dumps.
  - Zero outside icon package imports in any `.tsx`, `.ts`, `.jsx`, or `.js` file.
- **Zero Emojis**:
  - Strictly NO EMOJIS in UI, code, responses, or metadata under any circumstances.

### 2. Keyline Vector Geometry Specifications
- **Grid Architecture**: 24x24 px square viewBox (`viewBox="0 0 24 24"`).
- **Stroke Geometry**:
  - `strokeWidth`: `1.5` or `2.0` (matching Keyline two-tone style).
  - `strokeLinecap`: `round`.
  - `strokeLinejoin`: `round`.
  - `fill`: `none` for primary stroke outlines.
- **Two-Tone Fill Layer**:
  - Keyline icons feature a soft tint background layer: `fill="currentColor" fillOpacity="0.35" stroke="none"`.
- **Props Standard**:
  ```tsx
  export interface KeylineIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    className?: string;
  }
  ```

---

## 2. Standard Registered Icons

All of the following icons are officially exported from `src/components/icons/KeylineIcons.tsx`:

| Category | Keyline Icons |
|---|---|
| **Navigation & Controls** | `ChevronRight`, `ChevronLeft`, `ChevronDown`, `SlidersHorizontal` (`Sliders`), `Settings`, `RefreshCw`, `Grid2x2` |
| **User & Profile** | `User`, `Camera`, `Mail`, `Phone`, `Calendar`, `Globe`, `Home`, `Briefcase`, `Building`, `MapPin`, `Award` |
| **Wallet & Commerce** | `Wallet`, `Coins`, `DollarSign`, `KeylineArrowUpDown`, `ArrowUpRight`, `ArrowDownLeft`, `QrCode`, `Scan`, `ScanLine`, `Copy` |
| **System & Media** | `Volume`, `VolumeLow`, `VolumeOff`, `Smartphone`, `Sun`, `Moon`, `Monitor`, `Cloud`, `Timer`, `Check`, `CircleCheck` (`CheckCircle2`), `X`, `CircleAlert`, `Info` |
| **Security & Badges** | `Shield`, `ShieldCheck`, `Eye`, `EyeOff`, `TelegramVerifiedBadge` |
| **Gaming & Rewards** | `KeylineGamepad`, `KeylineGem` (`Gem`), `Trophy`, `Gift`, `Crown`, `Star`, `Flame`, `Zap`, `Sparkles`, `TrendingUp`, `Play`, `CirclePlay` |

---

## 3. Adding New Icons

If a view requires a new icon:
1. Search `https://keylineicons.com/icons` or check `@keyline-icons/react/two-tone`.
2. Add the export to `src/components/icons/KeylineIcons.tsx`.
3. If an icon is custom-drawn, construct it strictly on the 24x24 grid with `strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"` and two-tone layer `fillOpacity="0.35"`.
4. Import into the consumer component exclusively from `@/components/icons/KeylineIcons`.
