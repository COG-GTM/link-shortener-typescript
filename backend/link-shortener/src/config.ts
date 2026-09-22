export interface RateLimitConfig {
  windowMs: number;
  anonymousLimit: number;
  authenticatedLimit: number;
}

export const RateLimitConfigTag = 'RateLimitConfig';

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_ANON_LIMIT = 60;
const DEFAULT_AUTH_LIMIT = 600;

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadRateLimitConfig(
  env: NodeJS.ProcessEnv = process.env,
): RateLimitConfig {
  return {
    windowMs: DEFAULT_WINDOW_MS,
    anonymousLimit: positiveInt(
      env.RATE_LIMIT_ANON_PER_MINUTE,
      DEFAULT_ANON_LIMIT,
    ),
    authenticatedLimit: positiveInt(
      env.RATE_LIMIT_AUTH_PER_MINUTE,
      DEFAULT_AUTH_LIMIT,
    ),
  };
}
