import { describe, expect, it } from "vitest";
import {
	BUBBLE_CAP,
	createBubbles,
	renderBubbles,
	stepBubbles,
} from "../../src/lib/canvas/bubbles";
import {
	cappedDpr,
	createParticleField,
	PARTICLE_CAP,
	renderParticles,
	seededRng,
	stepParticles,
} from "../../src/lib/canvas/particles";
import {
	createWaveField,
	renderWaves,
	stepWaves,
	WAVE_BAND_CAP,
} from "../../src/lib/canvas/waves";

describe("PARTICLE_CAP", () => {
	it("caps the particle field at 120", () => {
		expect(PARTICLE_CAP).toBe(120);
	});
});
describe("cappedDpr", () => {
	it("never exceeds 2 and keeps lower values", () => {
		expect(cappedDpr(3)).toBe(2);
		expect(cappedDpr(2.5)).toBe(2);
		expect(cappedDpr(2)).toBe(2);
		expect(cappedDpr(1)).toBe(1);
		expect(cappedDpr(0.5)).toBe(0.5);
	});
});
describe("seededRng", () => {
	it("is deterministic per seed and differs across seeds", () => {
		const a = seededRng(42);
		const b = seededRng(42);
		const c = seededRng(7);
		expect(a()).toBe(b());
		expect(a()).toBe(b());
		expect(a()).not.toBe(c());
	});
});
describe("createParticleField", () => {
	const rng = seededRng(42);

	it("keeps particles inside the canvas bounds with radius and drift speed", () => {
		const field = createParticleField(10, 800, 600, rng);

		expect(field.particles).toHaveLength(10);
		for (const particle of field.particles) {
			expect(particle.x).toBeGreaterThanOrEqual(0);
			expect(particle.x).toBeLessThanOrEqual(800);
			expect(particle.y).toBeGreaterThanOrEqual(0);
			expect(particle.y).toBeLessThanOrEqual(600);
			expect(particle.radius).toBeGreaterThan(0);
			expect(particle.opacity).toBeGreaterThan(0);
			expect(particle.opacity).toBeLessThanOrEqual(1);
			const speed = Math.hypot(particle.vx, particle.vy);
			expect(speed).toBeGreaterThanOrEqual(0.2);
			expect(speed).toBeLessThanOrEqual(0.5);
		}
	});

	it("clamps the count to PARTICLE_CAP and accepts zero", () => {
		expect(createParticleField(1000, 800, 600, rng).particles).toHaveLength(
			PARTICLE_CAP,
		);
		expect(createParticleField(0, 800, 600, rng).particles).toHaveLength(0);
	});

	it("is deterministic for the same seeded rng", () => {
		const a = createParticleField(10, 800, 600, seededRng(42));
		const b = createParticleField(10, 800, 600, seededRng(42));

		expect(a).toEqual(b);
	});
});
describe("stepParticles", () => {
	it("moves every particle by its velocity without mutating the input", () => {
		const field = createParticleField(5, 800, 600, seededRng(42));
		const before = structuredClone(field);
		const stepped = stepParticles(field);
		expect(stepped).not.toBe(field);
		expect(field).toEqual(before);
		for (let i = 0; i < field.particles.length; i++) {
			expect(stepped.particles[i].x).toBeCloseTo(
				field.particles[i].x + field.particles[i].vx,
				10,
			);
			expect(stepped.particles[i].y).toBeCloseTo(
				field.particles[i].y + field.particles[i].vy,
				10,
			);
		}
	});

	it("wraps particles that drift past the right edge", () => {
		const field = createParticleField(1, 100, 100, () => 0.5);
		field.particles[0].x = 99.9;
		field.particles[0].vx = 0.5;
		field.particles[0].y = 50;
		field.particles[0].vy = 0;
		const stepped = stepParticles(field);

		expect(stepped.particles[0].x).not.toBe(100.4);
		expect(stepped.particles[0].x).toBeGreaterThanOrEqual(0);
		expect(stepped.particles[0].x).toBeLessThanOrEqual(100);
	});
});
describe("renderParticles", () => {
	it("draws one arc per particle and does not mutate the field", () => {
		let arcCalls = 0;
		const ctx = {
			globalAlpha: 1,
			fillStyle: "",
			beginPath: () => {},
			arc: () => {
				arcCalls++;
			},
			fill: () => {},
		};
		const field = createParticleField(4, 800, 600, seededRng(42));
		const before = structuredClone(field);

		renderParticles(field, ctx as unknown as CanvasRenderingContext2D);
		expect(arcCalls).toBe(4);
		expect(field).toEqual(before);
	});
});
/** Minimal 2D-context double counting draw calls. */
function mockCtx() {
	const calls = { paths: 0, fills: 0, arcs: 0 };
	const ctx = {
		fillStyle: "",
		globalAlpha: 1,
		beginPath: () => {
			calls.paths++;
		},
		moveTo: () => {},
		lineTo: () => {},
		closePath: () => {},
		arc: () => {
			calls.arcs++;
		},
		fill: () => {
			calls.fills++;
		},
	};
	return { ctx, calls };
}
describe("createWaveField", () => {
	it("is deterministic per seed, capped at 3 bands, in-canvas geometry", () => {
		expect(WAVE_BAND_CAP).toBe(3);
		const a = createWaveField(42, 800, 600);
		expect(createWaveField(42, 800, 600)).toEqual(a);
		expect(a.bands).toHaveLength(WAVE_BAND_CAP);
		expect(a.bands.map((band) => band.phase)).not.toEqual(
			createWaveField(7, 800, 600).bands.map((band) => band.phase),
		);
		for (const band of a.bands) {
			expect(band.baseY * 600).toBeGreaterThan(0);
			expect(band.baseY * 600).toBeLessThan(600);
			expect(band.amplitude).toBeGreaterThan(0);
			expect(band.wavelength).toBeGreaterThan(0);
			expect(band.thickness).toBeGreaterThan(0);
			expect(band.speed).toBeGreaterThan(0);
			expect(band.alpha).toBeGreaterThan(0);
			expect(band.alpha).toBeLessThanOrEqual(1);
		}
	});
});
describe("stepWaves", () => {
	it("advances every phase without mutating the field", () => {
		const field = createWaveField(42, 800, 600);
		const before = structuredClone(field);
		const stepped = stepWaves(field);
		expect(stepped).not.toBe(field);
		expect(field).toEqual(before);
		for (let i = 0; i < field.bands.length; i++) {
			expect(stepped.bands[i].phase).not.toBe(field.bands[i].phase);
		}
	});
});
describe("renderWaves", () => {
	it("paints one path per band without mutating the field", () => {
		const { ctx, calls } = mockCtx();
		const field = createWaveField(42, 800, 600);
		const before = structuredClone(field);
		renderWaves(field, ctx as unknown as CanvasRenderingContext2D);
		expect(calls.paths).toBe(WAVE_BAND_CAP);
		expect(calls.fills).toBe(WAVE_BAND_CAP);
		expect(field).toEqual(before);
	});
});
describe("createBubbles", () => {
	it("is deterministic per seed, capped at 24, in-bounds", () => {
		expect(BUBBLE_CAP).toBe(24);
		const a = createBubbles(42, 800, 600);
		expect(createBubbles(42, 800, 600)).toEqual(a);
		expect(createBubbles(7, 800, 600).bubbles).not.toEqual(a.bubbles);
		expect(createBubbles(1000, 800, 600).bubbles).toHaveLength(BUBBLE_CAP);
		for (const bubble of a.bubbles) {
			expect(bubble.x).toBeGreaterThanOrEqual(0);
			expect(bubble.x).toBeLessThanOrEqual(800);
			expect(bubble.y).toBeGreaterThanOrEqual(0);
			expect(bubble.y).toBeLessThanOrEqual(600);
			expect(bubble.radius).toBeGreaterThan(0);
			expect(bubble.speed).toBeGreaterThan(0);
			expect(bubble.opacity).toBeGreaterThan(0);
			expect(bubble.opacity).toBeLessThanOrEqual(1);
		}
	});
});
describe("stepBubbles", () => {
	it("rises bubbles and respawns above the top, immutably", () => {
		const field = createBubbles(42, 800, 600);
		const before = structuredClone(field);
		const stepped = stepBubbles(field);
		expect(stepped).not.toBe(field);
		expect(field).toEqual(before);
		for (let i = 0; i < field.bubbles.length; i++) {
			expect(stepped.bubbles[i].y).toBe(
				field.bubbles[i].y - field.bubbles[i].speed,
			);
		}
		const escaped = stepBubbles({
			...field,
			bubbles: [{ ...field.bubbles[0], y: -10, radius: 4 }],
		});
		expect(escaped.bubbles[0].y).toBe(field.height + 4);
	});
});
describe("renderBubbles", () => {
	it("paints one arc per bubble without mutating the field", () => {
		const { ctx, calls } = mockCtx();
		const field = createBubbles(42, 800, 600);
		const before = structuredClone(field);
		renderBubbles(field, ctx as unknown as CanvasRenderingContext2D);
		expect(calls.arcs).toBe(field.bubbles.length);
		expect(field).toEqual(before);
	});
});
