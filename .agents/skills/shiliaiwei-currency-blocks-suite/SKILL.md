---
name: shiliaiwei-currency-blocks-suite
description: Authoritative architecture specification for the SHILIAIWEI 3 Decoupled Currency Block Stores, Independent Earning Mechanics, Market Trending Metric Grid, and Web3 Explorer Suite across Web and Telegram Mini App. Trigger on: "currency blocks", "3 distinct currency", "block stores", "market trending", "earning suite", "independent earning", "pow mining", "recipes", "core concepts".
---

# SHILIAIWEI 3 DECOUPLED CURRENCY BLOCK STORES & MARKET TRENDING SUITE SPECIFICATION

This specification establishes the authoritative, permanent implementation standard for the decoupled 3-currency block store architecture, independent earning streams, real-time market trending metric grid, and Web3 interactive explorer suite in the **SHILIAIWEI** platform.

---

## 1. Absolute Constraints (MANDATORY)

- **Never Push Without Permission**: Never execute `git push` or remote publishing under any circumstances unless the user explicitly commands it.
- **Never Write Guide Example Labels**: Never output design tutorial labels, style indicators, theme names, or place names (such as "SKEUOMORPHIC CARD", "Skeuomorphic Card Suite", or theme meta-names) on UI cards, badges, or headers.
- **Strictly NO EMOJIS**: Under no circumstances should emojis be used anywhere in UI components, code, tests, or documentation.
- **Official Keyline Icons Exclusivity**: All visual icons must strictly be imported from `@/components/icons/KeylineIcons` (`src/components/icons/KeylineIcons.tsx`). No outside icon libraries (`lucide-react`, `heroicons`, `react-icons`).

---

## 2. Decoupled 3-Currency Block Stores Architecture

The application decouples account balances into three independent, non-colliding currency stores, each representing a distinct financial layer and balance reserve:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   3 DISTINCT CURRENCY BLOCK STORES                     │
└────────────────────────────────────────────────────────────────────────┘
          │                                 │                            │
          ▼                                 ▼                            ▼
┌──────────────────┐              ┌──────────────────┐         ┌──────────────────┐
│ STORE 01 • L2    │              │ STORE 02 • VAULT │         │ STORE 03 • BAKONG│
│ WEI COIN         │              │ US DOLLAR        │         │ KHMER RIEL       │
├──────────────────┤              ├──────────────────┤         ├──────────────────┤
│ • Code: WEI      │              │ • Code: USD      │         │ • Code: KHR      │
│ • Symbol: WEI    │              │ • Symbol: $      │         │ • Symbol: ៛      │
│ • Decimals: 0    │              │ • Decimals: 2    │         │ • Decimals: 0    │
│ • State: score   │              │ • State: usdBal  │         │ • State: khrBal  │
│ • Rate: 1.0 Base │              │ • Rate: $0.01    │         │ • Rate: 41 KHR   │
│ • L2 Crypto      │              │ • Vault Fiat     │         │ • National Peg   │
└──────────────────┘              └──────────────────┘         └──────────────────┘
```

### Store Specifications

| Parameter | Store 01: WEI COIN | Store 02: US DOLLAR | Store 03: KHMER RIEL |
| :--- | :--- | :--- | :--- |
| **Store Tag** | `STORE 01 • L2` | `STORE 02 • VAULT` | `STORE 03 • BAKONG` |
| **Currency Code** | `WEI` | `USD` | `KHR` |
| **Display Symbol** | `WEI` | `$` | `៛` |
| **Standard Unit** | `1 WEI` (Integer) | `$0.01` (Cent) | `1 KHR` (Integer Riel) |
| **Decimals** | `0` (Indivisible integer) | `2` | `0` |
| **Ledger Type** | Native L2 Crypto (`BigInt`) | Fiat Pegged Vault Asset | National Sovereign Asset |
| **Base Conversion** | Base `1.0` | `1 WEI = $0.01 USD` | `1 WEI = 41 KHR` |
| **UI Container Tint** | Cyan (`#0284c7` / `#0098ea`) | Emerald (`#059669` / `#047857`) | Purple (`#9333ea` / `#7e22ce`) |
| **Formatting Helper** | `formatCoinAmount(amt, "WEI")` | `formatCoinAmount(amt, "USD")` | `formatCoinAmount(amt, "KHR")` |

---

## 3. Independent Earning Streams & Mechanics

Each currency store features its own dedicated, non-overlapping earning mechanic:

### 1. Store 01 (WEI COIN) — Tap Mining & Game Rewards
- **Tap Mining Engine**: Increments on user interaction at rate of `+{tapPower} WEI/Tap`.
- **Game Mode Emissions**: 8 interactive mini-games distribute up to `6,000 WEI/user-day`.
- **Mission Tasks**: Daily Check-in (500 WEI) + Telegram Mission (1,000 WEI) + Verified Institutional Partners (1,500 WEI) = `3,000 WEI/user-day`.
- **Daily Mint Allocation**: Base block reward of `1,000 WEI/user-day`.

### 2. Store 02 (US DOLLAR) — Hourly Vault Yield
- **Passive Yield Rate**: Accrues at `+$0.05/Hr Yield` based on active staked balance.
- **Earning Source**: Vault yield generation, merchant payment settlements, and USD-denominated partner campaigns.

### 3. Store 03 (KHMER RIEL) — Bakong National Daily Distribution
- **Daily Liquidity Rate**: Accrues at `+5,000 ៛/Daily` national liquidity rewards.
- **Earning Source**: Bakong KHQR scan verification, local Cambodian business check-ins, and institutional educational quests.

---

## 4. 4-Block Market Trending Metric Grid

Rendered at the top of [`src/components/cards/BrandMiningBlockGrid.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/cards/BrandMiningBlockGrid.tsx), this grid presents real-time protocol telemetry:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ BLOCK 1: PRICE   │  │ BLOCK 2: VOLUME  │  │ BLOCK 3: COIN    │  │ BLOCK 4: POW     │
│ $0.0100          │  │ $1.42M           │  │ WEI COIN         │  │ 0.00010000       │
│ 41.00 KHR / 1 WEI│  │ Pool: $5.84M USD │  │ L2 Standard      │  │ PoW Genesis      │
│ [+12.8%]         │  │ [LIVE]           │  │ [NATIVE]         │  │ [HALVING]        │
│ Fill: #0080c8    │  │ Fill: #00875a    │  │ Fill: #b45309    │  │ Fill: #7428dd    │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
```

### 24H SVG Market Trend Visualization
- **7 Data Points**: Scaled from `$0.0089` to `$0.0100` (`(10,34)`, `(50,28)`, `(90,30)`, `(130,18)`, `(170,20)`, `(210,10)`, `(250,12)`).
- **Smooth Bezier / Segment Path**: Dynamic SVG path with semi-transparent cyan area fill (`via-cyan-500/20 to-transparent`) and animated endpoint pulse dot.

---

## 5. Big Logo Coin WEI Protocol Utility Showcase

Centered below the 3 block stores, the showcase card presents the official monetary identity:

### Visual Medallion Architecture
- **Milled Gold Coin Disc**: 80–96px circular medallion styled with 4-stop gold gradient (`#fef08a` -> `#f59e0b` -> `#b45309` -> `#78350f`) and 3D specular bevels.
- **Concentric Inner Rim**: Radial depth gradient (`#d97706` -> `#92400e` -> `#451a03`) with centered `WeiCoinBadge` emblem.
- **Typography**: Bold mono `WEI COIN` with ambient glow ring.

### Protocol Utility Mandate
- **Core Role**: Used to pay transaction fees, participate in network validation, protocol voting, and decentralized governance.
- **Genesis Distribution**: Initially distributed through Proof-of-Work mining and fair-launch tap distribution.

---

## 6. Interactive Web3 Explorer Suite (3 Tabs)

The explorer interface provides three full interactive tabs:

### Tab 1: `trending` (Live Mined Blocks & Network Pulse)
- Real-time simulated block mining stream updating every 2.8 seconds.
- Displays Block Hash (`0x...`), Block Height, Mining Difficulty, Nonce, Active Miner Address, and Block Subsidy Reward.

### Tab 2: `recipes` (8 Web3 How-To Recipes)
1. **Connect**: Wallet lifecycle & Telegram WebApp provider resolution.
2. **Disconnect**: Safe session termination & cache invalidation.
3. **Send a Transaction**: Atomic L2 transfer payload broadcast.
4. **Sign Data**: secp256k1 canonical signature scheme.
5. **Gasless Transfers**: Sponsored meta-transactions via master relayer pool.
6. **Embedded Requests**: Native JSON-RPC queries inside Telegram iframe.
7. **Filter Wallets**: Client hardware & biometric enclave detection.
8. **WalletConnect Support**: Universal QR and deep-link bridge.

### Tab 3: `concepts` (8 Core Architectural Concepts)
1. **Architecture**: Dual-layer engine (Neon PostgreSQL pooler + Telegram CloudStorage).
2. **Bridges**: Atomic swap channels (Bakong KHQR, USD fiat pegs, EVM).
3. **Sessions**: Zero-trust state with incrementing nonces and HMAC signatures.
4. **Universal Links**: Native deep-linking via `t.me/` and `https://` routes.
5. **Manifest**: Strict Web3 application manifest and contract whitelisting.
6. **Registry**: Tamper-evident on-chain catalog of game modes and contracts.
7. **Feature Negotiation**: Dynamic client-server hardware handshake.
8. **Security Model**: Multi-tier defense with secp256k1, IP rate-limits, and HMAC validation.

---

## 7. Implementation File Map

| Component / Utility | File Path | Responsibility |
| :--- | :--- | :--- |
| **Coin Standards & Math** | [`src/lib/wallet/coinStandard.ts`](file:///Users/Apple16/Desktop/mini-app/src/lib/wallet/coinStandard.ts) | Definitive conversion math, distribution allocations, and formatting |
| **Mining & Block Grid UI** | [`src/components/cards/BrandMiningBlockGrid.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/cards/BrandMiningBlockGrid.tsx) | 4 metric blocks, 3 decoupled stores, coin medallion, 3-tab explorer |
| **Wei Coin Badge** | [`src/components/brand/WeiCoinBadge.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/brand/WeiCoinBadge.tsx) | Vector typographic badge with golden borders and dark obsidian core |
| **3D Bitcoin Coin Graphic**| [`src/components/brand/WeiBitcoin3DCoin.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/brand/WeiBitcoin3DCoin.tsx) | Realistic 3D rendered Wei coin asset with lighting reflections |
| **Tap Mining Integration** | [`src/components/views/TapGameView.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/views/TapGameView.tsx) | Live view hosting BrandMiningBlockGrid with interactive tap power |
| **Market Trend Suite** | [`src/components/views/LeaderboardView.tsx`](file:///Users/Apple16/Desktop/mini-app/src/components/views/LeaderboardView.tsx) | Top market metrics, trending tokens, and player leaderboard |
| **Automated Tests** | [`tests/coin-standard.test.ts`](file:///Users/Apple16/Desktop/mini-app/tests/coin-standard.test.ts) | 100% test coverage for decoupled conversions, limits, and rates |
