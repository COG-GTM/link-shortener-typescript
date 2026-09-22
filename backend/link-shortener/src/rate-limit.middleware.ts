import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RateLimitConfig, RateLimitConfigTag } from './rate-limit.config';
import { RateLimiter } from './rate-limiter';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(
    @Inject(RateLimitConfigTag) private readonly config: RateLimitConfig,
    private readonly limiter: RateLimiter,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.header('x-api-key');
    const key = apiKey ? `apikey:${apiKey}` : `ip:${req.ip}`;
    const limit = apiKey
      ? this.config.authenticatedPerMinute
      : this.config.unauthenticatedPerMinute;

    const decision = this.limiter.hit(key, limit);
    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(decision.remaining));

    if (decision.allowed) {
      next();
      return;
    }
    res.setHeader('Retry-After', String(decision.retryAfterSeconds));
    res.status(429).json({
      error: 'rate_limited',
      retry_after_seconds: decision.retryAfterSeconds,
    });
  }
}
