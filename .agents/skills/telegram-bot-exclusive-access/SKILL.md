---
name: telegram-bot-exclusive-access
description: Authoritative specification for ensuring the SHILIAIWEI application is accessible across both external web browsers and the Telegram Mini App Bot environment without restrictions, with mandatory Telegram account sync authentication. Covers Vercel Edge Middleware, Content-Security-Policy frame-ancestors, centralized request validation (isTelegramBotRequest), client-side Telegram account sync, and Deploy Checkpoint verification gates. Trigger on: "web and mini app", "telegram sync", "account sync", "unrestricted access", "telegram gate", "deploy checkpoint".
---

# TELEGRAM MINI APP & WEB UNRESTRICTED ACCESS WITH MANDATORY ACCOUNT SYNC SPECIFICATION

This specification defines the multi-layer architecture and verification mechanisms used to allow unrestricted access to the SHILIAIWEI application across both external web browsers and the official Telegram Mini App Bot (`@srievibot` / `https://t.me/srievibot/app`), while requiring that all user sessions have their account synced and authenticated via Telegram.

---

## 1. Multi-Layer Dual-Platform Architecture

The application enforces security and account sync across four cascading layers:

```
[ Incoming Request / Client Connection ]
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. VERCEL CDN & EDGE HEADERS (vercel.json & next.config.ts) │
│ • Content-Security-Policy: frame-ancestors 'self'           │
│   https://web.telegram.org https://*.telegram.org           │
│   https://desktop.telegram.org https://*.t.me;              │
│ • X-Robots-Tag: noindex, nofollow (Blocks search engines)   │
│ • X-Content-Type-Options: nosniff                           │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. EDGE MIDDLEWARE (src/middleware.ts)                      │
│ • Exempts: /api/bot/webhook (Telegram Bot event updates)    │
│ • Bypasses: Localhost (127.0.0.1, *.local) for dev testing │
│ • Inspects: User-Agent, tgWebApp* searchParams, Referer     │
│ • Unrestricted Access: Passes all Web and Mini App requests │
│   through; injects X-Telegram-Client and X-Platform-Access  │
│   headers without blocking or port closing.                 │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CENTRALIZED AUTH UTILITY (src/lib/telegramAuth.ts)       │
│ • isTelegramBotRequest(headers, searchParams)               │
│ • isTelegramUserAgent(userAgent)                            │
│ • hasTelegramLaunchParams(searchParams)                     │
│ • isLocalhostEnvironment(host)                              │
│ • parseTelegramInitData(initData)                           │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CLIENT-SIDE GATE & SYNC SCREEN (page.tsx & GateScreen)   │
│ • Mini App: Ingests window.Telegram.WebApp user & initData  │
│ • Web Browser: Hydrates synced Telegram user from cache or  │
│   prompts user to sync their Telegram account on Web.       │
│ • Both platforms require valid Telegram account sync        │
│   before unlocking balances and gameplay.                   │
│ • Localhost Dev Mode: Floating DevModeToolbar with 1-click │
│   toggle between unlocked app and sync gate preview.        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Centralized Telegram Request Validation API

All incoming requests are validated through [`src/lib/telegramAuth.ts`](file:///Users/Apple16/Desktop/mini-app/src/lib/telegramAuth.ts):

* **`isTelegramUserAgent(ua)`**: Matches official Telegram client signatures (`Telegram`, `TelegramMessenger`, `Telegram-Android`, `tdesktop`).
* **`hasTelegramLaunchParams(params)`**: Validates presence of Telegram WebApp query tokens (`tgWebAppVersion`, `tgWebAppData`, `tgWebAppStartParam`).
* **`isTelegramReferer(referer)`**: Validates origins from `telegram.org`.
* **`isTelegramBotRequest(headers, searchParams)`**: Master validator identifying whether a request originates within Telegram or external Web.
* **`isLocalhostEnvironment(host)`**: Identifies `localhost`, `127.0.0.1`, `0.0.0.0`, and `.local` to enable local developer testing.
* **`verifyTelegramWebAppData(initData, botToken)`** ([`src/lib/telegramCrypto.ts`](file:///Users/Apple16/Desktop/mini-app/src/lib/telegramCrypto.ts)): **Cryptographic Anti-Forging Engine**:
  * Recalculates secret key `HMAC_SHA256("WebAppData", botToken)`.
  * Computes hexadecimal HMAC-SHA256 signature across all alphabetically sorted parameters.
  * Rejects forged URLs missing the `hash` parameter (e.g. `#tgWebAppData=user=...`).
  * Rejects tampered user IDs or manipulated payloads with mismatched signatures.
  * Validates session freshness via `auth_date`.

---

## 3. Deployment & CI Checkpoint Protocol

To guarantee that broken code or unauthorized access configurations never deploy to production, changes must pass the **Deploy Checkpoint**:

1. **Local Pre-Push Hook** (`.git/hooks/pre-push`):
   * Runs `npm run checkpoint` (`tsx --test tests/*.test.ts && next build`).
   * Blocks `git push` if any test fails or Next.js build fails.
   * Scans working tree to prohibit heavy media (`.mov`, `.mp4`, `.zip`, `.pdf`, `.wav`, etc.).
2. **GitHub Actions Deploy Checkpoint** (`.github/workflows/deploy-checkpoint.yml`):
   * **Job 1**: `pre-deploy-checkpoint` (Pre-Deploy Checkpoint Gate) verifies unit tests and production build.
   * **Job 2**: `deploy-gate` (Production Deploy Approval Gate) executes upon `push` to `main` to approve release.
3. **Vercel Production Deployment**:
   * Deploys strictly after all pre-push checkpoints and GitHub gates pass.

---

## 4. Verification & Testing Procedures

### A. Testing External Web Browser Access (Must Pass With Telegram Sync)
```bash
curl -i -H "Host: mini-application.vercel.app" \
     -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36" \
     http://localhost:3000/
```
**Expected**: `HTTP/1.1 200 OK`, `x-telegram-client: false`, `x-platform-access: Unrestricted-Telegram-Sync`.

### B. Testing Inside Telegram Client (Must Pass)
```bash
curl -i -H "Host: mini-application.vercel.app" \
     -H "User-Agent: TelegramMessenger" \
     http://localhost:3000/
```
**Expected**: `x-telegram-client: true`, passed through with native WebApp capabilities.

### C. Testing on Localhost
* Open `http://localhost:3000` -> Dev Mode active with [`DevModeToolbar`](file:///Users/Apple16/Desktop/mini-app/src/components/common/DevModeToolbar.tsx).
* Click `Preview Sync Gate` -> Displays Telegram Account Sync Screen.
* Click `Bypass to Mini App` -> Returns to unlocked mini app.
