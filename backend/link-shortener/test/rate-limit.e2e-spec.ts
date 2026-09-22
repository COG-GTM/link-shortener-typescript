import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { RateLimitConfigTag } from './../src/rate-limit.config';
import { AppRepositoryTag } from './../src/app.repository';
import { AppRepositoryHashmap } from './../src/app.repository.hashmap';

describe('Rate limiting (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RateLimitConfigTag)
      .useValue({ unauthenticatedPerMinute: 3, authenticatedPerMinute: 5 })
      .overrideProvider(AppRepositoryTag)
      .useClass(AppRepositoryHashmap)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('limits unauthenticated requests after the per-minute limit', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer()).get('/').expect(200);
    }
    const res = await request(app.getHttpServer()).get('/').expect(429);
    const retryAfter = res.headers['retry-after'];
    expect(retryAfter).toMatch(/^\d+$/);
    const retryAfterSeconds = Number(retryAfter);
    expect(retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(retryAfterSeconds).toBeLessThanOrEqual(60);
    expect(res.body).toEqual({
      error: 'rate_limited',
      retry_after_seconds: retryAfterSeconds,
    });
  });

  it('applies the higher authenticated limit under a separate bucket', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .get('/')
        .set('x-api-key', 'test-key')
        .expect(200);
    }
    await request(app.getHttpServer())
      .get('/')
      .set('x-api-key', 'test-key')
      .expect(429);
  });

  it('does not rate limit GET /health', async () => {
    for (let i = 0; i < 4; i++) {
      await request(app.getHttpServer()).get('/');
    }
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect({ status: 'ok' });
    }
  });
});
