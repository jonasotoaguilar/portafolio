import { describe, expect, it } from "vitest";

import {
	consumeWheelSteps,
	normalizeWheelDelta,
	WHEEL_LINE_HEIGHT,
	WHEEL_THRESHOLD_PX,
} from "../../src/lib/skills/window";

// Skills wheel contract: deltas accumulate into a remainder and emit one
// discrete transition per threshold (53px), exactly like one ArrowUp/Down
// press — wheel changes focus/content, never scrollTop. The math is pure so
// it is unit-testable without a DOM; skills-scroll.ts wires it to the
// live wheel events (and never hijacks Ctrl+wheel, which stays zoom).

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

	it("emits several steps from one large delta", () => {
		const acc = { remainder: 0 };
		expect(consumeWheelSteps(acc, WHEEL_THRESHOLD_PX * 3 + 10, 0, 800)).toBe(3);
		expect(acc.remainder).toBe(10);
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
