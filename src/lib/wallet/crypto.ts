import * as secp from "@noble/secp256k1";
import crypto from "crypto";

// Configure hashes for @noble/secp256k1 v3
secp.hashes.sha256 = (msg: Uint8Array) => crypto.createHash("sha256").update(msg).digest();
secp.hashes.hmacSha256 = (key: Uint8Array, ...msgs: Uint8Array[]) => {
  const hmac = crypto.createHmac("sha256", key);
  for (const m of msgs) hmac.update(m);
  return hmac.digest();
};

export interface KeypairResult {
  privateKey: string;
  publicKey: string;
  address: string;
}

export interface TransactionPayload {
  fromAddress: string;
  toAddress: string;
  amount: number | bigint;
  nonce: number;
}

/**
 * Derives a deterministic WC... address from a secp256k1 public key.
 * Format: WC + 40 lowercase hexadecimal characters.
 */
export function deriveAddress(publicKeyHex: string): string {
  const cleanPub = publicKeyHex.replace(/^0x/, "");
  const hash = crypto.createHash("sha256").update(Buffer.from(cleanPub, "hex")).digest("hex");
  return `WC${hash.slice(0, 40)}`;
}

/**
 * Validates whether an address conforms to expected WC... standards.
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  return /^WC[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Generates a new secp256k1 keypair and derives its WC... address.
 */
export function generateKeypair(): KeypairResult {
  const privBytes = secp.utils.randomSecretKey();
  const pubBytes = secp.getPublicKey(privBytes, true); // 33-byte compressed public key

  const privateKey = Buffer.from(privBytes).toString("hex");
  const publicKey = Buffer.from(pubBytes).toString("hex");
  const address = deriveAddress(publicKey);

  return { privateKey, publicKey, address };
}

/**
 * Derives the server AES-256 encryption key from environment secret.
 */
function getEncryptionKey(): Buffer {
  const secret =
    process.env.WALLET_MASTER_KEY ||
    process.env.TELEGRAM_BOT_TOKEN ||
    "SHILIAIWEI_SECURE_VAULT_KEY_2026";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts private key using AES-256-GCM before database storage.
 */
export function encryptPrivateKey(privateKeyHex: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv, { authTagLength: 16 });

  let encrypted = cipher.update(privateKeyHex, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted private key.
 */
export function decryptPrivateKey(encryptedPayload: string): string {
  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted private key format");
  }

  const [ivHex, tagHex, dataHex] = parts;
  const authTag = Buffer.from(tagHex, "hex");
  if (authTag.length !== 16) {
    throw new Error("Invalid authentication tag length");
  }

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"), {
    authTagLength: 16,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(dataHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Creates canonical SHA-256 message hash for a transfer transaction.
 */
export function createTransactionHash(payload: TransactionPayload): Buffer {
  const canonicalString = `${payload.fromAddress}:${payload.toAddress}:${payload.amount.toString()}:${payload.nonce}`;
  return crypto.createHash("sha256").update(canonicalString, "utf8").digest();
}

/**
 * Signs a transaction payload using the sender's private key.
 */
export function signTransaction(privateKeyHex: string, payload: TransactionPayload): string {
  const hash = createTransactionHash(payload);
  const privBytes = Buffer.from(privateKeyHex.replace(/^0x/, ""), "hex");
  const sigBytes = secp.sign(hash, privBytes);
  return Buffer.from(sigBytes).toString("hex");
}

/**
 * Verifies transaction signature using sender's secp256k1 public key.
 */
export function verifyTransactionSignature(
  publicKeyHex: string,
  payload: TransactionPayload,
  signatureHex: string
): boolean {
  try {
    const hash = createTransactionHash(payload);
    const pubBytes = Buffer.from(publicKeyHex.replace(/^0x/, ""), "hex");
    const sigBytes = Buffer.from(signatureHex.replace(/^0x/, ""), "hex");

    return secp.verify(sigBytes, hash, pubBytes);
  } catch {
    return false;
  }
}
