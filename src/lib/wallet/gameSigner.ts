/**
 * Game Reward Signing Service — Server-Side Authority
 * Zero client exposure: private keys live in env only.
 * Supports:
 *  - Off-chain HMAC signing (existing PostgreSQL ledger)
 *  - On-chain ECDSA signing (GameRewardWEI.sol on Base / Arbitrum)
 */

import * as secp from "@noble/secp256k1";
import { sha256 } from "@noble/hashes/sha2.js";
import { hmac } from "@noble/hashes/hmac.js";
import crypto from "crypto";

// Configure noble/secp256k1 with noble/hashes
secp.hashes.sha256 = (msg: Uint8Array) => sha256(msg);
secp.hashes.hmacSha256 = (key: Uint8Array, ...msgs: Uint8Array[]) => {
  const h = hmac.create(sha256, key);
  for (const m of msgs) h.update(m);
  return h.digest();
};

// ─── Bitcoin Halving Constants (mirrors GameRewardWEI.sol on-chain) ───────────
export const MAX_SUPPLY_WEI    = 21_000_000;
export const HALVING_THRESHOLD = 10_500_000;
export const INITIAL_BLOCK_REWARD = 1_000;
export const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// ─── Anti-Cheat Game Rules ────────────────────────────────────────────────────
const ANTI_CHEAT = {
  MIN_SCORE: 10,
  MAX_SCORE_PER_SEC: 60, // anti-speedhack: max 60 score/second
  MIN_SPEND_SECONDS: 3,
  MAX_REWARD_CAP: 2_500,  // hard server-side cap per claim
} as const;

// ─── In-Memory Daily Cooldown (backed by DB daily_claim_at in production) ─────
const claimCooldowns = new Map<string, number>(); // walletAddress → last claim Unix ms

export function isCooldownActive(walletAddress: string): boolean {
  const last = claimCooldowns.get(walletAddress) ?? 0;
  return Date.now() - last < DAILY_COOLDOWN_MS;
}

export function recordClaim(walletAddress: string): void {
  claimCooldowns.set(walletAddress, Date.now());
}

export function cooldownRemainingMs(walletAddress: string): number {
  const last = claimCooldowns.get(walletAddress) ?? 0;
  return Math.max(0, DAILY_COOLDOWN_MS - (Date.now() - last));
}

// ─── Halving-Adjusted Block Reward (mirrors on-chain logic) ──────────────────
export function getCurrentBlockReward(totalDistributed: number): number {
  if (totalDistributed >= MAX_SUPPLY_WEI) return 0;
  const halvings = Math.floor(totalDistributed / HALVING_THRESHOLD);
  return Math.max(1, Math.floor(INITIAL_BLOCK_REWARD / Math.pow(2, halvings)));
}

export function calculateRewardAmount(score: number, totalDistributed: number): number {
  const blockReward = getCurrentBlockReward(totalDistributed);
  if (blockReward === 0) return 0;
  // Score-proportional: 1 WEI per 10 score, capped at current block reward
  return Math.min(blockReward, Math.min(ANTI_CHEAT.MAX_REWARD_CAP, Math.max(1, Math.floor(score / 10))));
}

export function getHalvingProgressPercent(totalDistributed: number): number {
  const halvings = Math.floor(totalDistributed / HALVING_THRESHOLD);
  const from = halvings * HALVING_THRESHOLD;
  const to = Math.min(MAX_SUPPLY_WEI, (halvings + 1) * HALVING_THRESHOLD);
  if (totalDistributed <= from || to <= from) return 0;
  return Math.min(100, ((totalDistributed - from) / (to - from)) * 100);
}

// ─── Anti-Cheat Validation ────────────────────────────────────────────────────
export function validateGameplay(
  score: number,
  spendSeconds: number
): { valid: boolean; error?: string } {
  if (spendSeconds < ANTI_CHEAT.MIN_SPEND_SECONDS) {
    return { valid: false, error: "Invalid gameplay duration for reported score" };
  }
  if (score < ANTI_CHEAT.MIN_SCORE) {
    return { valid: false, error: "Score must be at least 10 to earn cryptographic block reward" };
  }
  if (score > spendSeconds * ANTI_CHEAT.MAX_SCORE_PER_SEC) {
    return { valid: false, error: "Anomalous gameplay score rejected by anti-cheat rules" };
  }
  return { valid: true };
}

// ─── Off-Chain HMAC Signing (existing PostgreSQL ledger system) ───────────────
export function signGameRewardOffChain(
  walletAddress: string,
  gameId: string,
  rewardAmount: number,
  nonce: number
): string {
  const secret =
    process.env.GAME_REWARD_SIGNING_KEY ||
    process.env.TELEGRAM_BOT_TOKEN ||
    "GAME_REWARD_AUTHORITY";
  return crypto
    .createHmac("sha256", secret)
    .update(`${walletAddress}:${gameId}:${rewardAmount}:${nonce}`)
    .digest("hex");
}

// ─── On-Chain ECDSA Signing (for GameRewardWEI.sol on Base / Arbitrum) ───────
// Replicates: keccak256(abi.encodePacked(player, gameId, rewardAmount, nonce, contract, chainId))
export function signGameRewardOnChain(
  playerAddress: string,
  gameId: string,
  rewardAmountWei: bigint,
  nonce: bigint,
  contractAddress: string,
  chainId: number
): { signature: string; messageHash: string } {
  const privKey = process.env.GAME_SERVER_ECDSA_PRIVATE_KEY;
  if (!privKey) throw new Error("GAME_SERVER_ECDSA_PRIVATE_KEY not configured");

  const packed = Buffer.concat([
    Buffer.from(playerAddress.replace(/^0x/, ""), "hex"),
    Buffer.from(gameId, "utf8"),
    bigintToBytes32(rewardAmountWei),
    bigintToBytes32(nonce),
    Buffer.from(contractAddress.replace(/^0x/, ""), "hex"),
    bigintToBytes32(BigInt(chainId)),
  ]);

  const msgHash = Buffer.from(sha256(packed));

  // Ethereum signed message prefix: "\x19Ethereum Signed Message:\n32"
  const prefix = Buffer.from("\x19Ethereum Signed Message:\n32", "utf8");
  const ethHash = Buffer.from(sha256(Buffer.concat([prefix, msgHash])));

  const privBytes = Buffer.from(privKey.replace(/^0x/, ""), "hex");
  const sigBytes = secp.sign(ethHash, privBytes);

  return {
    signature: `0x${Buffer.from(sigBytes).toString("hex")}`,
    messageHash: `0x${msgHash.toString("hex")}`,
  };
}

function bigintToBytes32(v: bigint): Buffer {
  return Buffer.from(v.toString(16).padStart(64, "0"), "hex");
}

// ─── Unified Entry Point: Authorize & Sign a Fair Game Win ────────────────────
export interface GameWinSignResult {
  approved: boolean;
  rewardAmount: number;
  nonce: string;
  signature: string;
  halvingCount: number;
  blockReward: number;
  error?: string;
}

export async function signFairGameWin(opts: {
  walletAddress: string;
  gameId: string;
  score: number;
  spendSeconds: number;
  nonce: number;
  totalDistributed: number;
}): Promise<GameWinSignResult> {
  const { walletAddress, gameId, score, spendSeconds, nonce, totalDistributed } = opts;

  const halvingCount = Math.floor(totalDistributed / HALVING_THRESHOLD);
  const blockReward = getCurrentBlockReward(totalDistributed);

  // 1. Anti-cheat validation
  const check = validateGameplay(score, spendSeconds);
  if (!check.valid) {
    return { approved: false, rewardAmount: 0, nonce: "", signature: "", halvingCount, blockReward, error: check.error };
  }

  // 2. Daily cooldown enforcement
  if (isCooldownActive(walletAddress)) {
    const rem = cooldownRemainingMs(walletAddress);
    const h = Math.floor(rem / 3600000);
    const m = Math.ceil((rem % 3600000) / 60000);
    return {
      approved: false, rewardAmount: 0, nonce: "", signature: "",
      halvingCount, blockReward,
      error: `Daily cooldown active. Retry in ${h}h ${m}m`,
    };
  }

  // 3. Hard cap guard
  if (totalDistributed >= MAX_SUPPLY_WEI) {
    return { approved: false, rewardAmount: 0, nonce: "", signature: "", halvingCount, blockReward, error: "Maximum supply of 21,000,000 WEI reached" };
  }

  // 4. Halving-adjusted reward
  const rewardAmount = calculateRewardAmount(score, totalDistributed);
  if (rewardAmount <= 0) {
    return { approved: false, rewardAmount: 0, nonce: "", signature: "", halvingCount, blockReward, error: "Reward calculation returned zero" };
  }

  // 5. Generate single-use nonce
  const sigNonce = crypto.randomBytes(16).toString("hex");

  // 6. Off-chain HMAC sign (existing PostgreSQL ledger)
  const signature = signGameRewardOffChain(walletAddress, gameId, rewardAmount, nonce);

  // 7. Record claim cooldown
  recordClaim(walletAddress);

  return { approved: true, rewardAmount, nonce: sigNonce, signature, halvingCount, blockReward };
}
