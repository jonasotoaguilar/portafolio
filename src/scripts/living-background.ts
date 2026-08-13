import type { ParticleField } from "../lib/canvas/particles";
import {
	cappedDpr,
	createParticleField,
	PARTICLE_CAP,
	renderParticles,
	stepParticles,
} from "../lib/canvas/particles";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** The persisted canvas element carries the field across view-transition swaps. */
type CanvasWithField = HTMLCanvasElement & {
	livingBackgroundField?: ParticleField;
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
let rafId = 0;
let running = false;
let destroyed = false;
function resizeCanvas(): void {
	if (!ctx || !canvas) return;
	const dpr = cappedDpr(window.devicePixelRatio || 1);
	const width = window.innerWidth;
	const height = window.innerHeight;

	canvas.width = Math.round(width * dpr);
	canvas.height = Math.round(height * dpr);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	field = createParticleField(PARTICLE_CAP, width, height);
}
function paintFrame(): void {
	if (!ctx || !field) return;

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	renderParticles(field, ctx);
}
function loopFrame(): void {
	paintFrame();
	if (!field) return;
	field = stepParticles(field);
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
		paintFrame();
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
	if (canvas && field) {
		// transition:persist moves this element into the next page; stash the
		// field so the re-initialized script continues the same animation.
		canvas.livingBackgroundField = field;
	}
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

	// A view transition swap stashed the running field on this element;
	// adopt it so the animation continues instead of restarting.
	const stashed = canvas.livingBackgroundField;
	if (stashed) field = stashed;

	media.addEventListener("change", syncReducedMotion);
	document.addEventListener("visibilitychange", onVisibilityChange);
	window.addEventListener("resize", onResize);
	document.addEventListener("astro:before-swap", destroy);

	// Only reveal the canvas after a successful init (design D4).
	canvas.hidden = false;
	syncReducedMotion();
}

// A swap keeps this module and its persisted canvas alive; the before-swap
// destroy stops the loop, so astro:after-swap restarts it on the same element,
// adopting the stashed field (animation continues, no restart).
function resume(): void {
	destroy();
	destroyed = false;
	init();
}
document.addEventListener("astro:after-swap", resume);
init();
