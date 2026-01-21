import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { AppRepositoryTag, AppRepositoryHashmap } from './repository';
import { HashGeneratorTag, DefaultHashGenerator } from './shortener';
import { mergeMap, tap } from 'rxjs';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AppRepositoryTag, useClass: AppRepositoryHashmap },
        { provide: HashGeneratorTag, useClass: DefaultHashGenerator },
        AppService,
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  describe('retrieve', () => {
    it('should retrieve the saved URL', (done) => {
      const url = 'aerabi.com';
      appService
        .shorten(url)
        .pipe(mergeMap((hash) => appService.retrieve(hash)))
        .pipe(tap((retrieved) => expect(retrieved).toEqual(url)))
        .subscribe({ complete: done });
    });
  });
});
