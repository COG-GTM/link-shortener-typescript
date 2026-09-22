export interface RateLimitConfig {
  windowMs: number;
  anonymousLimit: number;
  authenticatedLimit: number;
  apiKeys: ReadonlySet<string>;
}

export const RateLimitConfigTag = 'RateLimitConfig';

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_ANON_LIMIT = 60;
const DEFAULT_AUTH_LIMIT = 600;

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = value?.trim() ? Number(value) : NaN;
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function csvSet(value: string | undefined): ReadonlySet<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
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
    apiKeys: csvSet(env.RATE_LIMIT_API_KEYS),
  };
}
