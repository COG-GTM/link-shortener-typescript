import { isValidUrl, normalizeUrl } from './url.validation';

describe('normalizeUrl', () => {
  it('should prepend https when no protocol is given', () => {
    expect(normalizeUrl('aerabi.com')).toEqual('https://aerabi.com');
  });

  it('should keep an existing protocol', () => {
    expect(normalizeUrl(' http://aerabi.com ')).toEqual('http://aerabi.com');
  });
});

describe('isValidUrl', () => {
  it.each([
    'aerabi.com',
    'https://aerabi.com/path?q=1',
    'http://localhost:3000',
  ])('should accept %s', (url) => {
    expect(isValidUrl(url)).toBe(true);
  });

  it.each(['', '   ', 'ftp://aerabi.com', 'javascript:alert(1)', 'https://'])(
    'should reject %s',
    (url) => {
      expect(isValidUrl(url)).toBe(false);
    },
  );
});
