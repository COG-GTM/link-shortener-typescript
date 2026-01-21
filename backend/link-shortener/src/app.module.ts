import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppRepositoryTag, AppRepositoryRedis } from './repository';
import { IdempotencyMiddleware, IdempotencyStore } from './idempotency';
import { DefaultHashGenerator, HashGeneratorTag } from './shortener';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    IdempotencyStore,
    { provide: AppRepositoryTag, useClass: AppRepositoryRedis },
    { provide: HashGeneratorTag, useClass: DefaultHashGenerator },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdempotencyMiddleware).forRoutes('shorten');
  }
}
