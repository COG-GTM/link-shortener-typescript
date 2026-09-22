import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppRepositoryTag } from './app.repository';
import { AppRepositoryRedis } from './app.repository.redis';
import { loadRateLimitConfig, RateLimitConfigTag } from './rate-limit.config';
import { RateLimiter } from './rate-limiter';
import { RateLimitMiddleware } from './rate-limit.middleware';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: AppRepositoryTag, useClass: AppRepositoryRedis },
    { provide: RateLimitConfigTag, useFactory: () => loadRateLimitConfig() },
    RateLimiter,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
