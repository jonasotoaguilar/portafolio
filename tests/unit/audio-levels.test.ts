import { describe, expect, it } from "vitest";

import { AMBIENT_VOLUME, EFFECT_VOLUME } from "../../src/lib/audio/levels";

describe("audio levels", () => {
	it("ambient music plays at a very quiet base volume (0.1), not full scale", () => {
		expect(AMBIENT_VOLUME).toBe(0.1);
	});

	it("effects are strong but stay below a full-scale UI click", () => {
		expect(EFFECT_VOLUME).toBe(0.65);
		expect(EFFECT_VOLUME).toBeLessThan(1);
	});

	it("effects sit clearly above the ambient bed so they are not masked", () => {
		expect(EFFECT_VOLUME).toBeGreaterThan(AMBIENT_VOLUME);
	});

	it("all levels stay within the 0..1 element-volume range", () => {
		expect(AMBIENT_VOLUME).toBeGreaterThan(0);
		expect(AMBIENT_VOLUME).toBeLessThanOrEqual(1);
		expect(EFFECT_VOLUME).toBeGreaterThan(0);
		expect(EFFECT_VOLUME).toBeLessThanOrEqual(1);
	});
});
