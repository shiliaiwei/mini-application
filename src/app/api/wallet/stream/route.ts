import { NextRequest } from "next/server";
import { isValidAddress } from "@/lib/wallet/crypto";
import { balanceEvents } from "@/lib/wallet/realtime";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address || !isValidAddress(address)) {
    return new Response(JSON.stringify({ error: "Valid WC address required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial connection greeting
  writer.write(
    encoder.encode(`event: connected\ndata: ${JSON.stringify({ address, connectedAt: Date.now() })}\n\n`)
  );

  const onBalanceUpdate = (data: { address: string; balance: number; txHash?: string }) => {
    writer.write(
      encoder.encode(`event: balance\ndata: ${JSON.stringify(data)}\n\n`)
    ).catch(() => {});
  };

  const eventName = `balance:${address}`;
  balanceEvents.on(eventName, onBalanceUpdate);

  // Heartbeat keep-alive every 15 seconds
  const interval = setInterval(() => {
    writer.write(encoder.encode(": keepalive\n\n")).catch(() => {});
  }, 15000);

  req.signal.addEventListener("abort", () => {
    clearInterval(interval);
    balanceEvents.off(eventName, onBalanceUpdate);
    writer.close().catch(() => {});
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
