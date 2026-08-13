import { animate } from "motion";
import { menuOverlayOptions, reduceMenuKey } from "../lib/menu/keys";
import { ENTRANCE_EASE } from "../lib/motion/entrances";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

let nav: HTMLElement | null = null;
let items: HTMLAnchorElement[] = [];
let state = { open: false, activeIndex: -1 };
const animations: { stop: () => void }[] = [];

// The shell menu owns Tab while active: the page's only focusables are the
// five items, so wrap at the ends instead of leaking to browser chrome.
function trapTab(event: KeyboardEvent): void {
	const first = items[0];
	const last = items[items.length - 1];
	if (!first || !last) return;
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

// Persistent keyboard-active indicator (design AD2): exactly one item carries
// data-active + aria-current="page" at a time; index -1 clears every item.
function syncActive(index: number): void {
	items.forEach((item, i) => {
		if (i === index) {
			item.setAttribute("data-active", "");
			item.setAttribute("aria-current", "page");
		} else {
			item.removeAttribute("data-active");
			item.removeAttribute("aria-current");
		}
	});
}

function onKeydown(event: KeyboardEvent): void {
	if (event.key === "Tab") {
		trapTab(event);
		return;
	}
	const result = reduceMenuKey(state, event.key, items.length);
	if (result.kind === "move") {
		event.preventDefault();
		state.activeIndex = result.activeIndex;
		syncActive(result.activeIndex);
		items[result.activeIndex]?.focus();
	} else if (result.kind === "activate") {
		const active = items[state.activeIndex];
		if (active && document.activeElement === active) {
			event.preventDefault();
			active.click();
		}
	}
}

// Five items at 300ms with 25ms stagger: 300 + 4x25 = 400ms total; reduced
// motion is opacity-only at 200ms with no stagger (menuOverlayOptions).
function playEntrance(reduced: boolean): void {
	for (const animation of animations) animation.stop();
	animations.length = 0;
	const options = menuOverlayOptions(reduced);
	const keyframes = options.reduced
		? { opacity: [0, 1] }
		: { opacity: [0, 1], y: [8, 0] };
	items.forEach((item, index) => {
		animations.push(
			animate(item, keyframes, {
				duration: options.itemDuration / 1000,
				ease: ENTRANCE_EASE,
				delay: (index * options.stagger) / 1000,
			}),
		);
	});
}

function setupShell(): void {
	const root = document.querySelector<HTMLElement>("[data-menu]");
	if (!root) return;
	const found = [
		...root.querySelectorAll<HTMLAnchorElement>("[data-menu-item]"),
	];
	if (found.length === 0) return;
	nav = root;
	items = found;
	state = { open: true, activeIndex: 0 };
	syncActive(0);
	// No-scroll gate (design D5): set only with JS, so zero-JS content flows.
	document.documentElement.dataset.gameReady = "";
	playEntrance(window.matchMedia(REDUCED_MOTION_QUERY).matches);
	root.addEventListener("keydown", onKeydown);
	items[0]?.focus();
}

function teardownShell(): void {
	for (const animation of animations) animation.stop();
	animations.length = 0;
	syncActive(-1);
	nav?.removeEventListener("keydown", onKeydown);
	nav = null;
	items = [];
	state = { open: false, activeIndex: -1 };
}

document.addEventListener("astro:page-load", () => {
	teardownShell();
	setupShell();
});
document.addEventListener("astro:before-swap", teardownShell);
setupShell();
