import { EventEmitter } from "events";

/**
 * Realtime Balance Event Dispatcher
 * Broadcasts newly confirmed balances across WebSocket/SSE listeners immediately.
 */
class BalanceEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
  }

  notifyBalanceUpdate(address: string, balance: number, txHash?: string): void {
    this.emit(`balance:${address}`, {
      address,
      balance,
      txHash,
      timestamp: Date.now(),
    });
    this.emit("balance_any", {
      address,
      balance,
      txHash,
      timestamp: Date.now(),
    });
  }
}

// Global singleton to prevent recreating listeners across serverless hot-reloads
const globalForEvents = globalThis as unknown as {
  balanceEventBus?: BalanceEventBus;
};

export const balanceEvents = globalForEvents.balanceEventBus ?? new BalanceEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.balanceEventBus = balanceEvents;
}
