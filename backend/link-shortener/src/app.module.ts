import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppRepositoryTag } from './app.repository';
import { AppRepositoryRedis } from './app.repository.redis';
import { loadRateLimitConfig, RateLimitConfigTag } from './config';
import { RateLimitMiddleware } from './rate-limit.middleware';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: AppRepositoryTag, useClass: AppRepositoryRedis },
    { provide: RateLimitConfigTag, useFactory: loadRateLimitConfig },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
