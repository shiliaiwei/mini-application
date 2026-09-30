import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  MAX_SUPPLY_WEI,
  HALVING_THRESHOLD,
  INITIAL_BLOCK_REWARD,
  getCurrentBlockReward,
  getHalvingProgressPercent,
} from "@/lib/wallet/gameSigner";

/**
 * GET /api/wallet/supply
 * Returns global WEI supply stats: total distributed, remaining supply,
 * current halving count, block reward, and halving progress percent.
 */
export async function GET() {
  try {
    const result = await prisma.ledgerEntry.aggregate({
      where: { amount: { gt: BigInt(0) } },
      _sum: { amount: true },
    });

    const totalDistributed = Number(result._sum.amount ?? BigInt(0));
    const halvingCount = Math.floor(totalDistributed / HALVING_THRESHOLD);
    const blockReward = getCurrentBlockReward(totalDistributed);
    const halvingProgressPercent = getHalvingProgressPercent(totalDistributed);
    const remainingSupply = Math.max(0, MAX_SUPPLY_WEI - totalDistributed);
    const nextHalvingAt = Math.min(MAX_SUPPLY_WEI, (halvingCount + 1) * HALVING_THRESHOLD);

    return NextResponse.json({
      success: true,
      supply: {
        totalDistributed,
        remainingSupply,
        maxSupply: MAX_SUPPLY_WEI,
        halvingCount,
        blockReward,
        initialBlockReward: INITIAL_BLOCK_REWARD,
        halvingThreshold: HALVING_THRESHOLD,
        halvingProgressPercent,
        nextHalvingAt,
        supplyExhausted: totalDistributed >= MAX_SUPPLY_WEI,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error)?.message || "Supply query failed" },
      { status: 500 }
    );
  }
}
