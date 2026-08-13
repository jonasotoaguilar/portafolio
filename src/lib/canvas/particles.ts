/** Maximum particles rendered per frame (DESIGN.md performance contract). */
export const PARTICLE_CAP = 120;
/** Upper bound for the canvas backing-store scale (DESIGN.md: DPR cap). */
const MAX_DPR = 2;
/** Per-particle drift speed range in px/frame (DESIGN.md motion table). */
const DRIFT_MIN = 0.2;
const DRIFT_MAX = 0.5;
/** Canvas fog dots are tinted with the accent-300 token (#7c92ff). */
const PARTICLE_COLOR = "rgb(124, 146, 255)";
export interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	opacity: number;
}
export interface ParticleField {
	particles: Particle[];
	width: number;
	height: number;
}
/** Deterministic seeded PRNG (mulberry32) for reproducible particle fields. */
export function seededRng(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
/** Canvas device pixel ratio, never above the cap. */
export function cappedDpr(dpr: number): number {
	return Math.min(dpr, MAX_DPR);
}
/** Creates a particle field; the count is clamped to PARTICLE_CAP. */
export function createParticleField(
	count: number,
	width: number,
	height: number,
	rng: () => number = Math.random,
): ParticleField {
	const particleCount = Math.min(Math.max(Math.trunc(count), 0), PARTICLE_CAP);
	const particles: Particle[] = [];

	for (let i = 0; i < particleCount; i++) {
		const angle = rng() * Math.PI * 2;
		const speed = DRIFT_MIN + rng() * (DRIFT_MAX - DRIFT_MIN);
		particles.push({
			x: rng() * width,
			y: rng() * height,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			radius: 0.5 + rng() * 1.5,
			opacity: 0.15 + rng() * 0.45,
		});
	}

	return { particles, width, height };
}
/** Advances every particle by its velocity (px/frame) and wraps at the edges. */
export function stepParticles(field: ParticleField): ParticleField {
	return {
		...field,
		particles: field.particles.map((particle) => {
			let x = particle.x + particle.vx;
			let y = particle.y + particle.vy;

			if (x > field.width) x -= field.width;
			else if (x < 0) x += field.width;
			if (y > field.height) y -= field.height;
			else if (y < 0) y += field.height;

			return { ...particle, x, y };
		}),
	};
}
/** Paints one frame: a soft dot per particle at its own opacity. */
export function renderParticles(
	field: ParticleField,
	ctx: CanvasRenderingContext2D,
): void {
	ctx.fillStyle = PARTICLE_COLOR;
	for (const particle of field.particles) {
		ctx.globalAlpha = particle.opacity;
		ctx.beginPath();
		ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
}
