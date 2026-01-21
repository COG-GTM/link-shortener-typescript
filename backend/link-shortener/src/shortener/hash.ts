/**
 * Hash generation utilities for URL shortening
 */

export function generateHash(): string {
  return Math.random().toString(36).slice(7);
}

export const HashGeneratorTag = 'HashGenerator';

export interface HashGenerator {
  generate(): string;
}

export class DefaultHashGenerator implements HashGenerator {
  generate(): string {
    return generateHash();
  }
}
