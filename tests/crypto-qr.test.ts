import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { cryptoQrService, formatChunkedAddress } from "../src/lib/wallet/cryptoQr";

test("Crypto QR Service: generates valid SVG and PNG data URL for wallet addresses", async () => {
  const testAddress = "WC8bcd8e5fad2846e593206977e38aedbaafd4ef16";
  const result = await cryptoQrService.generateWalletQr(testAddress, {
    coin: "ETH",
    size: 260,
  });

  assert.ok(result.svg, "Result should contain SVG markup");
  assert.ok(result.svg.includes("<svg"), "SVG markup must include <svg tag");
  assert.ok(result.svg.includes("</svg>"), "SVG markup must include </svg> closing tag");
  assert.ok(result.dataUrl, "Result should contain data URL");
  assert.ok(result.dataUrl.startsWith("data:image/"), "Data URL must start with data:image/");
  assert.equal(result.address, testAddress, "Returned address must match input address");
});

test("Crypto QR Service: formatChunkedAddress splits address into readable 4-character chunks", () => {
  const address = "WC8bcd8e5fad2846e593206977e38aedbaafd4ef16";
  const chunked = formatChunkedAddress(address, 4);

  assert.ok(chunked.length > 0, "Chunked output should not be empty");
  assert.equal(chunked.join(""), address, "Rejoined chunks must match original address");
  assert.equal(chunked[0], "WC8b", "First chunk should be WC8b");
});

test("Binance Wallet QR Card: component source exists and incorporates frameless Binance styling", () => {
  const cardPath = path.resolve(__dirname, "../src/components/cards/BinanceWalletQrCard.tsx");
  assert.equal(fs.existsSync(cardPath), true, "BinanceWalletQrCard.tsx must exist");

  const content = fs.readFileSync(cardPath, "utf-8");
  assert.ok(content.includes("BinanceWalletQrCard"), "Must export BinanceWalletQrCard");
  assert.ok(content.includes("f0b90b"), "Must use Binance signature yellow color");
  assert.ok(content.includes("cryptoQrService"), "Must use cryptoQrService");
  assert.ok(content.includes("Copy Address"), "Must have Copy Address action");
  assert.ok(content.includes("Save QR Image"), "Must have Save QR Image action");
});
