// Project row metrics (projects contract): each project row shows its
// GitHub PR and commit counts at the right edge, next to the link icon.
// Pure formatting shared by the SSR fallback rows (ProjectListItem.astro)
// and the recycled-slot re-render (projects-scroll.ts), so the visible
// value and the accessible copy can never drift between the initial HTML
// and the enhanced window. `null` means the project has no GitHub
// repository (e.g. WealthQuest on itch.io) and renders as an em dash.
//
// The PR glyph is an AUTHORED inline SVG (the developer-icons package has
// no pull-request export; the row's commit count uses its Git icon). The
// GitHub pull-request silhouette is simple flat geometry — a vertical line
// with a node at each end — drawn 24x24 to match the row's link icons.

/** Authored pull-request glyph (24x24, flat filled geometry). */
export const PULL_REQUEST_ICON_PATH =
	"M11 7.05V3a1 1 0 0 1 2 0v4.05A5 5 0 0 1 18 12v5.05a2.5 2.5 0 1 1-2 0V12a3 3 0 0 0-3-3H9.5a2.5 2.5 0 1 1-2 0H11zM6.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z";

/** Accessible noun for the PR metric ("12 pull requests"). */
export const PULL_REQUESTS_LABEL = "pull requests";

/** Accessible noun for the commit metric ("205 commits"). */
export const COMMITS_LABEL = "commits";

/**
 * Visible metric value: the exact number, or the em dash for non-GitHub
 * projects (presentation contract: null metrics never show a fake zero).
 */
export function metricValue(value: number | null): string {
	return value === null ? "—" : String(value);
}

/**
 * Accessible copy for an icon-only metric: "12 pull requests",
 * "205 commits", or "no pull requests" / "no commits" for the em dash.
 */
export function metricAriaText(
	kind: "pr" | "commits",
	value: number | null,
): string {
	const noun = kind === "pr" ? PULL_REQUESTS_LABEL : COMMITS_LABEL;
	return value === null ? `no ${noun}` : `${value} ${noun}`;
}
