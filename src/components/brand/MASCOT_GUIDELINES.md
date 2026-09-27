# SHILIAIWEI Brand Mascot Design Standards & Usage Guidelines

## 1. Mascot Identity & Character Concept
- **Official Name**: Weibot (SHILIAIWEI Companion)
- **Role**: AI and Web3 gaming companion across the SHILIAIWEI mini-app ecosystem.
- **Visual Archetype**: Spherical electric-blue celestial creature with feline ear tufts, large glossy anime-styled eyes, and a branded chest pendant.
- **Personality**: Energetic, welcoming, encouraging, precise, and tech-savvy.

---

## 2. Visual Anatomy & Proportions
- **Body Ratio**: 1:1 circular aspect ratio with soft squircle volume.
- **Coat & Fur Texture**: Electric cyan (`#00A3FF`) to Royal Blue (`#0066FE`) gradient with radial highlight rim lighting (`#38BDF8`).
- **Ear Tufts**: Dual-layer feline crests with lavender-pink inner recesses (`#F472B6`, `#E0E7FF`).
- **Eyes**: Large dark indigo ovals (`#0F172A`) featuring dual specular highlights (primary 3.5px upper reflection, secondary 1.5px lower reflection) and cyan iris rings.
- **Chest Emblem**: Circular polished gold charm (`#F59E0B`) bearing the authoritative brand mark `[WEI]`.

---

## 3. Pose States & Use Cases

| Pose ID | Visual Action | Primary Placement / Trigger |
| :--- | :--- | :--- |
| `idle` | Gentle harmonic floating with soft shadow pulsation | Default lobby state, wallet overview, ambient companionship |
| `wave` | Raised paw greeting with friendly tilted head | First-time onboarding, returning user session start |
| `announce` | Holding retro megaphone with dual acoustic soundwaves | System notifications, tournament broadcasts, daily task drops |
| `cheer` | Both arms outstretched upwards with victory particle sparks | Level up, daily streak claim, leaderboard top rank, jackpot win |

---

## 4. Color Palette Tokens

- **Brand Cyan (Fur Primary)**: `#00A3FF`
- **Royal Cobalt (Fur Depth)**: `#0066FE`
- **Sky Rim (Specular)**: `#38BDF8`
- **Vibrant Magenta (Inner Ear Accent)**: `#F472B6`
- **Metallic Gold (Chest Crest)**: `#F59E0B` / `#FDE68A`
- **Megaphone Red (Announce Prop)**: `#EF4444` / `#DC2626`
- **Deep Slate (Gaze & Contour)**: `#0F172A`

---

## 5. Technical Implementation & Accessibility
- **SVG Scalability**: Defined as pure vector SVG (`viewBox="0 0 100 100"`), rendering crisp geometry at any DPI.
- **Accessibility**: Includes `role="img"` and localized `aria-label` describing the active pose.
- **Component**: [`ShiliaiweiMascot.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/brand/ShiliaiweiMascot.tsx).
- **Interactive States**: Supports `hover:scale-105`, `active:scale-95`, and Telegram WebApp haptic vibration on tap.
- **Zero Emoji Compliance**: Strictly rendered without Unicode emoji characters.
