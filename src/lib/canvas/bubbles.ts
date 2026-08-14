import { seededRng } from "./particles";

/** Maximum rising bubbles painted per frame (design: 24). */
export const BUBBLE_CAP = 24;
/** Bubble radius range in px (2–8). */
const RADIUS_MIN = 2;
const RADIUS_MAX = 8;
/** Rise speed range in px/frame. */
const SPEED_MIN = 0.3;
const SPEED_MAX = 0.9;
/** Bubbles are tinted with the accent-cyan token (#38e1ff). */
const BUBBLE_COLOR = "rgb(56, 225, 255)";

export interface Bubble {
	x: number;
	y: number;
	radius: number;
	speed: number;
	opacity: number;
}

export interface BubbleField {
	bubbles: Bubble[];
	width: number;
	height: number;
}

/** Deterministic seeded bubble field: same seed → identical geometry. */
export function createBubbles(
	seed: number,
	width: number,
	height: number,
): BubbleField {
	const rng = seededRng(seed);
	const bubbles: Bubble[] = [];
	for (let i = 0; i < BUBBLE_CAP; i++) {
		bubbles.push({
			x: rng() * width,
			y: rng() * height,
			radius: RADIUS_MIN + rng() * (RADIUS_MAX - RADIUS_MIN),
			speed: SPEED_MIN + rng() * (SPEED_MAX - SPEED_MIN),
			opacity: 0.1 + rng() * 0.2,
		});
	}
	return { bubbles, width, height };
}

/** Rises every bubble by its speed; bubbles fully above the top edge
 *  respawn at the bottom (immutable, deterministic). */
export function stepBubbles(field: BubbleField): BubbleField {
	return {
		...field,
		bubbles: field.bubbles.map((bubble) => {
			let y = bubble.y - bubble.speed;
			if (y + bubble.radius < 0) y = field.height + bubble.radius;
			return { ...bubble, y };
		}),
	};
}

/** Paints one filled arc per bubble at its own opacity. */
export function renderBubbles(
	field: BubbleField,
	ctx: CanvasRenderingContext2D,
): void {
	ctx.fillStyle = BUBBLE_COLOR;
	for (const bubble of field.bubbles) {
		ctx.globalAlpha = bubble.opacity;
		ctx.beginPath();
		ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
}
