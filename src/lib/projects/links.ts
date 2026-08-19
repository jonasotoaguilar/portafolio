// Project row link glyphs (projects contract): each project row shows the
// correct link icon at its right edge — the GitHub mark for GitHub URLs, a
// flat globe for any other deployed/site URL. Both are AUTHORED inline SVG
// glyphs (flat filled geometry, no icon package, no Unicode substitutes).
// The repeated glyph is self-explanatory without visible text: the icon is
// a named image (role="img") whose accessible name is derived from the URL
// kind ("Open on GitHub" / "Open project website"), so the row's accessible
// name composes as "Title Open on GitHub", and the row anchor carries the
// same copy as its native title tooltip. The visible label stays the
// project title. The same pure kind derivation is used by the SSR fallback
// rows and by the client-side slot re-render, so a record's icon and label
// never drift between the initial HTML and the enhanced window.

export type ProjectLinkKind = "github" | "web";

/** GitHub octocat silhouette (24x24, evenodd). */
export const GITHUB_ICON_PATHS: readonly string[] = [
	"M11.99 2C6.47 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33s1.7.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48 3.97-1.33 6.83-5.08 6.83-9.5 0-5.52-4.47-10-10.01-10z",
];

/** Flat globe: ring + vertical meridian + equator (24x24, evenodd). */
export const GLOBE_ICON_PATHS: readonly string[] = [
	"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14z",
	"M11.4 3.6h1.2v16.8h-1.2z",
	"M3.4 11.3h17.2v1.4H3.4z",
];

/**
 * Derives the row icon kind from a project link: GitHub-hosted URLs get the
 * GitHub mark, everything else (itch.io, personal domains, ...) the globe.
 * The schema guarantees a valid URL, so the fallback only guards malformed
 * hand-typed links.
 */
export function projectLinkKind(link: string): ProjectLinkKind {
	try {
		const hostname = new URL(link).hostname;
		return hostname === "github.com" || hostname.endsWith(".github.com")
			? "github"
			: "web";
	} catch {
		return "web";
	}
}

/** Accessible-name and tooltip copy for the row's link icon, per URL kind. */
export const PROJECT_LINK_LABELS: Record<ProjectLinkKind, string> = {
	github: "Open on GitHub",
	web: "Open project website",
};

/**
 * The icon's accessible name and native tooltip for a project link: the
 * GitHub mark means the URL opens on GitHub, the globe means a project
 * website. Kept next to the kind derivation so the SSR fallback rows and
 * the recycled-slot re-render can never drift.
 */
export function projectLinkLabel(link: string): string {
	return PROJECT_LINK_LABELS[projectLinkKind(link)];
}
