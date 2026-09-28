---
name: shiliaiwei-delivery-map-address-system
description: Authoritative architectural standard and delivery map address pinpointing system for the SHILIAIWEI Telegram Mini App. Defines interactive 3D map location pin drop, OpenStreetMap Nominatim reverse geocoding via GPS and local network IP, action required placeholder alerts for unfilled profile and address fields, and skeuomorphic purple leather wallet design integration.
---

# SHILIAIWEI Delivery Map & Physical Address Pinning System

Authoritative architectural standard and delivery-app style map pinpointing system for the **SHILIAIWEI** Telegram Mini App.

## 1. Architectural Overview

The SHILIAIWEI delivery address framework ensures seamless physical delivery, order routing, and profile completeness by integrating:
- **Interactive Delivery Map Pinpoint**: Delivery-app style map canvas (Grab, Uber Eats, DoorDash, Google Maps) with live 3D bouncing pin marker and radar pulse.
- **Physical Reverse Geocoding**: Dual-source geocoding via device GPS coordinates (`lat`/`lng`) and client local network IP fallback (`/api/geocode/locate`) backed by OpenStreetMap Nominatim.
- **Action Required Placeholder Alerts**: Prominent amber alert containers displayed whenever Home, Work, or Other addresses (or profile personal details) are incomplete.
- **Profile Readiness Progress Engine**: Dynamic calculation of profile completion percentage (0-100%) with instant quick-action navigation chips.
- **Skeuomorphic Purple Leather Wallet Integration**: 3D pebble-grain leather, perimeter thread stitching, Guilloche banknote watermark, specular rim, and Keyline icons.
- **Zero Redundant Navigation**: Complete removal of `(Exit to Home View)` buttons in favor of standard native header Back controls.
- **Zero Emojis & Keyline Icons Exclusivity**: 100% vector Keyline icons (`https://keylineicons.com/icons`) with strictly NO outside icon libraries and NO emojis.

---

## 2. Physical Geocoding Backend Endpoint (`/api/geocode/locate`)

### Endpoint Specifications
- **Route**: `GET /api/geocode/locate?lat={lat}&lng={lng}`
- **Source Resolution Priority**:
  1. **Device GPS**: Explicit `lat` and `lng` query parameters from `navigator.geolocation`.
  2. **Local Network Client IP**: Extracted from `x-forwarded-for` or `cf-connecting-ip`. Resolves public client IP coordinates via IP geolocation.
  3. **Phnom Penh Delivery Hub Fallback**: Coordinates `11.5564, 104.9282` (Independence Monument / BKK1).
- **Physical Address Provider**: OpenStreetMap Nominatim API (`https://nominatim.openstreetmap.org/reverse`) with custom User-Agent and English/Khmer locale:
  ```http
  User-Agent: SHILIAIWEI-MiniApp-DeliveryRouter/1.0 (contact: admin@kesararamwithdigital.tech)
  Accept-Language: en,km
  Zoom: 18
  AddressDetails: 1
  ```
- **Response Schema**:
  ```json
  {
    "success": true,
    "source": "gps" | "ip_network" | "fallback",
    "coordinates": { "lat": 11.5564, "lng": 104.9282 },
    "address": {
      "street": "Preah Sihanouk Blvd",
      "unit": "Delivery Point",
      "city": "Phnom Penh",
      "stateProvince": "Khan Boeng Keng Kang",
      "postalCode": "120102",
      "country": "Cambodia",
      "displayName": "Preah Sihanouk Blvd, Sangkat Boeng Keng Kang Ti Muoy, Khan Boeng Keng Kang, Phnom Penh, Cambodia"
    }
  }
  ```

---

## 3. Interactive Delivery Map Picker Modal (`DeliveryMapPickerModal.tsx`)

### Component Architecture
- **Interactive Map Canvas**: Dark grid with glowing road lines, animated traffic flows, and crosshair targeting.
- **Bouncing 3D Location Pin**:
  - Top teardrop marker with inner white core and glowing shadow.
  - Directional downward pointer notch.
  - Concentric radar ripple pulse (`animate-ping`) beneath the pin tip.
- **Auto-Detection Mechanisms**:
  - Automatically queries `navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true })` on open.
  - Automatically falls back to `/api/geocode/locate` network IP resolution if GPS permission is denied or pending.
- **Landmark Delivery Hub Presets**:
  - Independence Monument (`11.5564, 104.9282`) - BKK1 / Chamkarmon
  - Canadia Tower (`11.5724, 104.9213`) - Daun Penh Financial District
  - BKK1 Commercial Hub (`11.5492, 104.9248`) - St. 51 / Boeng Keng Kang
  - Toul Kork Center (`11.5750, 104.8980`) - St. 315 / Khan Toul Kork
- **Unit & Suite Refinement**: Dedicated input field for apartment, suite, building, or floor details.
- **Confirm & Save**: Invokes `onConfirm(address)` and updates `homeAddress`, `workAddress`, or `otherAddress` in both local cache and Telegram CloudStorage.

---

## 4. Incomplete Placeholder Alerts & Profile Readiness

### Address Validation Engine (`isAddressEmpty`)
An address is considered incomplete if:
```typescript
export function isAddressEmpty(addr?: AddressDetails | null): boolean {
  if (!addr) return true;
  return !addr.street || !addr.street.trim() || !addr.city || !addr.city.trim() || addr.street === "Not set";
}
```

### Incomplete Address Card State (Action Required)
When `isAddressEmpty(addr)` is true:
- Container: Amber dashed border (`border-2 border-dashed border-amber-400/50 bg-amber-500/10 rounded-2xl p-3.5`).
- Alert Badge: `[ ACTION REQUIRED: Incomplete Address ]` with `CircleAlert` icon.
- Copy: Clear instruction explaining that no physical delivery location is pinned.
- Primary CTA Button: `[ Pin on Delivery Map (GPS & IP) ]` with `Navigation` icon.
- Secondary Button: `[ Manual ]` to edit form fields directly.

### Verified Address Card State
When filled:
- Container: Skeuomorphic frosted glass card (`bg-white/10 border border-white/15 rounded-2xl p-3`).
- Verified Badge: `[ Verified Physical Address ]` with `CircleCheck` icon in emerald green.
- Actions: `[ Re-Pin on Map ]` and `[ Edit Details ]`.

### Profile Readiness Banner
Rendered under the Hero Card when `profileCompletion.percentage < 100`:
- Headline: `Profile Readiness: X%` (e.g. `5/9 Done`).
- Subtitle: `Y essential items incomplete. Fill to enable seamless delivery, physical pin on map, and instant checkout.`
- Progress Bar: Amber-to-yellow glowing gradient bar reflecting exact completed fields.
- Quick-Action Chips: Tap-to-open buttons for each incomplete item (`+ Full Name`, `+ Home Address`, `+ Work Address`, `+ Phone Number`, etc.).

---

## 5. UI Cleanliness & Navigation Rules

- **Zero "Exit to Home View" Buttons**: Never render text or buttons labeled `(Exit to Home View)`. All subviews and modals MUST rely solely on the standard top header Back navigation button (`ChevronLeft`).
- **Cloudflare / Telegram Gate Screen Rephrasing**:
  - Heading 1: **តើមានអ្វីកើតឡើង?** (What happened?)
  - Body 1: `ការចូលមើលទំព័រនេះត្រូវបានកំណត់ ដើម្បីរក្សាសុវត្ថិភាពជូនអ្នក។ មុនពេលបង្ហាញព័ត៌មានគណនី និងទិន្នន័យក្នុងឃ្លាំងសុវត្ថិភាព (Vault) ប្រព័ន្ធត្រូវតែផ្ទៀងផ្ទាត់សម័យចូលប្រើរបស់អ្នកជាមុនសិន។`
  - Heading 2: **តើខ្ញុំត្រូវធ្វើដូចម្តេច?** (What should I do?)
  - Body 2: `សូមចូលទៅកាន់ ឆានែលផ្លូវការរបស់យើង (@shiliaiwei) ដើម្បីទទួលបានព័ត៌មានបន្ថែម រួចចាប់ផ្តើមតាមរយៈបូតតេឡេក្រាមផ្លូវការ @srievibot។ បូតនឹងផ្ទៀងផ្ទាត់សម័យចូលប្រើរបស់អ្នកដោយស្វ័យប្រវត្តិ ហើយអ្នកអាចចូលប្រើបានភ្លាមៗដោយសុវត្ថិភាព។`

---

## 6. Official Keyline Icons Exclusivity

All icons must be imported from `@/components/icons/KeylineIcons`:
- `MapPin`, `Map`, `Navigation`, `CircleNavigation`, `Compass`
- `CircleAlert`, `CircleCheck`, `Check`, `CheckCircle2`
- `Home`, `Briefcase`, `Building`, `User`, `Mail`, `Phone`, `Calendar`
- Strictly NO `lucide-react`, `heroicons`, `react-icons`, or emojis.
