import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RateLimitConfig, RateLimitConfigTag } from './config';
import { RateLimiter } from './rate-limiter';

export const HEALTH_PATH = '/health';
const HEALTH_METHODS = new Set(['GET', 'HEAD']);

function isHealthCheck(req: Request): boolean {
  const path = req.originalUrl.split('?')[0].replace(/\/+$/, '');
  return HEALTH_METHODS.has(req.method) && path === HEALTH_PATH;
}

export function extractApiKey(req: Request): string | undefined {
  const headerKey = req.header('x-api-key');
  if (headerKey) {
    return headerKey;
  }
  const auth = req.header('authorization');
  const match = auth && /^Bearer\s+(\S+)$/i.exec(auth);
  return match ? match[1] : undefined;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly limiter: RateLimiter;
  private hitsSincePrune = 0;

  constructor(
    @Inject(RateLimitConfigTag) private readonly config: RateLimitConfig,
  ) {
    this.limiter = new RateLimiter(config.windowMs);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    if (isHealthCheck(req)) {
      return next();
    }

    const presented = extractApiKey(req);
    const apiKey =
      presented && this.config.apiKeys.has(presented) ? presented : undefined;
    const key = apiKey ? `key:${apiKey}` : `ip:${req.ip}`;
    const limit = apiKey
      ? this.config.authenticatedLimit
      : this.config.anonymousLimit;

    const decision = this.limiter.hit(key, limit);
    if (++this.hitsSincePrune >= 1000) {
      this.hitsSincePrune = 0;
      this.limiter.prune();
    }

    res.setHeader('X-RateLimit-Limit', decision.limit);
    res.setHeader('X-RateLimit-Remaining', decision.remaining);

    if (!decision.allowed) {
      res.setHeader('Retry-After', decision.retryAfterSeconds);
      res.status(429).json({
        error: 'rate_limited',
        retry_after_seconds: decision.retryAfterSeconds,
      });
      return;
    }

    next();
  }
}
