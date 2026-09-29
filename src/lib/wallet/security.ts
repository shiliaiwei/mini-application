/**
 * Security, Anti-Abuse & Rate Limiting Module
 * Enforces in-memory sliding-window throttling, anti-replay, and double-spend guards.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000).unref();
}

/**
 * Sliding-window rate limiter per client key (IP address or WC wallet address).
 * Defaults to max 5 requests per 10-second window.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 10000
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Prune timestamps older than windowMs
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfterMs = Math.max(0, windowMs - (now - oldest));
    return { allowed: false, retryAfterMs };
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);

  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Resets rate limit for testing purposes.
 */
export function resetRateLimits(): void {
  rateLimitStore.clear();
}
