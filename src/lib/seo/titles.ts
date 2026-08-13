/** Exact shell document title (seo-metadata spec). */
export const SHELL_TITLE = "Jonathan Soto · Backend & Full-Stack Engineer";

/** Deployed origin; also consumed by astro.config.mjs for the sitemap. */
export const SITE_URL = "https://jonasotoaguilar.dev";

/** Per-route canonical URL (seo-metadata spec): the route's absolute URL. */
export function canonicalUrl(pathname: string, siteUrl: string): string {
	return new URL(pathname, siteUrl).href;
}

/** Exact per-view document titles (seo-metadata spec: "{View} · Jonathan Soto"). */
export const VIEW_TITLES = {
	about: "About · Jonathan Soto",
	resume: "Resume · Jonathan Soto",
	projects: "Projects · Jonathan Soto",
	skills: "Skills · Jonathan Soto",
	contact: "Contact · Jonathan Soto",
} as const;

export type ViewRoute = keyof typeof VIEW_TITLES;
