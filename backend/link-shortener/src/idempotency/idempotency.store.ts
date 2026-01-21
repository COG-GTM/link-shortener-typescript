import { Injectable } from '@nestjs/common';

export interface IdempotencyEntry {
  response: any;
  createdAt: number;
}

export const IDEMPOTENCY_TTL_MS = process.env.IDEMPOTENCY_TTL_SECONDS
  ? parseInt(process.env.IDEMPOTENCY_TTL_SECONDS, 10)
  : 3600;

@Injectable()
export class IdempotencyStore {
  private readonly store = new Map<string, IdempotencyEntry>();

  /**
   * Get a cached response for the given idempotency key.
   * Returns undefined if not found or expired.
   */
  get(key: string): any | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    const now = Date.now();
    const age = now - entry.createdAt;

    if (age > IDEMPOTENCY_TTL_MS) {
      this.store.delete(key);
      return undefined;
    }

    return entry.response;
  }

  /**
   * Store a response for the given idempotency key.
   */
  set(key: string, response: any): void {
    this.store.set(key, {
      response,
      createdAt: Date.now(),
    });
  }

  /**
   * Check if a key exists and is not expired.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Clear all entries (useful for testing).
   */
  clear(): void {
    this.store.clear();
  }
}
