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

function onKeydown(event: KeyboardEvent): void {
	if (event.key === "Escape") {
		event.preventDefault();
		if (escapeHierarchy(panelOpen()) === "close-panel") {
			closePanel();
		} else {
			goToMenu();
		}
		return;
	}
	const result = reduceListKey({ activeIndex }, event.key, items.length);
	if (result.kind === "move") {
		event.preventDefault();
		select(result.activeIndex);
		focusItem(result.activeIndex);
	} else if (result.kind === "open") {
		event.preventDefault();
		open(activeIndex);
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
