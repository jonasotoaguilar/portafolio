import { describe, expect, it } from "vitest";

import { entranceOptions } from "../../src/lib/motion/entrances";

describe("entranceOptions", () => {
	it("defaults to a transform+opacity entrance under 300ms", () => {
		const options = entranceOptions(false);

		expect(options.reduced).toBe(false);
		expect(options.duration).toBeLessThanOrEqual(300);
		expect(options.y).toBe(8);
		expect(options.opacity).toEqual([0, 1]);
	});

	it("reduced motion is an opacity-only entrance at most 200ms", () => {
		const options = entranceOptions(true);

		expect(options.reduced).toBe(true);
		expect(options.duration).toBeLessThanOrEqual(200);
		expect(options.y).toBe(0);
		expect(options.opacity).toEqual([0, 1]);
	});
});
