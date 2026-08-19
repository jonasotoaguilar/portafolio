import { describe, expect, it } from "vitest";

import {
	COMMITS_LABEL,
	metricAriaText,
	metricValue,
	PULL_REQUEST_ICON_PATH,
	PULL_REQUESTS_LABEL,
} from "../../src/lib/projects/metrics";

// Row metrics (projects contract): exact numbers render as-is, null
// metrics render the em dash (never a fake zero), and the accessible copy
// names the icon-only metric so the repeated glyphs stay understandable.

describe("metricValue", () => {
	it("renders exact numbers", () => {
		expect(metricValue(205)).toBe("205");
		expect(metricValue(0)).toBe("0");
	});

	it("renders the em dash for non-GitHub projects", () => {
		expect(metricValue(null)).toBe("—");
	});
});

describe("metricAriaText", () => {
	it("names the metric with its value", () => {
		expect(metricAriaText("pr", 12)).toBe("12 pull requests");
		expect(metricAriaText("commits", 205)).toBe("205 commits");
	});

	it("explains the em dash for null metrics", () => {
		expect(metricAriaText("pr", null)).toBe("no pull requests");
		expect(metricAriaText("commits", null)).toBe("no commits");
	});
});

describe("metric labels", () => {
	it("the legend nouns match the aria copy", () => {
		expect(PULL_REQUESTS_LABEL).toBe("pull requests");
		expect(COMMITS_LABEL).toBe("commits");
	});
});

describe("pull-request glyph", () => {
	it("ships as flat authored path data, never empty", () => {
		expect(PULL_REQUEST_ICON_PATH.length).toBeGreaterThan(0);
		expect(PULL_REQUEST_ICON_PATH).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9.\s-]+$/);
	});
});
