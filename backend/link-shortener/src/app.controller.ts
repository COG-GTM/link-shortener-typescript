import { Body, Controller, Get, Param, Post, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { map, Observable, of } from 'rxjs';
import { isValidAlias, isValidUrl } from './url.validation';

interface ShortenResponse {
  hash: string;
}

interface ErrorResponse {
  error: string;
  code: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('shorten')
  shorten(
    @Body('url') url: string,
    @Body('alias') alias?: string,
  ): Observable<ShortenResponse | ErrorResponse> {
    if (!url) {
      return of({
        error: `No url provided. Please provide in the body. E.g. {'url':'https://google.com'}`,
        code: 400,
      });
    }
    if (!isValidUrl(url)) {
      return of({
        error: `Invalid url provided: '${url}'. Only http and https urls are supported.`,
        code: 400,
      });
    }
    if (alias !== undefined && !isValidAlias(alias)) {
      return of({
        error: `Invalid alias provided: '${alias}'. Use 3-32 letters, digits, hyphens or underscores.`,
        code: 400,
      });
    }
    return this.appService.shorten(url, alias).pipe(map((hash) => ({ hash })));
  }

  @Get(':hash')
  @Redirect()
  retrieveAndRedirect(@Param('hash') hash): Observable<{ url: string }> {
    return this.appService.retrieve(hash).pipe(map((url) => ({ url })));
  }
}
