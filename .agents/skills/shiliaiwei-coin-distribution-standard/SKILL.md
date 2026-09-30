---
name: shiliaiwei-coin-distribution-standard
description: Standardized coin mechanics, units of measurement, block-based distribution, game modes, and mission rewards with Wei badge logo representation.
---

# SHILIAIWEI Coin Mechanics & Distribution Standard

## 1. Absolute Constraints (MANDATORY)
- **Never Push Without Permission**: Never execute `git push` or remote publishing under any circumstances unless the user explicitly commands it.
- **Never Write Guide Example Labels**: Never output design tutorial labels, style indicators, theme names, or place names (such as "SKEUOMORPHIC CARD", "Skeuomorphic Card Suite", or theme meta-names) on UI cards, badges, or headers.
- **Strictly NO EMOJIS**: Under no circumstances should emojis be used anywhere in code, markdown, tests, or documentation.

---

## 2. Standard Units of Measurement by Coin Type

| Parameter | WEI COIN (Native Token) | US DOLLAR (Pegged Asset) | KHMER RIEL (Pegged Asset) |
| :--- | :--- | :--- | :--- |
| **Code** | `WEI` | `USD` | `KHR` |
| **Symbol** | `WEI` | `$` | `៛` |
| **Standard Unit** | `1 WEI` (Integer) | `$0.01` (Cent) | `1 KHR` (Integer Riel) |
| **Decimals** | `0` (Indivisible integer) | `2` | `0` |
| **Ledger Storage** | `BigInt` in `ledger_entries` | Computed via Rate | Computed via Rate |
| **Conversion Rate** | Base `1.0` | `1 WEI = $0.01 USD` | `1 WEI = 41 KHR` |
| **Address Standard** | `WC` + 40 hex characters | Linked to WC Address | Linked to WC Address |
| **Min Rare Limit** | `100 WEI` | `$1.00 USD` | `4,100 KHR` |
| **Max Rare Limit** | `25,000 WEI` | `$250.00 USD` | `1,025,000 KHR` |

---

## 3. Daily Distribution Rate Calculations

The daily coin distribution is strictly calculated across three distinct channels:

### Channel 1: Block-Based Distribution
- **Genesis Block / Daily Mint Allocation**: Base block emission of **`1,000 WEI / user-day`**.
- USD Equivalent: `$10.00 USD / day`.
- KHR Equivalent: `41,000 KHR / day`.

### Channel 2: Game Mode Distribution (8 Interactive Mini-Games)
Sum of all registered catalog game rewards in `src/data/gamesCatalogue.ts`:
1. `card_flip_duel`: 500 WEI
2. `card_solitaire_tripeaks`: 750 WEI
3. `card_road_sign_deck`: 600 WEI
4. `lucky_wheel` (Daily Spin): 2,500 WEI
5. `word_flash`: 350 WEI
6. `guess_faster`: 400 WEI
7. `row_5_gomoku`: 600 WEI
8. `number_match`: 300 WEI
- **Total Game Modes Allocation**: **`6,000 WEI / user-day`**.
- USD Equivalent: `$60.00 USD / day`.
- KHR Equivalent: `246,000 KHR / day`.

### Channel 3: Mission Completion Distribution
1. Daily Check-in Streak: 500 WEI
2. Telegram Mission: 1,000 WEI
3. 33 Verified Institutional Partners (Cambodian Ministries) Explorer: 1,500 WEI
- **Total Missions Allocation**: **`3,000 WEI / user-day`**.
- USD Equivalent: `$30.00 USD / day`.
- KHR Equivalent: `123,000 KHR / day`.

### Daily Distribution Summary Matrix

| Coin Type | Block Allocation | Game Modes Allocation | Missions Allocation | Total Daily Distribution |
| :--- | :--- | :--- | :--- | :--- |
| **WEI COIN** | `1,000 WEI` | `6,000 WEI` | `3,000 WEI` | **`10,000 WEI`** |
| **US DOLLAR** | `$10.00 USD` | `$60.00 USD` | `$30.00 USD` | **`$100.00 USD`** |
| **KHMER RIEL** | `41,000 KHR` | `246,000 KHR` | `123,000 KHR` | **`410,000 KHR`** |

---

## 4. Standardized Representation & Wei Badge Logo

- **Brand Identifier**: Every coin interaction and transaction representation incorporates the official **`[WEI]` badge** (tight rounded rectangle with `#0098ea` background and white bold `WEI` text).
- **Reusable Component**: [`src/components/brand/WeiCoinBadge.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/brand/WeiCoinBadge.tsx) provides standardized badge rendering for all 3 coin types (`WEI`, `USD`, `KHR`).
- **Standard Module**: [`src/lib/wallet/coinStandard.ts`](file:///Users/Apple16/Desktop/mini-app/src/lib/wallet/coinStandard.ts) provides typed configs, conversion functions, and formatting utilities.
- **Preserved Existing Contracts**:
  - `POST /api/wallet/reward`: Game reward settlement with anti-cheat and HMAC signature verification.
  - `POST /api/wallet/transfer`: Cryptographic P2P transfer with secp256k1 signature validation.
  - `POST /api/wallet/exchange`: Scarcity-controlled currency exchange (`100 WEI = $1.00 USD = 4,100 KHR`).
