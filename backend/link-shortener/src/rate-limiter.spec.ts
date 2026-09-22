import { RateLimiter } from './rate-limiter';
import { loadRateLimitConfig } from './config';

describe('RateLimiter', () => {
  let now: number;
  let limiter: RateLimiter;

  beforeEach(() => {
    now = 1_000_000;
    limiter = new RateLimiter(60_000, () => now);
  });

  it('allows requests up to the limit and reports remaining', () => {
    for (let i = 1; i <= 3; i++) {
      const d = limiter.hit('ip:1.2.3.4', 3);
      expect(d.allowed).toBe(true);
      expect(d.remaining).toBe(3 - i);
    }
  });

  it('rejects once the limit is exceeded with a retry-after', () => {
    for (let i = 0; i < 3; i++) limiter.hit('k', 3);
    now += 15_000;
    const d = limiter.hit('k', 3);
    expect(d.allowed).toBe(false);
    expect(d.remaining).toBe(0);
    expect(d.retryAfterSeconds).toBe(45);
  });

  it('rounds retry-after up to at least one second', () => {
    limiter.hit('k', 1);
    now += 59_500;
    expect(limiter.hit('k', 1).retryAfterSeconds).toBe(1);
    now += 400;
    expect(limiter.hit('k', 1).retryAfterSeconds).toBe(1);
  });

  it('resets the window after it expires', () => {
    limiter.hit('k', 1);
    expect(limiter.hit('k', 1).allowed).toBe(false);
    now += 60_000;
    const d = limiter.hit('k', 1);
    expect(d.allowed).toBe(true);
    expect(d.remaining).toBe(0);
  });

  it('tracks keys independently', () => {
    limiter.hit('a', 1);
    expect(limiter.hit('a', 1).allowed).toBe(false);
    expect(limiter.hit('b', 1).allowed).toBe(true);
  });

  it('prunes expired windows', () => {
    limiter.hit('a', 5);
    now += 30_000;
    limiter.hit('b', 5);
    now += 30_000;
    limiter.prune();
    expect(limiter.size()).toBe(1);
  });
});

describe('loadRateLimitConfig', () => {
  it('uses defaults when env vars are absent', () => {
    expect(loadRateLimitConfig({})).toEqual({
      windowMs: 60_000,
      anonymousLimit: 60,
      authenticatedLimit: 600,
    });
  });

  it('reads limits from env vars', () => {
    const cfg = loadRateLimitConfig({
      RATE_LIMIT_ANON_PER_MINUTE: '10',
      RATE_LIMIT_AUTH_PER_MINUTE: '100',
    });
    expect(cfg.anonymousLimit).toBe(10);
    expect(cfg.authenticatedLimit).toBe(100);
  });

  it('falls back to defaults on invalid values', () => {
    const cfg = loadRateLimitConfig({
      RATE_LIMIT_ANON_PER_MINUTE: 'abc',
      RATE_LIMIT_AUTH_PER_MINUTE: '-5',
    });
    expect(cfg.anonymousLimit).toBe(60);
    expect(cfg.authenticatedLimit).toBe(600);
  });
});
