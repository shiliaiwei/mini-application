import CryptoQRCodeGenerator from "@web3-utils/crypto-qr-code";
import QRCode from "qrcode";

export interface CryptoQrResult {
  svg: string;
  dataUrl: string;
  uri: string;
  address: string;
}

export interface WalletQrOptions {
  currency?: "WEI" | "ETH" | "BTC";
  coin?: "WEI" | "ETH" | "BTC";
  width?: number;
  size?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Splits a cryptocurrency wallet address into readable chunks (default 4 chars)
 */
export function formatChunkedAddress(address: string, chunkSize: number = 4): string[] {
  if (!address) return [];
  const regex = new RegExp(`.{1,${chunkSize}}`, "g");
  return address.match(regex) || [address];
}

/**
 * Web3 Cryptocurrency Wallet QR Code Generator Service
 * Leverages @web3-utils/crypto-qr-code and high-resolution QRCode vector rendering
 * for frameless Binance-style deposit cards.
 */
export class Web3WalletQrService {
  private generator: CryptoQRCodeGenerator;

  constructor() {
    this.generator = new CryptoQRCodeGenerator();
  }

  /**
   * Generates cryptocurrency wallet QR codes in SVG and DataURL formats.
   */
  async generateWalletQr(
    address: string,
    options: WalletQrOptions = {}
  ): Promise<CryptoQrResult> {
    const {
      currency = options.coin || "WEI",
      width = options.size || 280,
      darkColor = "#0f172a",
      lightColor = "#ffffff",
    } = options;

    const cleanAddress = (address || "").trim();
    let uri = `weicoin:${cleanAddress}`;
    let ethCompatible = cleanAddress;

    if (currency === "ETH") {
      ethCompatible = cleanAddress.startsWith("0x")
        ? cleanAddress
        : `0x${cleanAddress.replace(/^WC/i, "")}`.slice(0, 42);
      uri = `ethereum:${ethCompatible}`;
    } else if (currency === "BTC") {
      uri = `bitcoin:${cleanAddress}`;
    }

    let svg = "";
    let dataUrl = "";

    // 1. Attempt @web3-utils/crypto-qr-code generation for standard ETH/BTC formats
    try {
      if (currency === "ETH" && ethCompatible.startsWith("0x") && ethCompatible.length === 42) {
        svg = await this.generator.generateQRCode(ethCompatible, {
          currency: "ETH",
          format: "image/svg+xml",
        });
        dataUrl = await this.generator.generateQRCode(ethCompatible, {
          currency: "ETH",
          format: "image/png",
        });
      } else if (currency === "BTC" && cleanAddress.length >= 25) {
        svg = await this.generator.generateQRCode(cleanAddress, {
          currency: "BTC",
          format: "image/svg+xml",
        });
        dataUrl = await this.generator.generateQRCode(cleanAddress, {
          currency: "BTC",
          format: "image/png",
        });
      }
    } catch {
      // Fall through to primary high-resolution vector engine
    }

    // 2. High-precision vector SVG generation for WEI COIN and Web3 addresses
    if (!svg) {
      svg = await QRCode.toString(uri, {
        type: "svg",
        width,
        margin: 1,
        errorCorrectionLevel: "H",
        color: { dark: darkColor, light: lightColor },
      });
    }

    if (!dataUrl) {
      dataUrl = await QRCode.toDataURL(uri, {
        width: Math.max(width * 2, 512),
        margin: 1,
        errorCorrectionLevel: "H",
        color: { dark: darkColor, light: lightColor },
      });
    }

    return { svg, dataUrl, uri, address: cleanAddress };
  }
}

export const cryptoQrService = new Web3WalletQrService();
