import { animate, inView } from "motion";

import { ENTRANCE_EASE, entranceOptions } from "../lib/motion/entrances";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const STAGGER_MS = 40;

const animations: { stop: () => void }[] = [];
const unobserveFns: VoidFunction[] = [];

function playEntrance(
	element: HTMLElement,
	index: number,
	reduced: boolean,
): void {
	const options = entranceOptions(reduced);
	const keyframes = options.reduced
		? { opacity: options.opacity }
		: { opacity: options.opacity, y: [options.y, 0] };
	animations.push(
		animate(element, keyframes, {
			duration: options.duration / 1000,
			ease: ENTRANCE_EASE,
			delay: (index * STAGGER_MS) / 1000,
		}),
	);
}

function setupEntrances(): void {
	const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
	const elements = document.querySelectorAll<HTMLElement>("[data-entrance]");
	elements.forEach((element, index) => {
		const unobserve = inView(
			element,
			() => {
				playEntrance(element, index, reduced);
				unobserve();
			},
			{ amount: 0.2 },
		);
		unobserveFns.push(unobserve);
	});
}

function teardownEntrances(): void {
	for (const animation of animations) animation.stop();
	animations.length = 0;
	for (const unobserve of unobserveFns) unobserve();
	unobserveFns.length = 0;
}

document.addEventListener("astro:page-load", () => {
	teardownEntrances();
	setupEntrances();
});
document.addEventListener("astro:before-swap", teardownEntrances);
setupEntrances();
