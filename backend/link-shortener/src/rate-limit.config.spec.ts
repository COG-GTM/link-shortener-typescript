import {
  DEFAULT_AUTHENTICATED_PER_MINUTE,
  DEFAULT_UNAUTHENTICATED_PER_MINUTE,
  loadRateLimitConfig,
} from './rate-limit.config';

describe('loadRateLimitConfig', () => {
  it('returns defaults when env vars are missing', () => {
    expect(loadRateLimitConfig({})).toEqual({
      unauthenticatedPerMinute: DEFAULT_UNAUTHENTICATED_PER_MINUTE,
      authenticatedPerMinute: DEFAULT_AUTHENTICATED_PER_MINUTE,
    });
  });

  it('parses valid values', () => {
    const config = loadRateLimitConfig({
      RATE_LIMIT_UNAUTHENTICATED_PER_MINUTE: '10',
      RATE_LIMIT_AUTHENTICATED_PER_MINUTE: '42',
    });
    expect(config.unauthenticatedPerMinute).toBe(10);
    expect(config.authenticatedPerMinute).toBe(42);
  });

  it.each(['abc', '0', '-5', ''])(
    'falls back to defaults on invalid value %p',
    (value) => {
      const config = loadRateLimitConfig({
        RATE_LIMIT_UNAUTHENTICATED_PER_MINUTE: value,
        RATE_LIMIT_AUTHENTICATED_PER_MINUTE: value,
      });
      expect(config.unauthenticatedPerMinute).toBe(
        DEFAULT_UNAUTHENTICATED_PER_MINUTE,
      );
      expect(config.authenticatedPerMinute).toBe(
        DEFAULT_AUTHENTICATED_PER_MINUTE,
      );
    },
  );
});
