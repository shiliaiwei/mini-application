import { z } from "zod";

export const wcAddressRegex = /^WC[a-fA-F0-9]{40}$/;
export const signatureRegex = /^[0-9a-fA-F]{128,144}$/;

/**
 * Validates Telegram initData authentication requests.
 */
export const TelegramAuthSchema = z.object({
  initData: z.string().min(1, "Telegram initData payload required"),
});

/**
 * Validates Nonce retrieval requests.
 */
export const NonceRequestSchema = z.object({
  address: z.string().regex(wcAddressRegex, "Invalid WC address format"),
});

/**
 * Strict Zod validation schema for secure WeiCoin transfers.
 * Validates address format, positive integer amounts, nonces, and secp256k1 signatures.
 */
export const TransferRequestSchema = z
  .object({
    fromAddress: z.string().regex(wcAddressRegex, "Invalid sender WC address format"),
    toAddress: z.string().regex(wcAddressRegex, "Invalid recipient WC address format"),
    amount: z
      .number()
      .positive("Amount must be greater than zero")
      .int("Amount must be an integer number of WEI COIN")
      .max(1_000_000_000, "Amount exceeds maximum transaction limit"),
    nonce: z
      .number()
      .int("Nonce must be an integer")
      .nonnegative("Nonce cannot be negative"),
    signature: z.string().regex(signatureRegex, "Invalid secp256k1 signature format"),
    initData: z.string().min(1, "Telegram initData required for verification"),
  })
  .refine((data) => data.fromAddress !== data.toAddress, {
    message: "Self-transfers to the same WC address are prohibited",
    path: ["toAddress"],
  });

export const RARE_COIN_EXCHANGE_LIMITS = {
  MIN_EXCHANGE: 100, // Rare coin entry threshold (100 WEI = $1.00 USD / 4,100 KHR)
  MAX_EXCHANGE: 25_000, // Rare scarcity cap per transaction (25,000 WEI = $250.00 USD / 1,025,000 KHR)
} as const;

/**
 * Validates Currency Exchange requests (WEI COIN to USD or KHR).
 * Enforces rare coin scarcity rules with standard Min and Max limits.
 */
export const ExchangeRequestSchema = z.object({
  fromAddress: z.string().regex(wcAddressRegex, "Invalid sender WC address format"),
  pair: z.enum(["WEI_USD", "WEI_KHR"]),
  amount: z
    .number()
    .positive("Amount must be greater than zero")
    .int("Amount must be an integer number of WEI COIN")
    .min(
      RARE_COIN_EXCHANGE_LIMITS.MIN_EXCHANGE,
      `Minimum exchange amount is ${RARE_COIN_EXCHANGE_LIMITS.MIN_EXCHANGE} WEI COIN to preserve rarity`
    )
    .max(
      RARE_COIN_EXCHANGE_LIMITS.MAX_EXCHANGE,
      `Amount exceeds rare coin batch limit of ${RARE_COIN_EXCHANGE_LIMITS.MAX_EXCHANGE} WEI COIN`
    ),
  initData: z.string().min(1, "Telegram initData required for verification"),
});

/**
 * Validates Game Reward claims with server-side gameplay metrics.
 */
export const GameRewardRequestSchema = z.object({
  toAddress: z.string().regex(wcAddressRegex, "Invalid recipient WC address format"),
  gameId: z.string().min(1).max(64),
  score: z.number().int().nonnegative().max(100_000),
  spendSeconds: z.number().int().positive().max(7200),
  initData: z.string().min(1, "Telegram initData required for verification"),
});

export type TransferRequestInput = z.infer<typeof TransferRequestSchema>;
export type ExchangeRequestInput = z.infer<typeof ExchangeRequestSchema>;
export type GameRewardRequestInput = z.infer<typeof GameRewardRequestSchema>;
