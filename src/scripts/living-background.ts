import type { BubbleField } from "../lib/canvas/bubbles";
import {
	createBubbles,
	renderBubbles,
	stepBubbles,
} from "../lib/canvas/bubbles";
import type { ParticleField } from "../lib/canvas/particles";
import {
	cappedDpr,
	createParticleField,
	PARTICLE_CAP,
	renderParticles,
	stepParticles,
} from "../lib/canvas/particles";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** Fixed geometry seed: the same deterministic field on every load and swap. */
const OCEAN_SEED = 42;

/** The persisted canvas carries the fields across view-transition swaps. */
type CanvasWithField = HTMLCanvasElement & {
	livingBackgroundField?: ParticleField;
	livingBackgroundBubbles?: BubbleField;
};

// `let`: on a view-transition swap the incoming page's script runs before the
// persisted element is adopted, so it may bind a node that gets detached.
// rebind() re-resolves the live element after the swap (astro:page-load).
const canvas = document.getElementById(
	"living-background",
) as CanvasWithField | null;
let ctx: CanvasRenderingContext2D | null = null;
let media: MediaQueryList | null = null;
let field: ParticleField | null = null;
let bubbles: BubbleField | null = null;
let rafId = 0;
let running = false;
let destroyed = false;

/** Caustic fill: dark ocean gradient, transparent at top so the CSS glow
 *  and scanlines keep showing through, deepest at the bottom edge. */
function paintCaustic(g: CanvasRenderingContext2D): void {
	const gradient = g.createLinearGradient(0, 0, 0, g.canvas.height);
	gradient.addColorStop(0, "rgba(4, 6, 15, 0)");
	gradient.addColorStop(1, "rgba(13, 37, 96, 0.28)");
	g.fillStyle = gradient;
	g.fillRect(0, 0, g.canvas.width, g.canvas.height);
}

function resizeCanvas(): void {
	if (!ctx || !canvas) return;
	const dpr = cappedDpr(window.devicePixelRatio || 1);
	const width = window.innerWidth;
	const height = window.innerHeight;

	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	field = createParticleField(PARTICLE_CAP, width, height);
	bubbles = createBubbles(OCEAN_SEED, width, height);
}
function paintFrame(): void {
	if (!ctx || !field || !bubbles) return;

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	paintCaustic(ctx);
	renderBubbles(bubbles, ctx);
	renderParticles(field, ctx);
}
function loopFrame(): void {
	paintFrame();
	if (!field || !bubbles) return;
	field = stepParticles(field);
	bubbles = stepBubbles(bubbles);
	rafId = requestAnimationFrame(loopFrame);
}
function startLoop(): void {
	if (running || !canvas) return;
	running = true;
	rafId = requestAnimationFrame(loopFrame);
}
function stopLoop(): void {
	if (!running) return;
	running = false;
	cancelAnimationFrame(rafId);
}
function syncReducedMotion(): void {
	if (!media || !ctx) return;
	if (media.matches) {
		stopLoop();
		paintFrame(); // exactly one static ocean frame at the fixed phase
	} else {
		startLoop();
	}
}
function onVisibilityChange(): void {
	if (destroyed) return;
	if (document.hidden) stopLoop();
	else syncReducedMotion();
}
function onResize(): void {
	if (destroyed) return;
	resizeCanvas();
	syncReducedMotion();
}
function destroy(): void {
	destroyed = true;
	stopLoop();
	// transition:persist moves this element into the next page; stash the
	// fields so the re-initialized script continues the same animation.
	if (canvas && field) canvas.livingBackgroundField = field;
	if (canvas && bubbles) canvas.livingBackgroundBubbles = bubbles;
	media?.removeEventListener("change", syncReducedMotion);
	document.removeEventListener("visibilitychange", onVisibilityChange);
	window.removeEventListener("resize", onResize);
	document.removeEventListener("astro:before-swap", destroy);
}
function init(): void {
	if (!canvas || destroyed) return;
	ctx = canvas.getContext("2d");
	if (!ctx) return;
	media = window.matchMedia(REDUCED_MOTION_QUERY);
	resizeCanvas();

	// A swap stashed the running fields on this element; adopt them so the
	// animation continues instead of restarting.
	const stashed = canvas.livingBackgroundField;
	if (stashed) field = stashed;
	const stashedBubbles = canvas.livingBackgroundBubbles;
	if (stashedBubbles) bubbles = stashedBubbles;

	media.addEventListener("change", syncReducedMotion);
	document.addEventListener("visibilitychange", onVisibilityChange);
	window.addEventListener("resize", onResize);
	document.addEventListener("astro:before-swap", destroy);

	// Only reveal the canvas after a successful init (design D4).
	canvas.hidden = false;
	syncReducedMotion();
}

// A swap keeps this module and its persisted canvas alive; the before-swap
// destroy stops the loop, so astro:after-swap restarts it on the same element
// adopting the stashed fields (animation continues, no restart).
function resume(): void {
	destroy();
	destroyed = false;
	init();
}
document.addEventListener("astro:after-swap", resume);
init();
