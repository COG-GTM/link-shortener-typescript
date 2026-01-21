import { AppRepository } from './repository.interface';
import { from, Observable } from 'rxjs';
import { createClient, RedisClientType } from 'redis';

export class AppRepositoryRedis implements AppRepository {
  private readonly redis: RedisClientType;

  constructor() {
    this.redis = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    });
    this.redis.connect();
  }

  get(hash: string): Observable<string> {
    return from(this.redis.get(hash));
  }

  put(hash: string, url: string): Observable<string> {
    return from(this.redis.set(hash, url));
  }
}
