const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const SCHEME_PATTERN = /^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/)?/;

function isHostLike(candidate: string): boolean {
  return candidate.includes('.') || candidate === 'localhost';
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  const match = trimmed.match(SCHEME_PATTERN);
  const hasScheme = !!match && (!!match[2] || !isHostLike(match[1]));
  return hasScheme ? trimmed : `https://${trimmed}`;
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    return ALLOWED_PROTOCOLS.includes(parsed.protocol) && !!parsed.hostname;
  } catch {
    return false;
  }
}
