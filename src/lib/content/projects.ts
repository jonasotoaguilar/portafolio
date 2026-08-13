/**
 * Content completeness boundary: the portfolio page MUST render exactly the
 * four declared projects. Throwing here fails the build with no output.
 */
export function assertExactlyFour<T>(entries: T[]): T[] {
	if (entries.length !== 4) {
		throw new Error(`Expected exactly 4 projects, got ${entries.length}`);
	}
	return entries;
}

/** Render order is the declared `order` field; input is not mutated. */
export function sortByOrder<T extends { order: number }>(entries: T[]): T[] {
	return [...entries].sort((a, b) => a.order - b.order);
}

/**
 * A link leaves the portfolio when it is absolute and its origin differs from
 * the site origin. Without a known site origin, any absolute http(s) link is
 * treated as external; relative links are always internal.
 */
export function isExternalLink(href: string, siteOrigin?: string): boolean {
	let url: URL;
	try {
		url = new URL(href, siteOrigin);
	} catch {
		return false;
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		return false;
	}
	return siteOrigin === undefined || url.origin !== siteOrigin;
}
