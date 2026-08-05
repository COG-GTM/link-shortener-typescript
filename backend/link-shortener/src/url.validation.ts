const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const SCHEME_PATTERN = /^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/)?/;
const ALIAS_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/;

function isHostLike(candidate: string): boolean {
  return candidate.includes('.') || candidate.toLowerCase() === 'localhost';
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  const match = trimmed.match(SCHEME_PATTERN);
  const hasScheme = !!match && (!!match[2] || !isHostLike(match[1]));
  return hasScheme ? trimmed : `https://${trimmed}`;
}

export function isValidAlias(alias: string): boolean {
  return ALIAS_PATTERN.test(alias);
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    return ALLOWED_PROTOCOLS.includes(parsed.protocol) && !!parsed.hostname;
  } catch {
    return false;
  }
}
