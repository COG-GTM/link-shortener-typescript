const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return SCHEME_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    return ALLOWED_PROTOCOLS.includes(parsed.protocol) && !!parsed.hostname;
  } catch {
    return false;
  }
}
