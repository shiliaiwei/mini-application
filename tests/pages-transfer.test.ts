import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../src/pages/api/transfer";
import prisma from "../src/lib/prisma";
import {
  generateKeypair,
  encryptPrivateKey,
  signTransaction,
} from "../src/lib/wallet/crypto";
import { resetRateLimits } from "../src/lib/wallet/security";

function createMockContext(options: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  socket?: { remoteAddress?: string };
}) {
  const req = {
    method: options.method || "POST",
    body: options.body || {},
    headers: options.headers || { host: "localhost:3000" },
    socket: options.socket || { remoteAddress: "127.0.0.1" },
  } as unknown as NextApiRequest;

  let statusCode = 200;
  let responseData: any = null;
  const headersSet: Record<string, any> = {};

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseData = data;
      return res;
    },
    setHeader(name: string, value: any) {
      headersSet[name] = value;
      return res;
    },
    getHeader(name: string) {
      return headersSet[name];
    },
  } as unknown as NextApiResponse;

  return {
    req,
    res,
    getStatus: () => statusCode,
    getData: () => responseData,
  };
}

function createValidInitData(userId: number, botToken: string): string {
  const authDate = Math.floor(Date.now() / 1000);
  const userJson = JSON.stringify({ id: userId, first_name: "TestUser" });
  const dataCheckString = `auth_date=${authDate}\nuser=${userJson}`;
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const validHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return `auth_date=${authDate}&user=${encodeURIComponent(userJson)}&hash=${validHash}`;
}

test("Secure Transfer API: Method guard rejects non-POST requests", async () => {
  const ctx = createMockContext({ method: "GET" });
  await handler(ctx.req, ctx.res);

  assert.equal(ctx.getStatus(), 405);
  assert.equal(ctx.getData().success, false);
  assert.match(ctx.getData().error, /Method not allowed/);
});

test("Secure Transfer API: Address Validation rejects invalid recipient formats", async () => {
  resetRateLimits();

  // Test 1: Invalid prefix
  const ctx1 = createMockContext({
    body: {
      to_address: "0x1234567890abcdef1234567890abcdef12345678",
      amount: 100,
      nonce: 0,
      signature: "a".repeat(128),
    },
  });
  await handler(ctx1.req, ctx1.res);
  assert.equal(ctx1.getStatus(), 400);
  assert.match(ctx1.getData().error, /Invalid recipient address format/);

  // Test 2: Too short
  const ctx2 = createMockContext({
    body: {
      to_address: "WC123",
      amount: 100,
      nonce: 0,
      signature: "a".repeat(128),
    },
  });
  await handler(ctx2.req, ctx2.res);
  assert.equal(ctx2.getStatus(), 400);
  assert.match(ctx2.getData().error, /Invalid recipient address format/);
});

test("Secure Transfer API: Amount Validation rejects non-positive or float values", async () => {
  resetRateLimits();
  const validWC = "WC" + "a".repeat(40);

  // Zero amount
  const ctxZero = createMockContext({
    body: {
      to_address: validWC,
      amount: 0,
      nonce: 0,
      signature: "a".repeat(128),
    },
  });
  await handler(ctxZero.req, ctxZero.res);
  assert.equal(ctxZero.getStatus(), 400);
  assert.match(ctxZero.getData().error, /Invalid amount/);

  // Negative amount
  const ctxNeg = createMockContext({
    body: {
      to_address: validWC,
      amount: -50,
      nonce: 0,
      signature: "a".repeat(128),
    },
  });
  await handler(ctxNeg.req, ctxNeg.res);
  assert.equal(ctxNeg.getStatus(), 400);
  assert.match(ctxNeg.getData().error, /Invalid amount/);

  // Float amount
  const ctxFloat = createMockContext({
    body: {
      to_address: validWC,
      amount: 12.34,
      nonce: 0,
      signature: "a".repeat(128),
    },
  });
  await handler(ctxFloat.req, ctxFloat.res);
  assert.equal(ctxFloat.getStatus(), 400);
  assert.match(ctxFloat.getData().error, /Invalid amount/);
});

test("Secure Transfer API: Nonce Validation rejects negative nonces", async () => {
  resetRateLimits();
  const validWC = "WC" + "a".repeat(40);

  const ctxNegNonce = createMockContext({
    body: {
      to_address: validWC,
      amount: 100,
      nonce: -1,
      signature: "a".repeat(128),
    },
  });
  await handler(ctxNegNonce.req, ctxNegNonce.res);
  assert.equal(ctxNegNonce.getStatus(), 400);
  assert.match(ctxNegNonce.getData().error, /Invalid nonce/);
});

test("Secure Transfer API: Signature Validation rejects malformed signatures", async () => {
  resetRateLimits();
  const validWC = "WC" + "a".repeat(40);

  const ctxBadSig = createMockContext({
    body: {
      to_address: validWC,
      amount: 100,
      nonce: 0,
      signature: "invalid-signature-hex",
    },
  });
  await handler(ctxBadSig.req, ctxBadSig.res);
  assert.equal(ctxBadSig.getStatus(), 400);
  assert.match(ctxBadSig.getData().error, /Invalid signature format/);
});

test("Secure Transfer API: Auth Validation rejects unauthorized production requests", async () => {
  resetRateLimits();
  const validWC = "WC" + "a".repeat(40);

  const ctxNoAuth = createMockContext({
    body: {
      to_address: validWC,
      amount: 100,
      nonce: 0,
      signature: "a".repeat(128),
    },
    headers: { host: "mini-application.vercel.app" },
  });
  await handler(ctxNoAuth.req, ctxNoAuth.res);
  assert.equal(ctxNoAuth.getStatus(), 401);
  assert.match(ctxNoAuth.getData().error, /Unauthorized/);
});

test("Secure Transfer API: Self-transfer rejection", async () => {
  resetRateLimits();
  const senderKp = generateKeypair();

  const origFindUnique = prisma.wallet.findUnique;
  (prisma.wallet as any).findUnique = async ({ where }: any) => {
    return {
      id: "mock_wallet_sender",
      telegram_id: BigInt(88888888),
      address: senderKp.address,
      public_key: senderKp.publicKey,
      nonce: 0,
      nonce_record: { current_nonce: 0 },
    };
  };

  try {
    const ctx = createMockContext({
      body: {
        to_address: senderKp.address,
        amount: 100,
        nonce: 0,
        signature: "a".repeat(128),
      },
    });
    await handler(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 400);
    assert.match(ctx.getData().error, /Self-transfers to the same WC address are prohibited/);
  } finally {
    (prisma.wallet as any).findUnique = origFindUnique;
  }
});

test("Secure Transfer API: Replay attack rejection when nonce mismatches", async () => {
  resetRateLimits();
  const senderKp = generateKeypair();
  const recipientKp = generateKeypair();

  const origFindUnique = prisma.wallet.findUnique;
  (prisma.wallet as any).findUnique = async ({ where }: any) => {
    if (where.id || where.telegram_id) {
      return {
        id: "mock_wallet_sender",
        telegram_id: BigInt(88888888),
        address: senderKp.address,
        public_key: senderKp.publicKey,
        nonce: 3,
        nonce_record: { current_nonce: 3 },
      };
    }
    return {
      id: "mock_wallet_recipient",
      address: recipientKp.address,
      public_key: recipientKp.publicKey,
    };
  };

  try {
    const ctx = createMockContext({
      body: {
        to_address: recipientKp.address,
        amount: 100,
        nonce: 0, // Sending old nonce 0 when current is 3
        signature: "a".repeat(128),
      },
    });
    await handler(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 400);
    assert.match(ctx.getData().error, /replay attack detected/);
  } finally {
    (prisma.wallet as any).findUnique = origFindUnique;
  }
});

test("Secure Transfer API: Invalid secp256k1 cryptographic signature rejection", async () => {
  resetRateLimits();
  const senderKp = generateKeypair();
  const recipientKp = generateKeypair();

  const origFindUnique = prisma.wallet.findUnique;
  (prisma.wallet as any).findUnique = async ({ where }: any) => {
    if (where.id || where.telegram_id) {
      return {
        id: "mock_wallet_sender",
        telegram_id: BigInt(88888888),
        address: senderKp.address,
        public_key: senderKp.publicKey,
        nonce: 0,
        nonce_record: { current_nonce: 0 },
      };
    }
    return {
      id: "mock_wallet_recipient",
      address: recipientKp.address,
      public_key: recipientKp.publicKey,
    };
  };

  try {
    // Valid signature format (128 hex chars) but invalid cryptographic content
    const invalidSignature = "f".repeat(128);
    const ctx = createMockContext({
      body: {
        to_address: recipientKp.address,
        amount: 100,
        nonce: 0,
        signature: invalidSignature,
      },
    });
    await handler(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 400);
    assert.match(ctx.getData().error, /signature verification failed/);
  } finally {
    (prisma.wallet as any).findUnique = origFindUnique;
  }
});

test("Secure Transfer API: Insufficient real balance from ledger SUM aggregation rejection", async () => {
  resetRateLimits();
  const senderKp = generateKeypair();
  const recipientKp = generateKeypair();

  const sig = signTransaction(senderKp.privateKey, {
    fromAddress: senderKp.address,
    toAddress: recipientKp.address,
    amount: 1000,
    nonce: 0,
  });

  const origFindUnique = prisma.wallet.findUnique;
  const origTransaction = prisma.$transaction;

  (prisma.wallet as any).findUnique = async ({ where }: any) => {
    if (where.id || where.telegram_id) {
      return {
        id: "mock_wallet_sender",
        telegram_id: BigInt(88888888),
        address: senderKp.address,
        public_key: senderKp.publicKey,
        nonce: 0,
        nonce_record: { current_nonce: 0 },
      };
    }
    return {
      id: "mock_wallet_recipient",
      address: recipientKp.address,
      public_key: recipientKp.publicKey,
    };
  };

  (prisma as any).$transaction = async (fn: any) => {
    return fn({
      ledgerEntry: {
        aggregate: async () => ({
          _sum: { amount: BigInt(200) }, // Only 200 available, 1000 requested
        }),
      },
    });
  };

  try {
    const ctx = createMockContext({
      body: {
        to_address: recipientKp.address,
        amount: 1000,
        nonce: 0,
        signature: sig,
      },
    });
    await handler(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 400);
    assert.match(ctx.getData().error, /Insufficient balance/);
  } finally {
    (prisma.wallet as any).findUnique = origFindUnique;
    (prisma as any).$transaction = origTransaction;
  }
});

test("Secure Transfer API: Atomic Transaction debits sender, credits recipient, and increments nonce", async () => {
  resetRateLimits();
  const senderKp = generateKeypair();
  const recipientKp = generateKeypair();

  const transferAmount = 250;
  const sig = signTransaction(senderKp.privateKey, {
    fromAddress: senderKp.address,
    toAddress: recipientKp.address,
    amount: transferAmount,
    nonce: 0,
  });

  const origFindUnique = prisma.wallet.findUnique;
  const origTransaction = prisma.$transaction;

  const createdLedgerEntries: any[] = [];
  let senderNonceIncremented = false;
  let transactionCreated: any = null;

  (prisma.wallet as any).findUnique = async ({ where }: any) => {
    if (where.id || where.telegram_id) {
      return {
        id: "mock_wallet_sender",
        telegram_id: BigInt(88888888),
        address: senderKp.address,
        public_key: senderKp.publicKey,
        nonce: 0,
        nonce_record: { current_nonce: 0 },
      };
    }
    return {
      id: "mock_wallet_recipient",
      address: recipientKp.address,
      public_key: recipientKp.publicKey,
    };
  };

  (prisma as any).$transaction = async (fn: any) => {
    return fn({
      ledgerEntry: {
        aggregate: async () => ({
          _sum: { amount: BigInt(1000) }, // 1000 available
        }),
        create: async ({ data }: any) => {
          createdLedgerEntries.push(data);
          return { id: "mock_entry_" + createdLedgerEntries.length, ...data };
        },
      },
      transaction: {
        create: async ({ data }: any) => {
          transactionCreated = { id: "tx_mock_12345", ...data };
          return transactionCreated;
        },
      },
      wallet: {
        update: async ({ where, data }: any) => {
          if (data?.nonce?.increment) {
            senderNonceIncremented = true;
          }
          return { id: where.id, nonce: 1 };
        },
      },
      nonce: {
        update: async () => ({ current_nonce: 1 }),
        create: async () => ({ current_nonce: 1 }),
      },
    });
  };

  try {
    const ctx = createMockContext({
      body: {
        to_address: recipientKp.address,
        amount: transferAmount,
        nonce: 0,
        signature: sig,
      },
    });
    await handler(ctx.req, ctx.res);

    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.success, true);
    assert.equal(data.transaction.amount, 250);
    assert.equal(data.transaction.fromAddress, senderKp.address);
    assert.equal(data.transaction.toAddress, recipientKp.address);
    assert.equal(data.transaction.newSenderBalance, 750);

    // Verify debit and credit entries
    assert.equal(createdLedgerEntries.length, 2);
    const debit = createdLedgerEntries.find((e) => e.entry_type === "TRANSFER_OUT");
    const credit = createdLedgerEntries.find((e) => e.entry_type === "TRANSFER_IN");
    assert.ok(debit);
    assert.equal(debit.amount, BigInt(-250));
    assert.equal(debit.wallet_id, "mock_wallet_sender");

    assert.ok(credit);
    assert.equal(credit.amount, BigInt(250));
    assert.equal(credit.wallet_id, "mock_wallet_recipient");

    // Verify nonce increment
    assert.equal(senderNonceIncremented, true);

    // Verify transaction record
    assert.ok(transactionCreated);
    assert.equal(transactionCreated.status, "CONFIRMED");
    assert.equal(transactionCreated.tx_type, "TRANSFER");
  } finally {
    (prisma.wallet as any).findUnique = origFindUnique;
    (prisma as any).$transaction = origTransaction;
  }
});
