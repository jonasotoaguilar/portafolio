/** Sitemap eligibility: the 404 page (and its generated html form) must never be listed. */
export function isSitemapEligible(page: string): boolean {
	return !page.endsWith("/404") && !page.endsWith("/404.html");
}
