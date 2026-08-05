import { isValidUrl, normalizeUrl } from './url.validation';

describe('normalizeUrl', () => {
  it('should prepend https when no protocol is given', () => {
    expect(normalizeUrl('aerabi.com')).toEqual('https://aerabi.com');
  });

  it('should keep an existing protocol', () => {
    expect(normalizeUrl(' http://aerabi.com ')).toEqual('http://aerabi.com');
  });

  it('should treat a schemeless host:port as a host', () => {
    expect(normalizeUrl('aerabi.com:8080/path')).toEqual(
      'https://aerabi.com:8080/path',
    );
  });
});

describe('isValidUrl', () => {
  it.each([
    'aerabi.com',
    'https://aerabi.com/path?q=1',
    'http://localhost:3000',
    'localhost:3000',
    'LOCALHOST:3000',
    'aerabi.com:8080/path',
  ])('should accept %s', (url) => {
    expect(isValidUrl(url)).toBe(true);
  });

  it.each([
    '',
    '   ',
    'ftp://aerabi.com',
    'javascript:alert(1)',
    'javascript:12345',
    'mailto:a@b.com',
    'data:text/html,<script>alert(1)</script>',
    'https://',
  ])('should reject %s', (url) => {
    expect(isValidUrl(url)).toBe(false);
  });
});
