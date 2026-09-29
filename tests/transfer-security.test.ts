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

  const authModule = await import("../src/app/api/auth/telegram/route");
  assert.equal(typeof authModule.POST, "function", "POST telegram auth handler must exist");

  const exchangeModule = await import("../src/app/api/wallet/exchange/route");
  assert.equal(typeof exchangeModule.POST, "function", "POST exchange handler must exist");

  const rewardModule = await import("../src/app/api/wallet/reward/route");
  assert.equal(typeof rewardModule.POST, "function", "POST reward handler must exist");

  const streamModule = await import("../src/app/api/wallet/stream/route");
  assert.equal(typeof streamModule.GET, "function", "GET stream handler must exist");
});

test("Zod Validation: TransferRequestSchema strictly enforces rules", async () => {
  const { TransferRequestSchema } = await import("../src/lib/wallet/validation");

  const validPayload = {
    fromAddress: "WC0123456789abcdef0123456789abcdef01234567",
    toAddress: "WCabcdef0123456789abcdef0123456789abcdef01",
    amount: 150,
    nonce: 0,
    signature: "a".repeat(128),
    initData: "auth=test",
  };

  // Valid passes
  const validRes = TransferRequestSchema.safeParse(validPayload);
  assert.equal(validRes.success, true);

  // Self-transfer fails
  const selfRes = TransferRequestSchema.safeParse({
    ...validPayload,
    toAddress: validPayload.fromAddress,
  });
  assert.equal(selfRes.success, false);

  // Float amount fails
  const floatRes = TransferRequestSchema.safeParse({
    ...validPayload,
    amount: 15.5,
  });
  assert.equal(floatRes.success, false);

  // Negative amount fails
  const negRes = TransferRequestSchema.safeParse({
    ...validPayload,
    amount: -10,
  });
  assert.equal(negRes.success, false);

  // Zero amount fails
  const zeroRes = TransferRequestSchema.safeParse({
    ...validPayload,
    amount: 0,
  });
  assert.equal(zeroRes.success, false);

  // Invalid address fails
  const badAddrRes = TransferRequestSchema.safeParse({
    ...validPayload,
    toAddress: "0x123",
  });
  assert.equal(badAddrRes.success, false);
});

test("Zod Validation: ExchangeRequestSchema strictly allows WEI_USD and WEI_KHR", async () => {
  const { ExchangeRequestSchema } = await import("../src/lib/wallet/validation");

  const validUSD = ExchangeRequestSchema.safeParse({
    fromAddress: "WC0123456789abcdef0123456789abcdef01234567",
    pair: "WEI_USD",
    amount: 100,
    initData: "test",
  });
  assert.equal(validUSD.success, true);

  const validKHR = ExchangeRequestSchema.safeParse({
    fromAddress: "WC0123456789abcdef0123456789abcdef01234567",
    pair: "WEI_KHR",
    amount: 500,
    initData: "test",
  });
  assert.equal(validKHR.success, true);

  const invalidPair = ExchangeRequestSchema.safeParse({
    fromAddress: "WC0123456789abcdef0123456789abcdef01234567",
    pair: "WEI_EUR",
    amount: 100,
    initData: "test",
  });
  assert.equal(invalidPair.success, false);
});

test("Security & Anti-Abuse: checkRateLimit blocks flood attacks", async () => {
  const { checkRateLimit, resetRateLimits } = await import("../src/lib/wallet/security");
  resetRateLimits();

  const ip = "192.168.1.100";
  // 5 allowed requests
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(ip, 5, 1000);
    assert.equal(res.allowed, true, `Request ${i + 1} should be allowed`);
  }

  // 6th request blocked
  const blocked = checkRateLimit(ip, 5, 1000);
  assert.equal(blocked.allowed, false, "Request exceeding limit must be blocked");
  assert.ok(blocked.retryAfterMs > 0, "retryAfterMs must be returned");
});

test("Realtime Balance Events: Emits and receives balance updates", async () => {
  const { balanceEvents } = await import("../src/lib/wallet/realtime");

  let received = false;
  const testAddress = "WCtest1234567890abcdef1234567890abcdef12";
  balanceEvents.once(`balance:${testAddress}`, (data) => {
    assert.equal(data.address, testAddress);
    assert.equal(data.balance, 5000);
    received = true;
  });

  balanceEvents.notifyBalanceUpdate(testAddress, 5000, "tx_123");
  assert.equal(received, true, "Listener must receive realtime balance event");
});
