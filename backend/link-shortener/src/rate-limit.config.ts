export interface RateLimitConfig {
  unauthenticatedPerMinute: number;
  authenticatedPerMinute: number;
}

export const DEFAULT_UNAUTHENTICATED_PER_MINUTE = 60;
export const DEFAULT_AUTHENTICATED_PER_MINUTE = 600;

export const RateLimitConfigTag = 'RateLimitConfig';

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export function loadRateLimitConfig(
  env: NodeJS.ProcessEnv = process.env,
): RateLimitConfig {
  return {
    unauthenticatedPerMinute: parsePositiveInt(
      env.RATE_LIMIT_UNAUTHENTICATED_PER_MINUTE,
      DEFAULT_UNAUTHENTICATED_PER_MINUTE,
    ),
    authenticatedPerMinute: parsePositiveInt(
      env.RATE_LIMIT_AUTHENTICATED_PER_MINUTE,
      DEFAULT_AUTHENTICATED_PER_MINUTE,
    ),
  };
}
