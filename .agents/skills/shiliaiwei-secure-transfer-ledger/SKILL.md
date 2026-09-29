---
name: shiliaiwei-secure-transfer-ledger
description: Comprehensive architecture standard for SHILIAIWEI secure transfer API, secp256k1 crypto engine, double-entry ledger, and Prisma transactions on PostgreSQL. Covers WC address derivation, AES-256-GCM private key encryption, sequential nonce anti-replay protection, atomic debit/credit transactions, Telegram initData validation, and brand compliance (WEI COIN currency, zero emojis).
---

# SHILIAIWEI SECURE TRANSFER API & DOUBLE-ENTRY LEDGER SPECIFICATION

This specification defines the authoritative implementation standard for the SHILIAIWEI secure transfer API, secp256k1 cryptographic engine, double-entry ledger, and atomic Prisma transactions on PostgreSQL.

---

## 1. System Architecture Overview

The transfer system operates across five core layers:

```
[ Telegram WebApp Client (TapGameView) ]
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. SESSION AUTHENTICATION & INPUT VALIDATION                │
│ • Validates Telegram initData HMAC via bot token secret     │
│ • Validates to_address format: /^WC[a-fA-F0-9]{40}$/        │
│ • Resolves @username handles via game_players registry      │
│ • Rejects amount <= 0, NaN, or non-integer WEI COIN values  │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CRYPTOGRAPHIC ENGINE & ANTI-REPLAY (crypto.ts)           │
│ • Curve: secp256k1 (@noble/secp256k1 v3.2+)                 │
│ • Address Derivation: WC + sha256(pubKey)[12..32].hex       │
│ • Key Storage: AES-256-GCM encrypted private keys at rest   │
│ • Canonical Message Hash: sha256(to_address:amount:nonce)   │
│ • Anti-Replay: Sequential integer nonce per wallet          │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DOUBLE-ENTRY LEDGER & ATOMIC PRISMA TRANSACTIONS         │
│ • Balance Authority: SUM(amount) FROM ledger_entries        │
│ • Zero trust for client-supplied balance values             │
│ • Isolated prisma.$transaction execution:                   │
│   a. Verify sender balance >= transfer amount               │
│   b. Verify nonce matches current wallet.nonce              │
│   c. Verify secp256k1 signature against sender public key   │
│   d. Insert DEBIT ledger_entry (-amount) for sender         │
│   e. Insert CREDIT ledger_entry (+amount) for recipient     │
│   f. Increment sender wallet.nonce (+1)                     │
│   g. Insert CONFIRMED transaction record in transactions    │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. REST API ROUTES (src/app/api/wallet/*)                   │
│ • GET  /api/wallet/nonce   - Fetches current nonce & address│
│ • POST /api/wallet/sign    - Delegated signing for auth user│
│ • POST /api/wallet/transfer - Atomic execution endpoint     │
│ • GET  /api/wallet/balance - Real-time ledger balance check │
│ • GET  /api/wallet/resolve - Username to WC address mapping │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. BRAND COMPLIANCE & SAFETY PROTOCOLS                      │
│ • Currency: Strictly WEI COIN (Zero PTS, points, TON, SAR)  │
│ • Emojis: Strictly ZERO emojis across code, logs, and UI    │
│ • Database Safety: Zero destructive prisma db push; use     │
│   targeted DDL + prisma generate on shared databases        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Cryptographic Engine Standard (`src/lib/wallet/crypto.ts`)

### 2.1 noble/secp256k1 Configuration
In `@noble/secp256k1` v3, hash functions must be explicitly set:
```typescript
import * as secp from "@noble/secp256k1";
import { createHash, createHmac } from "crypto";

secp.hashes.sha256 = (msg: Uint8Array): Uint8Array => {
  return new Uint8Array(createHash("sha256").update(msg).digest());
};

secp.hashes.hmacSha256 = (key: Uint8Array, ...msgs: Uint8Array[]): Uint8Array => {
  const hmac = createHmac("sha256", Buffer.from(key));
  msgs.forEach((m) => hmac.update(m));
  return new Uint8Array(hmac.digest());
};
```

### 2.2 Address Derivation
- Prefix: `WC` (Wei Coin).
- Body: 40 hexadecimal characters derived from the SHA-256 hash of the uncompressed public key (bytes 12 to 32).
- Total length: 42 characters.
```typescript
export function deriveAddress(publicKeyHex: string): string {
  const cleanHex = publicKeyHex.startsWith("0x") ? publicKeyHex.slice(2) : publicKeyHex;
  const pubBytes = Buffer.from(cleanHex, "hex");
  const hash = createHash("sha256").update(pubBytes).digest("hex");
  return `WC${hash.slice(24, 64).toUpperCase()}`;
}

export function isValidAddress(address: string): boolean {
  return /^WC[a-fA-F0-9]{40}$/.test(address);
}
```

### 2.3 Private Key Envelope Encryption (AES-256-GCM)
Private keys must never be stored in plaintext. They are encrypted using AES-256-GCM with a 32-byte master key:
- Master Key derivation: `createHash("sha256").update(process.env.WALLET_MASTER_KEY || process.env.TELEGRAM_BOT_TOKEN).digest()`
- Payload format: `ivHex:authTagHex:ciphertextHex`

### 2.4 Canonical Transaction Hash & Signature Verification
- Canonical Hash: `sha256("${to_address.toLowerCase()}:${amount}:${nonce}")`
- Verification:
```typescript
export function verifyTransactionSignature(
  publicKeyHex: string,
  toAddress: string,
  amount: bigint | number,
  nonce: number,
  signatureHex: string
): boolean {
  const txHash = createTransactionHash(toAddress, amount, nonce);
  return secp.verify(signatureHex, txHash, publicKeyHex);
}
```

---

## 3. Database Schema Standard (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Wallet {
  id                    String        @id @default(cuid())
  telegram_id           BigInt        @unique
  address               String        @unique
  public_key            String
  encrypted_private_key String
  nonce                 Int           @default(0)
  created_at            DateTime      @default(now())
  updated_at            DateTime      @updatedAt
  ledger_entries        LedgerEntry[]

  @@map("wallets")
}

model LedgerEntry {
  id             String             @id @default(cuid())
  wallet_id      String
  amount         BigInt
  entry_type     String
  transaction_id String?
  created_at     DateTime           @default(now())
  wallet         Wallet             @relation(fields: [wallet_id], references: [id], onDelete: Cascade)
  transaction    WalletTransaction? @relation(fields: [transaction_id], references: [id])

  @@index([wallet_id])
  @@map("ledger_entries")
}

model WalletTransaction {
  id             String        @id @default(cuid())
  from_address   String
  to_address     String
  amount         BigInt
  nonce          Int
  signature      String
  status         String        @default("CONFIRMED")
  tx_type        String        @default("TRANSFER")
  created_at     DateTime      @default(now())
  ledger_entries LedgerEntry[]

  @@map("transactions")
}
```

### 3.1 Migration & DDL Safety Rule
- **NEVER** run `prisma db push` on shared databases with existing tables.
- Apply targeted SQL:
```sql
CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  address TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  nonce INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount BIGINT NOT NULL,
  nonce INTEGER NOT NULL,
  signature TEXT NOT NULL,
  status TEXT DEFAULT 'CONFIRMED' NOT NULL,
  tx_type TEXT DEFAULT 'TRANSFER' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  entry_type TEXT NOT NULL,
  transaction_id TEXT REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_wallet_id ON ledger_entries(wallet_id);
```
- Generate Prisma Client with `pnpm prisma generate`.

---

## 4. Atomic Transfer Handler Standard (`/api/wallet/transfer`)

Transfers execute atomically inside `prisma.$transaction`:

```typescript
export async function POST(req: Request) {
  // 1. Authenticate Telegram session
  const auth = await authenticateTelegramRequest(req);
  if (!auth.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Validate input fields
  const { to_address, amount, nonce, signature } = await req.json();
  if (!isValidAddress(to_address)) return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 });
  const transferAmount = BigInt(amount);
  if (transferAmount <= BigInt(0)) return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });

  // 3. Execute atomic transaction
  const result = await prisma.$transaction(async (tx) => {
    // a. Fetch sender and recipient
    const sender = await tx.wallet.findUnique({ where: { telegram_id: auth.telegramId } });
    if (!sender) throw new Error("Sender wallet not found");
    const recipient = await tx.wallet.findUnique({ where: { address: to_address } });
    if (!recipient) throw new Error("Recipient wallet not found");

    // b. Verify nonce
    if (sender.nonce !== Number(nonce)) throw new Error("Invalid transaction nonce");

    // c. Verify signature
    const valid = verifyTransactionSignature(sender.public_key, to_address, transferAmount, sender.nonce, signature);
    if (!valid) throw new Error("Invalid cryptographic signature");

    // d. Check balance strictly from ledger
    const balanceAgg = await tx.ledgerEntry.aggregate({
      where: { wallet_id: sender.id },
      _sum: { amount: true },
    });
    const currentBalance = balanceAgg._sum.amount ?? BigInt(0);
    if (currentBalance < transferAmount) throw new Error("Insufficient balance");

    // e. Create transaction record
    const createdTx = await tx.walletTransaction.create({
      data: {
        from_address: sender.address,
        to_address,
        amount: transferAmount,
        nonce: sender.nonce,
        signature,
        status: "CONFIRMED",
        tx_type: "TRANSFER",
      },
    });

    // f. Insert double-entry ledger entries
    await tx.ledgerEntry.createMany({
      data: [
        { wallet_id: sender.id, amount: -transferAmount, entry_type: "TRANSFER_OUT", transaction_id: createdTx.id },
        { wallet_id: recipient.id, amount: transferAmount, entry_type: "TRANSFER_IN", transaction_id: createdTx.id },
      ],
    });

    // g. Increment sender nonce
    await tx.wallet.update({
      where: { id: sender.id },
      data: { nonce: { increment: 1 } },
    });

    return { transactionId: createdTx.id, newBalance: currentBalance - transferAmount };
  });

  return NextResponse.json({ success: true, ...result });
}
```

---

## 5. Security & Verification Checklist

| Security Gate | Verification Requirement |
| :--- | :--- |
| **No Client Balance Trust** | Balance must always be calculated as `SUM(amount)` from `ledger_entries` inside the transaction. |
| **Replay Protection** | Nonce must strictly equal `wallet.nonce` and increment upon successful execution. |
| **Signature Authenticity** | Every transfer payload must verify against sender's secp256k1 public key. |
| **Key Privacy** | Private keys must be encrypted with AES-256-GCM and never returned via APIs. |
| **Zero Emojis** | Absolutely zero emojis in user-facing responses, commit messages, or error strings. |
| **Brand Currency** | Strictly use `WEI COIN`. Never use `PTS`, `points`, `TON`, or `SAR`. |
| **Pre-Push Gate** | `pnpm checkpoint` (`pnpm test && next build`) must pass 100% before git push. |
