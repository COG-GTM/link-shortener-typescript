import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IdempotencyStore } from './idempotency.store';

const IDEMPOTENCY_HEADER = 'idempotency-key';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(private readonly idempotencyStore: IdempotencyStore) {}

  use(req: Request, res: Response, next: NextFunction): void {
    if (req.method !== 'POST') {
      return next();
    }

    const idempotencyKey = req.headers[IDEMPOTENCY_HEADER] as string | undefined;

    if (!idempotencyKey) {
      return next();
    }
    
    const cacheKey = idempotencyKey;

    const cachedResponse = this.idempotencyStore.get(cacheKey);
    if (cachedResponse) {
      res.json(cachedResponse);
      return;
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to capture the response
    res.json = (body: any) => {
      this.idempotencyStore.set(cacheKey, body);
      return originalJson(body);
    };

    next();
  }
}
