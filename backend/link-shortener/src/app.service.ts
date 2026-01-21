import { Inject, Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { AppRepository, AppRepositoryTag } from './repository';
import { HashGenerator, HashGeneratorTag } from './shortener';

@Injectable()
export class AppService {
  constructor(
    @Inject(AppRepositoryTag) private readonly appRepository: AppRepository,
    @Inject(HashGeneratorTag) private readonly hashGenerator: HashGenerator,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  shorten(url: string): Observable<string> {
    const hash = this.hashGenerator.generate();
    return this.appRepository.put(hash, url).pipe(map(() => hash));
  }

  retrieve(hash: string): Observable<string> {
    return this.appRepository.get(hash);
  }
}
