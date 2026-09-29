import test from "node:test";
import assert from "node:assert/strict";
import {
  generateKeypair,
  deriveAddress,
  isValidAddress,
  encryptPrivateKey,
  decryptPrivateKey,
  signTransaction,
  verifyTransactionSignature,
  createTransactionHash,
} from "../src/lib/wallet/crypto";

test("Address Validation: Validates WC address standard", () => {
  const keypair = generateKeypair();
  assert.equal(keypair.address.startsWith("WC"), true, "Address must start with WC");
  assert.equal(keypair.address.length, 42, "Address must be 42 characters");
  assert.equal(isValidAddress(keypair.address), true, "Generated address must be valid");

  // Invalid addresses
  assert.equal(isValidAddress("0x1234567890abcdef"), false, "0x address must be rejected");
  assert.equal(isValidAddress("WC123"), false, "Short WC address must be rejected");
  assert.equal(isValidAddress("WC" + "z".repeat(40)), false, "Non-hex characters must be rejected");
  assert.equal(isValidAddress(""), false, "Empty address must be rejected");
});

test("Keypair & AES-256-GCM: Encrypts and decrypts private keys losslessly", () => {
  const keypair = generateKeypair();
  assert.ok(keypair.privateKey, "Private key generated");
  assert.ok(keypair.publicKey, "Public key generated");

  const encrypted = encryptPrivateKey(keypair.privateKey);
  assert.notEqual(encrypted, keypair.privateKey, "Encrypted key must differ from plaintext");
  assert.equal(encrypted.split(":").length, 3, "Must have iv:tag:data structure");

  const decrypted = decryptPrivateKey(encrypted);
  assert.equal(decrypted, keypair.privateKey, "Decrypted key must match original private key");

  // Invalid tag length (e.g. truncated tag) must throw
  const [ivHex, , dataHex] = encrypted.split(":");
  const shortTag = "aabbcc";
  assert.throws(
    () => decryptPrivateKey(`${ivHex}:${shortTag}:${dataHex}`),
    /Invalid authentication tag length/,
    "Truncated tag must be rejected"
  );
});

test("secp256k1 Signatures: Validates authentic signatures and rejects forged payloads", () => {
  const sender = generateKeypair();
  const recipient = generateKeypair();

  const payload = {
    fromAddress: sender.address,
    toAddress: recipient.address,
    amount: 500,
    nonce: 0,
  };

  const signature = signTransaction(sender.privateKey, payload);
  assert.ok(signature, "Signature generated");

  // 1. Valid signature passes
  const valid = verifyTransactionSignature(sender.publicKey, payload, signature);
  assert.equal(valid, true, "Signature must verify successfully");

  // 2. Tampered amount fails
  const tamperedAmount = verifyTransactionSignature(
    sender.publicKey,
    { ...payload, amount: 501 },
    signature
  );
  assert.equal(tamperedAmount, false, "Tampered amount must fail verification");

  // 3. Tampered recipient fails
  const otherRecipient = generateKeypair();
  const tamperedRecipient = verifyTransactionSignature(
    sender.publicKey,
    { ...payload, toAddress: otherRecipient.address },
    signature
  );
  assert.equal(tamperedRecipient, false, "Tampered recipient must fail verification");

  // 4. Tampered nonce (replay attack) fails
  const tamperedNonce = verifyTransactionSignature(
    sender.publicKey,
    { ...payload, nonce: 1 },
    signature
  );
  assert.equal(tamperedNonce, false, "Tampered nonce must fail verification");

  // 5. Wrong public key fails
  const wrongKey = verifyTransactionSignature(recipient.publicKey, payload, signature);
  assert.equal(wrongKey, false, "Wrong public key must fail verification");
});

test("Canonical Message Hash: Deterministic hashing for identical inputs", () => {
  const h1 = createTransactionHash({
    fromAddress: "WC0000000000000000000000000000000000000001",
    toAddress: "WC0000000000000000000000000000000000000002",
    amount: 100,
    nonce: 5,
  });

  const h2 = createTransactionHash({
    fromAddress: "WC0000000000000000000000000000000000000001",
    toAddress: "WC0000000000000000000000000000000000000002",
    amount: 100,
    nonce: 5,
  });

  assert.equal(h1.toString("hex"), h2.toString("hex"), "Hashes must match deterministically");
});

test("Transfer API Route Exports: POST handler is defined", async () => {
  const transferModule = await import("../src/app/api/wallet/transfer/route");
  assert.equal(typeof transferModule.POST, "function", "POST transfer handler must exist");

  const nonceModule = await import("../src/app/api/wallet/nonce/route");
  assert.equal(typeof nonceModule.GET, "function", "GET nonce handler must exist");

  const resolveModule = await import("../src/app/api/wallet/resolve/route");
  assert.equal(typeof resolveModule.GET, "function", "GET resolve handler must exist");
});
