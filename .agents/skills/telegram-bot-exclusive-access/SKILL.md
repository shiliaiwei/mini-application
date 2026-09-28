---
name: telegram-bot-exclusive-access
description: Authoritative specification for ensuring the SHILIAIWEI application is exclusively accessible within the Telegram Mini App Bot environment on Vercel, completely restricting external web browsers, scrapers, and outside applications. Covers Vercel Edge Middleware, Content-Security-Policy frame-ancestors, centralized request validation (isTelegramBotRequest), client-side WebApp verification, and Deploy Checkpoint verification gates. Trigger on: "restrict browser", "telegram bot only", "exclusive telegram access", "close port on browser", "telegram gate", "deploy checkpoint".
---

# TELEGRAM MINI APP BOT EXCLUSIVE ACCESS SPECIFICATION

This specification defines the multi-layer security architecture and verification mechanisms used to restrict access to the SHILIAIWEI application strictly and exclusively to the official Telegram Mini App Bot (`@srievibot` / `https://t.me/srievibot/app`), terminating and rejecting any direct web browser access.

---

## 1. Multi-Layer Access Control Architecture

The application enforces security across four cascading layers:

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
│ • Browser Action: Sets Connection: close and returns        │
│   HTTP 403 Forbidden on API routes; injects restriction     │
│   headers on page requests.                                 │
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
│ 4. CLIENT-SIDE GATE & 403 SCREEN (page.tsx & GateScreen)   │
│ • Evaluates window.Telegram.WebApp.initData & platform     │
│ • If not verified: Displays authentic Cloudflare 403        │
│   Forbidden Gate Screen with launch CTA to @srievibot/app   │
│ • Localhost Dev Mode: Floating DevModeToolbar with 1-click │
│   toggle between unlocked app and 403 gate preview.         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Centralized Telegram Request Validation API

All incoming requests are validated through [`src/lib/telegramAuth.ts`](file:///Users/Apple16/Desktop/mini-app/src/lib/telegramAuth.ts):

* **`isTelegramUserAgent(ua)`**: Matches official Telegram client signatures (`Telegram`, `TelegramMessenger`, `Telegram-Android`, `tdesktop`).
* **`hasTelegramLaunchParams(params)`**: Validates presence of Telegram WebApp query tokens (`tgWebAppVersion`, `tgWebAppData`, `tgWebAppStartParam`).
* **`isTelegramReferer(referer)`**: Validates origins from `telegram.org`.
* **`isTelegramBotRequest(headers, searchParams)`**: Consolidated master validator returning `true` only when the request originates within the Telegram client.
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

### A. Testing External Web Browser Access (Must Be Denied)
```bash
curl -i -H "Host: mini-application.vercel.app" \
     -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36" \
     http://localhost:3000/api/audit/list
```
**Expected**: `HTTP/1.1 403 Forbidden`, `x-port-access: Restricted-To-Telegram-Bot`, JSON error.

### B. Testing Inside Telegram Client (Must Pass)
```bash
curl -i -H "Host: mini-application.vercel.app" \
     -H "User-Agent: TelegramMessenger" \
     http://localhost:3000/api/audit/list
```
**Expected**: `x-telegram-client: true`, passed through to API logic.

### C. Testing on Localhost
* Open `http://localhost:3000` -> Dev Mode active with [`DevModeToolbar`](file:///Users/Apple16/Desktop/mini-app/src/components/common/DevModeToolbar.tsx).
* Click `Preview 403 Gate` -> Displays Cloudflare 403 Gate Screen.
* Click `Bypass to Mini App` -> Returns to unlocked mini app.
