import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { AppRepositoryTag } from './app.repository';
import { AppRepositoryHashmap } from './app.repository.hashmap';
import { mergeMap, tap } from 'rxjs';
import { ConflictException } from '@nestjs/common';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AppRepositoryTag, useClass: AppRepositoryHashmap },
        AppService,
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  describe('retrieve', () => {
    it('should retrieve the saved URL', (done) => {
      const url = 'https://aerabi.com';
      appService
        .shorten(url)
        .pipe(mergeMap((hash) => appService.retrieve(hash)))
        .pipe(tap((retrieved) => expect(retrieved).toEqual(url)))
        .subscribe({ complete: done });
    });
  });

  describe('shorten with alias', () => {
    it('should use the alias as the hash', (done) => {
      const url = 'https://aerabi.com';
      appService
        .shorten(url, 'my-link')
        .pipe(tap((hash) => expect(hash).toEqual('my-link')))
        .pipe(mergeMap(() => appService.retrieve('my-link')))
        .pipe(tap((retrieved) => expect(retrieved).toEqual(url)))
        .subscribe({ complete: done });
    });

    it('should reject an alias that is already taken', (done) => {
      const url = 'https://aerabi.com';
      appService
        .shorten(url, 'my-link')
        .pipe(mergeMap(() => appService.shorten(url, 'my-link')))
        .subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(ConflictException);
            done();
          },
          complete: () => done(new Error('expected a conflict')),
        });
    });
  });
});
