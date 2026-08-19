import { playClick, playSelect } from "../lib/audio/effects";
import { reduceListKey } from "../lib/menu/keys";

// RESUME compact experience list (resume contract): one reserved description
// region above the list swaps to the selected entry's description while the
// keyboard cursor stays on the list items (roving tabindex, one tab stop).
// ArrowUp/ArrowDown move selection and focus together (wrapping) and update
// the description immediately; Enter, ArrowRight, Space, and click also
// select in place. The region is aria-live so screen readers announce
// swaps. Escape returns to the menu. The JS-only gate (data-game-ready)
// keeps the no-JS fallback — every entry with its description in normal
// document flow — untouched when JavaScript is off or init fails. This
// script is only imported by the /resume page and never touches other
// routes.
let items: HTMLElement[] = [];
let region: HTMLElement | null = null;
let activeIndex = 0;

function setRegionText(selector: string, text: string): void {
	const target = region?.querySelector<HTMLElement>(selector);
	if (!target) return;
	target.replaceChildren(document.createTextNode(text));
}

function fillRegion(item: HTMLElement): void {
	const data = item.dataset;
	setRegionText("[data-resume-description-title]", data.company ?? "");
	setRegionText(
		"[data-resume-description-role]",
		[data.role, data.period].filter(Boolean).join(" · "),
	);
	setRegionText("[data-resume-description-body]", data.description ?? "");
}

// Single keyboard cursor (design: roving tabindex): the active item is the
// only tab stop; data-active drives the gated CSS (global.css) and the
// region follows the cursor.
function select(index: number): void {
	activeIndex = index;
	items.forEach((item, i) => {
		const active = i === index;
		item.toggleAttribute("data-active", active);
		item.setAttribute("aria-pressed", active ? "true" : "false");
		item.tabIndex = active ? 0 : -1;
	});
}

// Focus and active move together: the focused item always equals the
// selected item, so keyboard focus never leaves the compact list.
function focusItem(index: number): void {
	items[index]?.focus();
}

function goToMenu(): void {
	document.querySelector<HTMLAnchorElement>('a[href="/"]')?.click();
}

function onKeydown(event: KeyboardEvent): void {
	if (event.key === "Escape") {
		event.preventDefault();
		goToMenu();
		return;
	}
	const result = reduceListKey({ activeIndex }, event.key, items.length);
	if (result.kind === "move") {
		event.preventDefault();
		select(result.activeIndex);
		fillRegion(items[result.activeIndex]);
		focusItem(result.activeIndex);
		playSelect();
	} else if (result.kind === "open") {
		// Enter/ArrowRight select in place; focus never leaves the list.
		event.preventDefault();
		fillRegion(items[activeIndex]);
		// Keyboard activation never produces a native click event, so the
		// click sound is played explicitly (mouse clicks are covered by the
		// delegated click wiring).
		playClick();
	}
}

function setupView(): void {
	const found = document.querySelector<HTMLElement>("[data-view]");
	if (!found) return;
	// Document-level but screen-scoped: resume.ts only loads on the /resume
	// page (one active screen per document) and tears down on swap, so
	// Escape works even when focus is on the body. Bound before the list
	// init so Escape keeps working if the enhanced list fails to initialize
	// (the generic view handler never binds on this route).
	document.addEventListener("keydown", onKeydown);
	items = [...found.querySelectorAll<HTMLElement>("[data-resume-item]")];
	region = found.querySelector<HTMLElement>("[data-resume-description]");
	if (items.length === 0 || !region) return; // fallback stays in flow
	// No-scroll gate (design D5): JS-only, so zero-JS content stays in flow.
	document.documentElement.dataset.gameReady = "";
	const initial = items.findIndex((item) => item.hasAttribute("data-active"));
	activeIndex = initial >= 0 ? initial : 0;
	select(activeIndex);
	fillRegion(items[activeIndex]);
	// On entering the view, focus rests on the active list item
	// (persona-navigation: initial focus on the active item).
	items[activeIndex]?.focus();
	items.forEach((item, index) => {
		item.addEventListener("focus", () => {
			activeIndex = index;
		});
		item.addEventListener("click", () => {
			select(index);
			fillRegion(item);
		});
	});
}

function teardownView(): void {
	document.removeEventListener("keydown", onKeydown);
	items = [];
	region = null;
	activeIndex = 0;
}

document.addEventListener("astro:page-load", () => {
	teardownView();
	setupView();
});
document.addEventListener("astro:before-swap", teardownView);
setupView();
