import { playClick, playSelect } from "../lib/audio/effects";
import { escapeHierarchy, reduceListKey } from "../lib/menu/keys";

let root: HTMLElement | null = null;
let items: HTMLElement[] = [];
let activeIndex = 0;

function panels(): HTMLElement[] {
	return [
		...(root?.querySelectorAll<HTMLElement>("[data-detail-panel]") ?? []),
	];
}

function panelOpen(): boolean {
	return panels().some((panel) => panel.hasAttribute("data-active"));
}

// Single keyboard cursor (design: roving tabindex): the active item is the
// only tab stop (tabindex 0, others -1) and the selected item and its panel
// share the index; data-active drives the gated CSS (global.css) and the
// list-item-active state.
function select(index: number): void {
	activeIndex = index;
	items.forEach((item, i) => {
		item.toggleAttribute("data-active", i === index);
		item.setAttribute("aria-pressed", i === index ? "true" : "false");
		item.tabIndex = i === index ? 0 : -1;
	});
	panels().forEach((panel, i) => {
		panel.toggleAttribute("data-active", i === index);
	});
}

// Focus and active move together: the focused item always equals the active
// item (persona-navigation keyboard scope).
function focusItem(index: number): void {
	items[index]?.focus();
}

// Opens the focused (active) item's panel and moves focus into it.
function open(index: number): void {
	select(index);
	panels()[index]?.focus();
}

function closePanel(): void {
	panels().forEach((panel) => {
		panel.removeAttribute("data-active");
	});
	items[activeIndex]?.focus();
}

function goToMenu(): void {
	document.querySelector<HTMLAnchorElement>('a[href="/"]')?.click();
}

// SKILLS owns its ArrowUp/Down inside the fixed seven-card window: the
// skills-scroll coordinator implements the edge-stuck carousel (one-row
// scrolls at the window edges), which the generic move cannot produce. This
// narrowly scoped check delegates only the arrow keys whose target sits
// inside the skills viewport; Escape/Enter/other keys and every other view
// (Projects, Resume) keep the generic behavior unchanged.
function skillsOwnsArrows(target: EventTarget | null): boolean {
	if (!(target instanceof Node)) return false;
	return (
		root?.querySelector("[data-skills-viewport]")?.contains(target) ?? false
	);
}

// PROJECTS owns its arrows AND its activation both inside the fixed
// five-slot recycled window and on the inert page background:
// projects-scroll.ts implements the edge-stuck carousel (which the generic
// move cannot produce), the rows are real links, and its keydown handler
// is document-level with the shell's inert-background filter — so after a
// background click the arrows still move the cursor and Enter/ArrowRight
// still open the active link (new tab). The generic cursor must never move
// or open on that route, whichever element the key arrived from. The rows
// drop data-list-item, so this check is the only Projects-aware seam in
// the generic controller.
function projectsOwnsList(target: EventTarget | null): boolean {
	if (document.documentElement.dataset.route !== "projects") return false;
	if (!(target instanceof Node)) return true;
	if (root?.querySelector("[data-projects-viewport]")?.contains(target)) {
		return true;
	}
	return !(
		target instanceof HTMLElement &&
		target.closest("button, a, input, textarea, select, [contenteditable]")
	);
}

function onKeydown(event: KeyboardEvent): void {
	if (event.key === "Escape") {
		event.preventDefault();
		// PROJECTS keeps its detail stage permanently synchronized with the
		// carousel cursor (the controller always holds exactly one
		// data-active panel): there is no closable panel on that route, so
		// Escape leaves straight for the menu. Every other view keeps the
		// close-panel-first hierarchy.
		const projectsStage = document.documentElement.dataset.route === "projects";
		if (!projectsStage && escapeHierarchy(panelOpen()) === "close-panel") {
			// Closing the panel stays inside the view — no sound; feedback
			// only plays when a menu is actually left (to-menu below).
			closePanel();
		} else {
			// Leaving the view back to the shell is the close moment: the
			// back link's click is a real click event, and the delegated
			// effect wiring plays menu_close for a[href="/"].
			goToMenu();
		}
		return;
	}
	if (
		(event.key === "ArrowUp" || event.key === "ArrowDown") &&
		skillsOwnsArrows(event.target)
	) {
		// The skills carousel handles the move (attributes, focus, one-row
		// scroll, select sound); the generic handler must not also move.
		return;
	}
	if (projectsOwnsList(event.target)) {
		// The projects carousel owns arrow moves, and Enter/ArrowRight are
		// native link activation (new tab). The generic handler must not
		// also move or open.
		return;
	}
	const result = reduceListKey({ activeIndex }, event.key, items.length);
	if (result.kind === "move") {
		event.preventDefault();
		select(result.activeIndex);
		focusItem(result.activeIndex);
		playSelect();
	} else if (result.kind === "open") {
		event.preventDefault();
		open(activeIndex);
		// Keyboard activation never produces a native click event, so the
		// click sound is played explicitly (mouse clicks are covered by the
		// delegated click wiring).
		playClick();
	}
}

function preselectFromHash(): void {
	if (items.length === 0) return;
	const slug = decodeURIComponent(location.hash.slice(1));
	if (!slug) return;
	const match = items.findIndex((item) => item.id === slug);
	if (match >= 0) select(match);
}

function setupView(): void {
	const found = document.querySelector<HTMLElement>("[data-view]");
	if (!found) return;
	// Resume owns its list/selection keys (src/scripts/resume.ts). After a
	// client-side navigation from a view that loaded this module, the
	// astro:page-load handler re-runs setupView on the shared document;
	// binding here would make every keyboard action on /resume fire twice
	// (two playSelect/playClick per key, doubled Escape).
	if (document.documentElement.dataset.route === "resume") return;
	root = found;
	items = [...found.querySelectorAll<HTMLElement>("[data-list-item]")];
	// No-scroll gate (design D5): JS-only, so zero-JS content stays in flow.
	document.documentElement.dataset.gameReady = "";
	const initial = items.findIndex((item) => item.hasAttribute("data-active"));
	activeIndex = initial >= 0 ? initial : 0;
	select(activeIndex);
	preselectFromHash();
	// On entering a view, focus rests on the active list item
	// (persona-navigation: initial focus on the active item).
	items[activeIndex]?.focus();
	items.forEach((item, index) => {
		item.addEventListener("focus", () => {
			activeIndex = index;
		});
		item.addEventListener("click", () => open(index));
	});
	// Document-level but screen-scoped: view.ts only loads on view pages (one
	// active screen per document) and tears down on swap, so Escape works even
	// when focus is on the body, while inactive screens never react.
	document.addEventListener("keydown", onKeydown);
	// Fragment navigation within the view (deep links, ClientRouter) updates
	// the preselected item without a page reload (portfolio-page #slug).
	window.addEventListener("hashchange", preselectFromHash);
}

function teardownView(): void {
	document.removeEventListener("keydown", onKeydown);
	window.removeEventListener("hashchange", preselectFromHash);
	root = null;
	items = [];
	activeIndex = 0;
}

document.addEventListener("astro:page-load", () => {
	teardownView();
	setupView();
});
document.addEventListener("astro:before-swap", teardownView);
setupView();
