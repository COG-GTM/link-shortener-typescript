import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as request from 'supertest';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { AppRepositoryTag, AppRepositoryHashmap } from './../src/repository';
import { IdempotencyMiddleware, IdempotencyStore } from './../src/idempotency';
import { DefaultHashGenerator, HashGeneratorTag } from './../src/shortener';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    IdempotencyStore,
    { provide: AppRepositoryTag, useClass: AppRepositoryHashmap },
    { provide: HashGeneratorTag, useClass: DefaultHashGenerator },
  ],
})
class TestAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdempotencyMiddleware).forRoutes('shorten');
  }
}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('POST /shorten with idempotency', () => {
    it('should return same hash for same idempotency key', async () => {
      const idempotencyKey = 'test-idempotency-key-123';
      const url = 'https://example.com';

      const firstResponse = await request(app.getHttpServer())
        .post('/shorten')
        .set('Idempotency-Key', idempotencyKey)
        .send({ url })
        .expect(201);

      const secondResponse = await request(app.getHttpServer())
        .post('/shorten')
        .set('Idempotency-Key', idempotencyKey)
        .send({ url })
        .expect(200);

      expect(firstResponse.body.hash).toBeDefined();
      expect(secondResponse.body.hash).toBe(firstResponse.body.hash);
    });

    it('should return different hashes for different idempotency keys', async () => {
      const url = 'https://example.com';

      const firstResponse = await request(app.getHttpServer())
        .post('/shorten')
        .set('Idempotency-Key', 'key-one')
        .send({ url })
        .expect(201);

      const secondResponse = await request(app.getHttpServer())
        .post('/shorten')
        .set('Idempotency-Key', 'key-two')
        .send({ url })
        .expect(201);

      expect(firstResponse.body.hash).toBeDefined();
      expect(secondResponse.body.hash).toBeDefined();
      expect(firstResponse.body.hash).not.toBe(secondResponse.body.hash);
    });

    it('should work without idempotency key (generates new hash each time)', async () => {
      const url = 'https://example.com';

      const firstResponse = await request(app.getHttpServer())
        .post('/shorten')
        .send({ url })
        .expect(201);

      const secondResponse = await request(app.getHttpServer())
        .post('/shorten')
        .send({ url })
        .expect(201);

      expect(firstResponse.body.hash).toBeDefined();
      expect(secondResponse.body.hash).toBeDefined();
      expect(firstResponse.body.hash).not.toBe(secondResponse.body.hash);
    });
  });
});
