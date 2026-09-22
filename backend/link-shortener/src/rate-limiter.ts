export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

interface WindowEntry {
  count: number;
  windowStart: number;
}

export type Clock = () => number;

export class RateLimiter {
  private readonly windows = new Map<string, WindowEntry>();

  constructor(
    private readonly windowMs: number,
    private readonly now: Clock = Date.now,
  ) {}

  hit(key: string, limit: number): RateLimitDecision {
    const now = this.now();
    let entry = this.windows.get(key);
    if (!entry || now - entry.windowStart >= this.windowMs) {
      entry = { count: 0, windowStart: now };
      this.windows.set(key, entry);
    }

    const resetInMs = entry.windowStart + this.windowMs - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(resetInMs / 1000));

    if (entry.count >= limit) {
      return { allowed: false, limit, remaining: 0, retryAfterSeconds };
    }

    entry.count += 1;
    return {
      allowed: true,
      limit,
      remaining: limit - entry.count,
      retryAfterSeconds,
    };
  }

  prune(): void {
    const now = this.now();
    for (const [key, entry] of this.windows) {
      if (now - entry.windowStart >= this.windowMs) {
        this.windows.delete(key);
      }
    }
  }

  size(): number {
    return this.windows.size;
  }
}
