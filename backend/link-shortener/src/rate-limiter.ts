import { Injectable, Optional } from '@nestjs/common';

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  windowStart: number;
}

@Injectable()
export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    @Optional() private readonly windowMs = 60_000,
    @Optional() private readonly now: () => number = Date.now,
  ) {}

  hit(key: string, limit: number): RateLimitDecision {
    const now = this.now();
    this.prune(now);
    let bucket = this.buckets.get(key);
    if (!bucket || now - bucket.windowStart >= this.windowMs) {
      bucket = { count: 1, windowStart: now };
      this.buckets.set(key, bucket);
    } else {
      bucket.count += 1;
    }
    const allowed = bucket.count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - bucket.count),
      retryAfterSeconds: allowed
        ? 0
        : Math.max(
            1,
            Math.ceil((bucket.windowStart + this.windowMs - now) / 1000),
          ),
    };
  }

  private prune(now: number): void {
    if (this.buckets.size <= 10_000) {
      return;
    }
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.windowStart >= this.windowMs) {
        this.buckets.delete(key);
      }
    }
  }
}
