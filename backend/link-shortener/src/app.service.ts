import {
  ConflictException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { map, mergeMap, Observable, of, throwError } from 'rxjs';
import { AppRepository, AppRepositoryTag } from './app.repository';
import { normalizeUrl } from './url.validation';

const MAX_HASH_ATTEMPTS = 5;

@Injectable()
export class AppService {
  constructor(
    @Inject(AppRepositoryTag) private readonly appRepository: AppRepository,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  shorten(url: string, alias?: string): Observable<string> {
    const target = normalizeUrl(url);
    if (!alias) {
      return this.claimRandomHash(target, MAX_HASH_ATTEMPTS);
    }
    return this.claim(alias, target).pipe(
      mergeMap((claimed) =>
        claimed
          ? of(alias)
          : throwError(
              () => new ConflictException(`Alias '${alias}' is already taken.`),
            ),
      ),
    );
  }

  private claim(hash: string, url: string): Observable<boolean> {
    return this.appRepository
      .get(hash)
      .pipe(
        mergeMap((existing) =>
          existing
            ? of(false)
            : this.appRepository.put(hash, url).pipe(map(() => true)),
        ),
      );
  }

  private claimRandomHash(url: string, attempts: number): Observable<string> {
    const hash = Math.random().toString(36).slice(7);
    return this.claim(hash, url).pipe(
      mergeMap((claimed) => {
        if (claimed) {
          return of(hash);
        }
        if (attempts <= 1) {
          return throwError(
            () =>
              new ServiceUnavailableException(
                'Could not allocate a free hash. Please retry.',
              ),
          );
        }
        return this.claimRandomHash(url, attempts - 1);
      }),
    );
  }

  retrieve(hash: string): Observable<string> {
    return this.appRepository.get(hash);
  }
}
