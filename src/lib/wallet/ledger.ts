import prisma from "@/lib/prisma";
import { generateKeypair, encryptPrivateKey } from "./crypto";

export interface WalletInfo {
  id: string;
  telegram_id: string;
  address: string;
  public_key: string;
  nonce: number;
  balance: number;
}

/**
 * Calculates real-time user balance using strict SUM(amount) from ledger entries.
 * Never trusts client-provided or cached balance values.
 */
export async function getWalletBalance(walletId: string): Promise<bigint> {
  const result = await prisma.ledgerEntry.aggregate({
    where: { wallet_id: walletId },
    _sum: { amount: true },
  });

  return result._sum.amount ?? BigInt(0);
}

/**
 * Retrieves existing wallet or provisions a new secp256k1 keypair and wallet container.
 */
export async function getOrCreateWallet(
  telegramId: number | bigint,
  initialGrant: number = 0
): Promise<WalletInfo> {
  const tgIdBigInt = BigInt(telegramId);

  let wallet = await prisma.wallet.findUnique({
    where: { telegram_id: tgIdBigInt },
  });

  if (!wallet) {
    const keypair = generateKeypair();
    const encryptedKey = encryptPrivateKey(keypair.privateKey);

    wallet = await prisma.wallet.create({
      data: {
        telegram_id: tgIdBigInt,
        address: keypair.address,
        public_key: keypair.publicKey,
        encrypted_private_key: encryptedKey,
        nonce: 0,
      },
    });

    if (initialGrant > 0) {
      await prisma.ledgerEntry.create({
        data: {
          wallet_id: wallet.id,
          amount: BigInt(initialGrant),
          entry_type: "INITIAL_GRANT",
        },
      });
    }
  }

  const liveBalance = await getWalletBalance(wallet.id);

  return {
    id: wallet.id,
    telegram_id: wallet.telegram_id.toString(),
    address: wallet.address,
    public_key: wallet.public_key,
    nonce: wallet.nonce,
    balance: Number(liveBalance),
  };
}

/**
 * Finds a wallet record by its WC... address.
 */
export async function getWalletByAddress(address: string) {
  return prisma.wallet.findUnique({
    where: { address },
  });
}
