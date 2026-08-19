import { describe, expect, it } from "vitest";

import {
	GITHUB_ICON_PATHS,
	GLOBE_ICON_PATHS,
	PROJECT_LINK_LABELS,
	projectLinkKind,
	projectLinkLabel,
} from "../../src/lib/projects/links";

// Row link glyphs (projects contract): the right-edge icon follows the
// project URL — GitHub mark for GitHub-hosted links, flat globe otherwise.
// The kind derivation is pure so SSR fallback rows and the enhanced slot
// re-render can never drift.

describe("projectLinkKind", () => {
	it("maps github.com links to the github mark", () => {
		expect(
			projectLinkKind("https://github.com/jonasotoaguilar/ServiceFlow"),
		).toBe("github");
		expect(
			projectLinkKind(
				"https://github.com/BlendedGames-bGames/bGames-FintualSensor",
			),
		).toBe("github");
	});

	it("maps github subdomains to the github mark", () => {
		expect(projectLinkKind("https://pages.github.com/project")).toBe("github");
	});

	it("maps deployed/site links to the globe", () => {
		expect(projectLinkKind("https://jonasotoaguilar.itch.io/wealthquest")).toBe(
			"web",
		);
		expect(projectLinkKind("https://example.com/project")).toBe("web");
	});

	it("is safe with malformed links", () => {
		expect(projectLinkKind("not a url")).toBe("web");
		expect(projectLinkKind("")).toBe("web");
	});
});

describe("projectLinkLabel", () => {
	it("labels GitHub links as opening on GitHub", () => {
		expect(
			projectLinkLabel("https://github.com/jonasotoaguilar/ServiceFlow"),
		).toBe("Open on GitHub");
		expect(
			projectLinkLabel("https://github.com/jonasotoaguilar/eventcommerce"),
		).toBe("Open on GitHub");
	});

	it("labels every other link as the project website", () => {
		expect(
			projectLinkLabel("https://jonasotoaguilar.itch.io/wealthquest"),
		).toBe("Open project website");
		expect(projectLinkLabel("https://example.com/project")).toBe(
			"Open project website",
		);
		// Malformed links fall back to the web label, matching the glyph.
		expect(projectLinkLabel("not a url")).toBe("Open project website");
	});

	it("the label record covers exactly both kinds", () => {
		expect(Object.keys(PROJECT_LINK_LABELS).sort()).toEqual(["github", "web"]);
		expect(PROJECT_LINK_LABELS.github).toBe("Open on GitHub");
		expect(PROJECT_LINK_LABELS.web).toBe("Open project website");
	});
});

describe("row icon glyphs", () => {
	it("ship as flat authored path data, never empty", () => {
		for (const paths of [GITHUB_ICON_PATHS, GLOBE_ICON_PATHS]) {
			expect(paths.length).toBeGreaterThan(0);
			for (const d of paths) {
				expect(d.length).toBeGreaterThan(0);
				expect(d).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9.\s-]+$/);
			}
		}
	});

	it("both kinds are distinct", () => {
		expect(GITHUB_ICON_PATHS.join()).not.toBe(GLOBE_ICON_PATHS.join());
	});
});
