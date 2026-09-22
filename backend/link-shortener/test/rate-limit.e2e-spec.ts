import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppRepositoryTag } from './../src/app.repository';
import { AppRepositoryHashmap } from './../src/app.repository.hashmap';
import { RateLimitConfigTag } from './../src/config';

describe('Rate limiting (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppRepositoryTag)
      .useClass(AppRepositoryHashmap)
      .overrideProvider(RateLimitConfigTag)
      .useValue({
        windowMs: 60_000,
        anonymousLimit: 2,
        authenticatedLimit: 4,
        apiKeys: new Set(['abc', 'other']),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  it('returns 429 with Retry-After once the anonymous limit is hit', async () => {
    const server = app.getHttpServer();
    await request(server)
      .get('/')
      .expect(200)
      .expect('X-RateLimit-Remaining', '1');
    await request(server)
      .get('/')
      .expect(200)
      .expect('X-RateLimit-Remaining', '0');

    const res = await request(server).get('/').expect(429);
    expect(res.headers['retry-after']).toMatch(/^\d+$/);
    const retryAfter = Number(res.headers['retry-after']);
    expect(retryAfter).toBeGreaterThanOrEqual(1);
    expect(retryAfter).toBeLessThanOrEqual(60);
    expect(res.body).toEqual({
      error: 'rate_limited',
      retry_after_seconds: retryAfter,
    });
  });

  it('applies the higher authenticated limit per API key', async () => {
    const server = app.getHttpServer();
    for (let i = 0; i < 4; i++) {
      await request(server).get('/').set('X-Api-Key', 'abc').expect(200);
    }
    await request(server).get('/').set('X-Api-Key', 'abc').expect(429);
    await request(server)
      .get('/')
      .set('Authorization', 'Bearer other')
      .expect(200);
    await request(server).get('/').expect(200);
  });

  it('counts unknown API keys against the client IP limit', async () => {
    const server = app.getHttpServer();
    await request(server).get('/').set('X-Api-Key', 'bogus-1').expect(200);
    await request(server).get('/').set('X-Api-Key', 'bogus-2').expect(200);
    await request(server).get('/').set('X-Api-Key', 'bogus-3').expect(429);
    await request(server).get('/').expect(429);
  });

  it('covers POST /shorten and redirects', async () => {
    const server = app.getHttpServer();
    const first = await request(server)
      .post('/shorten')
      .send({ url: 'https://docker.com' })
      .expect(201);
    await request(server).get(`/${first.body.hash}`).expect(302);
    await request(server).get(`/${first.body.hash}`).expect(429);
  });

  it('does not rate limit /health', async () => {
    const server = app.getHttpServer();
    for (let i = 0; i < 5; i++) {
      const res = await request(server).get('/health').expect(200);
      expect(res.body).toEqual({ status: 'ok' });
      expect(res.headers['x-ratelimit-limit']).toBeUndefined();
    }
    const trailing = await request(server).get('/health/').expect(200);
    expect(trailing.headers['x-ratelimit-limit']).toBeUndefined();
    await request(server).head('/health').expect(200);
  });

  it('rate limits non-GET requests to /health', async () => {
    const server = app.getHttpServer();
    await request(server).post('/health').expect(404);
    await request(server).post('/health').expect(404);
    await request(server).post('/health').expect(429);
  });
});
