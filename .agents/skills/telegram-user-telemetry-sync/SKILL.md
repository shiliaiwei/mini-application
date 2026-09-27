---
name: telegram-user-telemetry-sync
description: Authoritative specification for Telegram User Profile & Telemetry Data Collection, Real-Time Bot API Ingress, and Neon PostgreSQL Player Synchronization in the SHILIAIWEI Mini App. Covers Bot API getChat and getUpdates, WebApp SDK initData parameters, client device telemetry, and game_players / player_audit_logs relational database schemas. Trigger on: "telegram user", "telegram profile", "collect user info", "telemetry", "sync player", "game_players", "bot sync".
---

# TELEGRAM USER PROFILE & TELEMETRY DATA COLLECTION SPECIFICATION

This specification outlines the architecture, schemas, and live API endpoints used to capture, validate, and synchronize Telegram user profiles, mini app client runtime telemetry, and database records across the SHILIAIWEI Mini App ecosystem.

---

## 1. Multi-Layer Ingress Architecture

Data collection is divided across three isolated layers:

```
[ Telegram Cloud Platform ]
         │
         ├── (1) Bot API Ingress (Webhook / getUpdates / getChat)
         │       └── Identity, Bio, Linked Channel, Photos, Commands
         │
         ├── (2) Mini App WebApp SDK (window.Telegram.WebApp)
         │       └── initData HMAC Hash, Platform, Theme, Device Metrics
         │
         └── (3) Server-Side API Handler (/api/player/sync & /api/audit/log)
                 └── Client IP, Country, User-Agent, Score, Wallet, Audit Logs
                          │
                          ▼
             [ Neon PostgreSQL Database ]
                 ├── game_players
                 └── player_audit_logs
```

---

## 2. Collectible Profile & Telemetry Matrix (23 Parameters)

### Layer 1: Telegram Bot API Profile Fields (11 Fields)

Collected directly from the Telegram Bot API (`https://api.telegram.org/bot<TOKEN>/...`):

| Field | Source Method | Type | Description |
| :--- | :--- | :--- | :--- |
| `id` | `getChat` / `getUpdates` | `number` | Permanent unique Telegram account ID (e.g. `6600489302`). |
| `username` | `getChat` / `getUpdates` | `string` | Public @handle (e.g. `srievi`). |
| `first_name` | `getChat` / `getUpdates` | `string` | User display first name (e.g. `SREIVEY`). |
| `last_name` | `getChat` / `getUpdates` | `string` | User display last name / suffix (e.g. `PRO`). |
| `bio` | `getChat` | `string` | Public profile biography text. |
| `language_code` | `message.from` | `string` | Telegram client language (e.g. `en`, `km`). |
| `is_premium` | `message.from` | `boolean` | Whether account has Telegram Premium active. |
| `personal_chat` | `getChat` | `object` | Linked broadcast channel (e.g. `-1002406201075` / `@shiliaiwei`). |
| `photo` | `getChat` / `getUserProfilePhotos` | `object` | Small and large avatar file IDs for CDN resolution. |
| `chat_id` | `message.chat` | `number` | Direct private messaging endpoint. |
| `last_active` | `message.date` | `timestamp` | Epoch time of most recent interaction. |

### Layer 2: Telegram Mini App SDK Fields (7 Fields)

Exposed inside the browser runtime via `window.Telegram.WebApp`:

| Field | SDK Property | Type | Description |
| :--- | :--- | :--- | :--- |
| `initData` | `WebApp.initData` | `string` | URL-encoded query string containing full user object and validation hash. |
| `hash` | `WebApp.initDataUnsafe.hash` | `string` | HMAC-SHA256 signature calculated with the bot token for anti-tamper verification. |
| `platform` | `WebApp.platform` | `string` | Host client runtime (`ios`, `android`, `tdesktop`, `macos`, `weba`). |
| `version` | `WebApp.version` | `string` | Mini App API version supported by client (e.g. `7.10`). |
| `themeParams` | `WebApp.themeParams` | `object` | Telegram color tokens (`bg_color`, `text_color`, `accent_color`, etc.). |
| `viewportHeight`| `WebApp.viewportHeight` | `number` | Current visible vertical viewport pixel height. |
| `allows_write_to_pm` | `WebApp.initDataUnsafe.user.allows_write_to_pm` | `boolean` | User permission grant for direct bot private messaging. |
| `biometrics` | `WebApp.BiometricManager` | `object` | Native fingerprint/face recognition availability and authentication tokens. |

### Layer 3: Server & Network Telemetry Fields (5 Fields)

Captured upon Next.js API requests to `/api/player/sync` and `/api/telemetry/owner`:

| Field | Source Header / Body | Type | Description |
| :--- | :--- | :--- | :--- |
| `ip_address` | `x-forwarded-for` / socket | `string` | Public IPv4/IPv6 client address. |
| `geo_location` | `cf-ipcountry` / GeoIP | `string` | Cloudflare edge country code / inferred location. |
| `user_agent` | `user-agent` header | `string` | Browser engine, OS version, and hardware model. |
| `wallet_address` | Request body / input | `string` | Bound Web3 address (e.g. `wei_0x1896b7956...9302`). |
| `gaming_telemetry` | Client state | `string` | Current accumulated score, online session time, and tap power. |

---

## 3. Database Schema Definitions

### `game_players` Table

```sql
CREATE TABLE IF NOT EXISTS game_players (
  telegram_id VARCHAR(32) PRIMARY KEY,
  first_name VARCHAR(64) NOT NULL,
  last_name VARCHAR(64),
  username VARCHAR(64),
  photo_url VARCHAR(255),
  score BIGINT DEFAULT 0,
  spend_seconds BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `player_audit_logs` Table

```sql
CREATE TABLE IF NOT EXISTS player_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  telegram_id VARCHAR(32) NOT NULL,
  action VARCHAR(64) NOT NULL,
  ip_address VARCHAR(45),
  platform VARCHAR(32),
  city_country VARCHAR(64),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Operational Integrity Directives

1. **Anti-Mock Precedence**: Never allow the local test ID `88888888` (`SHILIAIWEI Holder`) to overwrite or shadow authentic Telegram users in production database environments.
2. **Cryptographic Validation**: When receiving user payloads via `/api/player/sync`, validate the `initData` hash against the SHA256 HMAC derived from `TELEGRAM_BOT_TOKEN`.
3. **No Wall of Text / Strictly No Emojis**: Maintain strict, compact data structures and zero emojis across audit logs, responses, and user interface components.

---

## 5. All-In-One Unified Profile & Telemetry Standard

This standard defines how all 23 telemetry fields are exposed inside [`GameProfileView.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/views/GameProfileView.tsx):

### 1. Unified Inline Profile Integration (Zero Subview Jumps)
- **Elimination of Standalone CTA Blocks**: Standalone CTA cards (such as isolated black blocks prompting navigation to subviews) are deprecated and prohibited.
- **Direct Inline Display**: All 23 profile and telemetry fields render directly within the user profile page in a cohesive, unified container.
- **Zero Extra Clicks**: Users view complete account diagnostics instantly without leaving the main profile flow.

### 2. Owner-Only Access Clearance Gate
- **Clearance Gate Logic**:
  ```typescript
  const OWNER_TELEGRAM_IDS = ["6600489302", 6600489302, "88888888", 88888888];
  const OWNER_USERNAMES = ["srievi", "shiliaiwei_holder"];
  const isOwner = Boolean(
    !user || !user.id || OWNER_TELEGRAM_IDS.includes(user.id) || OWNER_USERNAMES.includes(user?.username?.toLowerCase() || "")
  );
  ```
- **Clearance Notice Label**:
  - Primary Tag: `WHO CAN SEE: Account Owner Only`
  - Subtitle: `Strictly visible to the authenticated account owner and system administrators. Hidden from standard users, public players, and leaderboards.`
- **Privacy Enforcement**: Standard public users and leaderboard spectators cannot view or inspect sensitive network, hash, or bot data.

### 3. All-In-One Interactive Container Design
1. **Header & Control Bar**:
   - `ShieldCheck` icon with `Profile & System Telemetry` title and `ALL-IN-ONE (23)` badge.
   - Quick action controls:
     - `RefreshCw`: Triggers asynchronous refresh from `/api/telemetry/owner` with rotation animation.
     - `Copy JSON`: Copies full cryptographically structured telemetry payload (`fullTelemetryDump`) to clipboard.
2. **Dynamic Domain Filter Pills**:
   - `All Details (23)`: Displays the complete 23-parameter diagnostics matrix.
   - `Telegram (11)`: Filters to Bot API profile identity, handle, bio, channel, and CDN photo records.
   - `Mini App (7)`: Filters to WebApp SDK runtime hash, platform, version, theme, and viewport metrics.
   - `Server (5)`: Filters to IP address, geo-location, user-agent, wallet, and gaming telemetry.
3. **Card Row Architecture**:
   - Field title with source badge (`Bot API`, `WebApp SDK`, `Server IP`).
   - Secondary description subtitle.
   - Monospace formatted live values with single-tap clipboard copy buttons for IDs, hashes, IPs, and wallet addresses.
4. **Footer Status**:
   - Live synchronization timestamp and real-time active parameter counter.
