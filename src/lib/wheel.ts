// Shared wheel math for the recycled-list carousels (skills contract,
// projects contract): trackpad deltas accumulate into a remainder and emit
// one discrete transition per threshold (default 53px), exactly like one
// ArrowUp/Down press — wheel changes focus/content, never scrollTop. The
// math is pure so it is unit-testable without a DOM; skills-scroll.ts and
// projects-scroll.ts wire it to their live wheel events (and never hijack
// Ctrl+wheel, which stays browser zoom). This module lives outside the
// route libs because both carousels share it.

/** Wheel delta threshold that emits one discrete transition (px). */
export const WHEEL_THRESHOLD_PX = 53;

/** Assumed line height for deltaMode === 1 (lines -> px). */
export const WHEEL_LINE_HEIGHT = 16;

/**
 * Normalizes a WheelEvent deltaY to pixels for the given deltaMode
 * (0 = px, 1 = lines, 2 = pages).
 */
export function normalizeWheelDelta(
	deltaY: number,
	deltaMode: number,
	pageLength: number,
): number {
	if (deltaMode === 1) return deltaY * WHEEL_LINE_HEIGHT;
	if (deltaMode === 2) return deltaY * pageLength;
	return deltaY;
}

/** Running remainder of unspent wheel delta, carried across events. */
export interface WheelAccumulator {
	remainder: number;
}

/**
 * Accumulates a normalized wheel delta and returns the number of discrete
 * transitions to emit (negative = up). Recovered contract: ONE wheel event
 * emits AT MOST ONE transition — a mouse wheel notch is a single intent, so
 * a large delta never skips several skills at once. Sub-threshold trackpad
 * deltas still pool across events (the fractional part stays in the
 * accumulator), and the excess of a large delta is banked rather than lost:
 * it flushes one step at a time on later events. The accumulator is clamped
 * to one threshold after each emit so sustained large deltas cannot grow the
 * bank without bound.
 */
export function consumeWheelSteps(
	acc: WheelAccumulator,
	deltaY: number,
	deltaMode: number,
	pageLength: number,
	threshold = WHEEL_THRESHOLD_PX,
): number {
	if (!(threshold > 0)) return 0;
	acc.remainder += normalizeWheelDelta(deltaY, deltaMode, pageLength);
	const rawSteps = Math.trunc(acc.remainder / threshold);
	if (rawSteps === 0) return 0;
	// Truncating a tiny negative fraction yields -0; Math.max(-1, min(1, -0))
	// normalizes it to 0, so callers never see a signed zero step.
	const steps = Math.max(-1, Math.min(1, rawSteps));
	acc.remainder -= steps * threshold;
	acc.remainder = Math.max(-threshold, Math.min(threshold, acc.remainder));
	return steps;
}
