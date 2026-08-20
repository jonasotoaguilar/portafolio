import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
	consumeWheelSteps,
	normalizeWheelDelta,
	toRoman,
	WHEEL_LINE_HEIGHT,
	WHEEL_THRESHOLD_PX,
} from "../../src/lib/skills/window";

// Skills scroll contract: no geometry dependency, thumb is inlined logical
// math (ratio = VISIBLE_SLOTS / count, progress = windowStart / maxStart),
// wheel threshold ~53px preserved. Guard locks the committed baseline after
// deletion of SkillsRail/geometry.

// Guard: no geometry dependency and inlined thumb contract.
describe("skills-scroll geometry guard", () => {
	const scrollPath = resolve("src/scripts/skills-scroll.ts");
	const scrollSource = readFileSync(scrollPath, "utf8");

	it("does not import or reference geometry module", () => {
		expect(scrollSource).not.toMatch(/from\s+["'].*geometry/i);
		expect(scrollSource).not.toMatch(/import.*geometry/i);
		expect(scrollSource).not.toMatch(/geometry\.ts/i);
		expect(scrollSource).not.toMatch(/SkillsRail/);
	});

	it("does not use railThumbMetrics helper", () => {
		expect(scrollSource).not.toMatch(/railThumbMetrics/);
	});

	it("inlines logical thumb math (ratio + progress + CSS vars)", () => {
		// Inlined contract from committed baseline: ratio = VISIBLE_SLOTS /
		// data.length, progress = windowStart / maxStart, then CSS vars.
		expect(scrollSource).toContain("VISIBLE_SLOTS / data.length");
		expect(scrollSource).toContain("windowStart / maxStart");
		expect(scrollSource).toContain("--skills-thumb-width");
		expect(scrollSource).toContain("--skills-thumb-left");
		expect(scrollSource).toContain("maxStart");
	});
});

// Skills wheel contract: deltas accumulate into a remainder and emit one
// discrete transition per threshold (53px), exactly like one ArrowUp/Down
// press — wheel changes focus/content, never scrollTop. The math is pure so
// it is unit-testable without a DOM; skills-scroll.ts wires it to the
// live wheel events (and never hijacks Ctrl+wheel, which stays zoom).

describe("WHEEL_THRESHOLD_PX contract", () => {
	it("preserves the ~53px wheel threshold", () => {
		expect(WHEEL_THRESHOLD_PX).toBe(53);
		expect(WHEEL_LINE_HEIGHT).toBe(16);
	});
});

describe("normalizeWheelDelta", () => {
	it("keeps pixel-mode deltas as-is", () => {
		expect(normalizeWheelDelta(53, 0, 800)).toBe(53);
		expect(normalizeWheelDelta(-30, 0, 800)).toBe(-30);
	});

	it("scales line-mode deltas by the assumed line height", () => {
		expect(normalizeWheelDelta(1, 1, 800)).toBe(WHEEL_LINE_HEIGHT);
		expect(normalizeWheelDelta(-2, 1, 800)).toBe(-2 * WHEEL_LINE_HEIGHT);
	});

	it("scales page-mode deltas by the page length", () => {
		expect(normalizeWheelDelta(1, 2, 800)).toBe(800);
		expect(normalizeWheelDelta(-1, 2, 500)).toBe(-500);
	});
});

describe("consumeWheelSteps", () => {
	it("emits one step per threshold and carries the remainder", () => {
		const acc = { remainder: 0 };
		expect(consumeWheelSteps(acc, WHEEL_THRESHOLD_PX, 0, 800)).toBe(1);
		expect(acc.remainder).toBe(0);
		expect(consumeWheelSteps(acc, 40, 0, 800)).toBe(0);
		expect(acc.remainder).toBe(40);
		expect(consumeWheelSteps(acc, 40, 0, 800)).toBe(1);
		expect(acc.remainder).toBe(27);
	});

	it("accumulates sub-threshold deltas across events", () => {
		const acc = { remainder: 0 };
		expect(consumeWheelSteps(acc, 18, 0, 800)).toBe(0);
		expect(consumeWheelSteps(acc, 18, 0, 800)).toBe(0);
		expect(consumeWheelSteps(acc, 18, 0, 800)).toBe(1);
		expect(acc.remainder).toBe(1);
	});

	it("emits at most one step from one large delta", () => {
		const acc = { remainder: 0 };
		expect(consumeWheelSteps(acc, WHEEL_THRESHOLD_PX * 3 + 10, 0, 800)).toBe(1);
		expect(acc.remainder).toBe(WHEEL_THRESHOLD_PX);
	});

	it("mirrors the math for upward (negative) deltas", () => {
		const acc = { remainder: 0 };
		expect(consumeWheelSteps(acc, -WHEEL_THRESHOLD_PX, 0, 800)).toBe(-1);
		expect(acc.remainder).toBe(0);
		expect(consumeWheelSteps(acc, -30, 0, 800)).toBe(0);
		expect(consumeWheelSteps(acc, -30, 0, 800)).toBe(-1);
		expect(acc.remainder).toBe(-7);
	});

	it("honors a custom threshold", () => {
		const acc = { remainder: 0 };
		expect(consumeWheelSteps(acc, 100, 0, 800, 100)).toBe(1);
		expect(acc.remainder).toBe(0);
	});

	it("is safe with degenerate inputs", () => {
		const acc = { remainder: 0 };
		expect(consumeWheelSteps(acc, 10, 0, 800, 0)).toBe(0);
		expect(acc.remainder).toBe(0);
	});
});

describe("toRoman", () => {
	it("renders one-based skill positions", () => {
		expect(toRoman(1)).toBe("I");
		expect(toRoman(22)).toBe("XXII");
	});

	it("rejects positions outside the supported range", () => {
		expect(toRoman(0)).toBe("");
		expect(toRoman(4000)).toBe("");
	});
});
