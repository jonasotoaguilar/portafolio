/**
 * Test-only deny-list seam for finished-product copy.
 *
 * Product code MUST NOT import this module. It exists solely for
 * unit/e2e/dist scanning to ensure public copy stays finished-product
 * and phone-free. Pages import `site.linkedinUrl` instead.
 */

// Test-only: never imported by src/pages, src/components, src/data, src/layouts.
export const DENY_PATTERNS: readonly RegExp[] = [
  /\bCV\b/,
  /view source/i,
  /owner-authorized/i,
  /privacy by omission/i,
  /JSON-LD/i,
  /fabricated/i,
  /text-only until/i,
  /no form provider/i,
  /facts-only from/i,
  /as verified from/i,
  /from CV/i,
  /As stated in CV/i,
  /tel:/i,
  /telephone/i,
  /\b8894\b/,
  /\b2050\b/,
  /\+56/,
] as const;

export function containsDenied(text: string): boolean {
  return DENY_PATTERNS.some((re) => re.test(text));
}

export function findDenied(text: string): string[] {
  return DENY_PATTERNS.filter((re) => re.test(text)).map((re) => re.source);
}
