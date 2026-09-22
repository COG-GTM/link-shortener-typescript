import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
  let t: number;
  let limiter: RateLimiter;

  beforeEach(() => {
    t = 0;
    limiter = new RateLimiter(60_000, () => t);
  });

  it('allows exactly `limit` hits then denies the next', () => {
    for (let i = 0; i < 3; i++) {
      const decision = limiter.hit('k', 3);
      expect(decision.allowed).toBe(true);
    }
    const denied = limiter.hit('k', 3);
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
  });

  it('reports retryAfterSeconds as ceil of remaining window', () => {
    limiter.hit('k', 1);
    t = 15_000;
    const denied = limiter.hit('k', 1);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBe(45);
  });

  it('keeps keys independent', () => {
    limiter.hit('a', 1);
    expect(limiter.hit('b', 1).allowed).toBe(true);
    expect(limiter.hit('a', 1).allowed).toBe(false);
  });

  it('resets the window after windowMs', () => {
    limiter.hit('k', 1);
    expect(limiter.hit('k', 1).allowed).toBe(false);
    t = 60_000;
    expect(limiter.hit('k', 1).allowed).toBe(true);
  });

  it('returns retryAfterSeconds of at least 1', () => {
    limiter.hit('k', 1);
    t = 59_900;
    const denied = limiter.hit('k', 1);
    expect(denied.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });
});
