import { playSelect } from "../lib/audio/effects";
import {
	GITHUB_ICON_PATHS,
	GLOBE_ICON_PATHS,
	PROJECT_LINK_LABELS,
	projectLinkKind,
	projectLinkLabel,
} from "../lib/projects/links";
import { metricAriaText, metricValue } from "../lib/projects/metrics";
import {
	clickProjectSlot,
	initialProjectsState,
	type ProjectRecord,
	type ProjectsState,
	stepProjectsDown,
	stepProjectsUp,
	visibleSlotCount,
} from "../lib/projects/window";
import { consumeWheelSteps, type WheelAccumulator } from "../lib/wheel";

// PROJECTS fixed-slot recycled list (projects contract): the enhanced UI
// shows at most five persistent slot link rows whose title/href/icon
// content is updated as the global data window advances — NOT a native
// scrollable list and not a conventional carousel. Every project renders as
// a semantic <a> in normal document flow (no-JS): on successful
// initialization this script adopts the first v = min(count, 5) rows as the
// persistent slots, removes the rest, and gates the enhanced CSS. There is
// no scrollTop anywhere: ArrowUp/Down move focus through the slots and
// shift the window at the edges (wrap at both ends), wheel deltas
// accumulate into discrete one-step transitions (exactly one playSelect per
// transition, never per raw event), and Enter/click activation is the
// link's NATIVE behavior (opens the project URL in a new tab). The script
// resolves its elements, is a no-op when they are absent or initialization
// fails (the fallback stays untouched), and never touches other routes (it
// is only imported by the /projects page).
//
// Keyboard ownership is document-level with the shell's inert-background
// target filter (see src/scripts/shell.ts): a click on the empty page
// background blurs the row and leaves focus on the body, and the carousel
// keys — ArrowUp/Down to move, Enter/ArrowRight to open the active link —
// keep working from there, pulling DOM focus back into the active slot.
// Interactive controls outside the viewport are never hijacked, and
// in-viewport Enter/ArrowRight semantics are untouched.
//
// Synchronization: the controller is the single owner of the projects
// cursor — it toggles data-active on the rows, the roving tabIndex, the
// selected project's top stage ([data-project-top][data-active], keyed by
// data-project-top-for) and the matching detail panel ([data-detail-panel]).
// The rows drop data-list-item, so the generic view.ts list logic no-ops on
// Projects (its document-level Escape still works — straight to the menu,
// because the detail stage is permanently synchronized and never closed).
// view.ts yields the projects keys document-wide on that route (inert
// background included). A decorative right-edge scrollbar (visual only,
// pointer-events none) appears when the collection overflows five; its
// thumb mirrors the window position.

const DATA_ID = "projects-data";
const FALLBACK_ROW_SELECTOR = "[data-project-row]";
const SVG_NS = "http://www.w3.org/2000/svg";

interface ProjectsController {
	dispose: () => void;
}

/** Reads and validates the inline `type="application/json"` project blob. */
function readProjectsData(): ProjectRecord[] | null {
	const node = document.getElementById(DATA_ID);
	if (!node?.textContent) return null;
	let parsed: unknown;
	try {
		parsed = JSON.parse(node.textContent);
	} catch {
		return null;
	}
	if (!Array.isArray(parsed) || parsed.length === 0) return null;
	const records = parsed
		.filter(
			(entry): entry is ProjectRecord =>
				typeof entry === "object" &&
				entry !== null &&
				typeof (entry as ProjectRecord).id === "string" &&
				typeof (entry as ProjectRecord).title === "string" &&
				typeof (entry as ProjectRecord).link === "string",
		)
		// Metrics are optional in older/no-JS blobs (and the e2e seed
		// helper): anything that is not an exact number renders as the em
		// dash, matching the schema's null default.
		.map((entry) => ({
			id: entry.id,
			title: entry.title,
			link: entry.link,
			pullRequests:
				typeof entry.pullRequests === "number" ? entry.pullRequests : null,
			commits: typeof entry.commits === "number" ? entry.commits : null,
		}));
	return records.length > 0 ? records : null;
}

function makeController(
	region: HTMLElement,
	viewport: HTMLElement,
	data: ProjectRecord[],
): ProjectsController | null {
	const list = viewport.querySelector<HTMLElement>("[data-list]");
	const track = region.querySelector<HTMLElement>("[data-projects-scrollbar]");
	const thumb = region.querySelector<HTMLElement>("[data-projects-thumb]");
	if (!list) return null;

	const visible = visibleSlotCount(data.length);

	// Re-init on an already-enhanced list (astro:page-load re-entry after the
	// direct setup), or adopt the first v fallback rows as the persistent
	// slots. Their <li> wrappers keep the row geometry; the remaining rows
	// go away.
	let slots = [
		...viewport.querySelectorAll<HTMLAnchorElement>("[data-project-slot]"),
	];
	if (slots.length >= visible) {
		slots = slots.slice(0, visible);
	} else {
		const fallbackRows = [
			...list.querySelectorAll<HTMLAnchorElement>(FALLBACK_ROW_SELECTOR),
		];
		if (fallbackRows.length < visible) return null;
		slots = fallbackRows.slice(0, visible);
		fallbackRows.slice(visible).forEach((row) => {
			row.closest(".project-list-item")?.remove();
		});
		// Enhancement gate: fixed non-scrolling geometry + scrollbar
		// affordance. Not set when initialization fails, so the fallback
		// stays in normal document flow.
		region.setAttribute("data-projects-enhanced", "");
		slots.forEach((row) => {
			row.setAttribute("data-project-slot", "");
			row.removeAttribute("data-project-row");
		});
	}

	let state: ProjectsState = initialProjectsState();
	const accumulator: WheelAccumulator = { remainder: 0 };
	// Tracks which record each slot last rendered, so only the slot whose
	// content actually changed gets the visual introduction.
	const renderedIds: (string | undefined)[] = Array(slots.length).fill(
		undefined,
	);

	function writeIcon(row: HTMLAnchorElement, link: string): void {
		const svg = row.querySelector<SVGSVGElement>("svg.project-row-icon");
		if (!svg) return;
		const kind = projectLinkKind(link);
		const paths = kind === "github" ? GITHUB_ICON_PATHS : GLOBE_ICON_PATHS;
		const nodes = paths.map((d) => {
			const path = document.createElementNS(SVG_NS, "path");
			path.setAttribute("d", d);
			return path;
		});
		svg.replaceChildren(...nodes);
		// The repeated glyph's accessible name follows the record (role="img",
		// same copy as the SSR rows): a recycled slot that changes records
		// never keeps the previous record's label.
		svg.setAttribute("role", "img");
		svg.setAttribute("aria-label", PROJECT_LINK_LABELS[kind]);
	}

	/** Restarts the brief introduction of a slot whose record changed. */
	function introduce(row: HTMLAnchorElement): void {
		row.classList.remove("project-row-intro");
		// Force a reflow so re-adding the class restarts the animation.
		void row.offsetWidth;
		row.classList.add("project-row-intro");
	}

	// Metrics follow the record: the visible value (em dash for null) and
	// the sr-only noun/tooltip are rewritten so a recycled slot never keeps
	// the previous record's numbers or labels. Nodes are optional so older
	// SSR rows without metric spans (and the seeded e2e surface) still
	// render safely.
	function writeMetrics(row: HTMLAnchorElement, record: ProjectRecord): void {
		const pr = row.querySelector<HTMLElement>("[data-metric-pr]");
		if (pr) {
			pr.title = metricAriaText("pr", record.pullRequests);
			const value = pr.querySelector<HTMLElement>("[data-metric-pr-value]");
			const aria = pr.querySelector<HTMLElement>("[data-metric-pr-aria]");
			if (value) value.textContent = metricValue(record.pullRequests);
			if (aria) aria.textContent = metricAriaText("pr", record.pullRequests);
		}
		const commits = row.querySelector<HTMLElement>("[data-metric-commits]");
		if (commits) {
			commits.title = metricAriaText("commits", record.commits);
			const value = commits.querySelector<HTMLElement>(
				"[data-metric-commits-value]",
			);
			const aria = commits.querySelector<HTMLElement>(
				"[data-metric-commits-aria]",
			);
			if (value) value.textContent = metricValue(record.commits);
			if (aria) aria.textContent = metricAriaText("commits", record.commits);
		}
	}

	// Render writes every slot's content and ARIA attributes; the slot nodes
	// themselves are never replaced, so DOM focus is structurally preserved.
	function render(): void {
		slots.forEach((row, slot) => {
			const globalIndex = state.windowStart + slot;
			const record = data[globalIndex];
			const title = row.querySelector<HTMLElement>(".project-row-title");
			if (!record || !title) return;
			const changed =
				renderedIds[slot] !== undefined && renderedIds[slot] !== record.id;
			renderedIds[slot] = record.id;
			if (changed) introduce(row);
			title.textContent = record.title;
			if (row.href !== record.link) row.href = record.link;
			// Native tooltip follows the record too, so recycled slots never
			// show the previous record's "Open on GitHub" copy.
			row.title = projectLinkLabel(record.link);
			row.id = record.id;
			writeIcon(row, record.link);
			writeMetrics(row, record);
			const isActive = globalIndex === state.activeIndex;
			row.toggleAttribute("data-active", isActive);
			row.toggleAttribute("aria-current", isActive);
			row.tabIndex = slot === state.focusedSlot ? 0 : -1;
		});
		// Stage + detail sync: exactly one data-active panel and one top
		// stage per render, keyed by the record's id.
		document
			.querySelectorAll<HTMLElement>("[data-project-top]")
			.forEach((stage) => {
				stage.toggleAttribute(
					"data-active",
					stage.dataset.projectTopFor === data[state.activeIndex]?.id,
				);
			});
		document
			.querySelectorAll<HTMLElement>("[data-detail-panel]")
			.forEach((panel, panelIndex) => {
				panel.toggleAttribute("data-active", panelIndex === state.activeIndex);
			});
		updateThumb();
	}

	// There is no scroll container: focus({preventScroll:true}) is a no-op
	// guard against any future scrollable ancestor.
	function focusSlot(slot: number): void {
		const row = slots[slot];
		if (row && document.activeElement !== row) {
			row.focus({ preventScroll: true });
		}
	}

	// One discrete transition: exactly one select sound per move; DOM focus
	// follows only when the focused slot changed (window shifts at the edges
	// keep the focus visually stuck to the edge slot).
	function move(direction: "down" | "up"): void {
		const next =
			direction === "down"
				? stepProjectsDown(state, data.length)
				: stepProjectsUp(state, data.length);
		const slotChanged = next.focusedSlot !== state.focusedSlot;
		state = next;
		render();
		if (slotChanged) focusSlot(state.focusedSlot);
		playSelect();
	}

	/** Decorative right-edge scrollbar: appears only on overflow (count >
	    visible) and mirrors the window start; visual only, never interactive. */
	function updateThumb(): void {
		const overflow = data.length > visible;
		region.toggleAttribute("data-projects-overflow", overflow);
		if (!overflow || !track || !thumb) return;
		const trackHeight = track.clientHeight;
		const thumbHeight = Math.max(12, trackHeight * (visible / data.length));
		thumb.style.height = `${thumbHeight}px`;
		const travel = Math.max(0, trackHeight - thumbHeight);
		const ratio = travel > 0 ? state.windowStart / (data.length - visible) : 0;
		thumb.style.transform = `translateY(${ratio * travel}px)`;
	}

	function stateForSlug(slug: string): ProjectsState | null {
		if (!slug) return null;
		const index = data.findIndex((record) => record.id === slug);
		if (index < 0) return null;
		const windowStart = Math.min(index, Math.max(0, data.length - visible));
		return {
			activeIndex: index,
			windowStart,
			focusedSlot: index - windowStart,
		};
	}

	// PROJECTS keys are owned by the carousel and the inert page field,
	// mirroring the shell cursor: the handler is document-level (not
	// viewport-scoped) so a click on the empty page background — which
	// blurs the row and leaves focus on the body — never strands the
	// keyboard cursor. Interactive controls outside the viewport (the back
	// link, the mute button) keep their own keys: the carousel never
	// hijacks them.
	function ownsProjectsKeys(event: KeyboardEvent): boolean {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return true;
		if (viewport.contains(target)) return true;
		return !target.closest(
			"button, a, input, textarea, select, [contenteditable]",
		);
	}

	function onKeydown(event: KeyboardEvent): void {
		const key = event.key;
		if (
			key !== "ArrowDown" &&
			key !== "ArrowUp" &&
			key !== "Enter" &&
			key !== "ArrowRight"
		) {
			return;
		}
		if (!ownsProjectsKeys(event)) return;
		if (key === "ArrowDown" || key === "ArrowUp") {
			event.preventDefault();
			move(key === "ArrowDown" ? "down" : "up");
			// Arrow keys from the inert background restore DOM focus to the
			// active slot even when the window edge keeps the same slot
			// index (focused item === active item, the shell cursor
			// contract); focusSlot no-ops when the slot already holds
			// focus.
			focusSlot(state.focusedSlot);
			return;
		}
		// Enter/ArrowRight: inside the viewport, Enter stays NATIVE (the
		// focused anchor activates itself) and ArrowRight stays inert — the
		// in-viewport contract is untouched. From the inert background the
		// carousel restores the cursor: a native click on the active slot's
		// link opens the project URL in a new tab.
		if (event.target instanceof Node && viewport.contains(event.target)) {
			return;
		}
		event.preventDefault();
		slots[state.focusedSlot]?.click();
	}

	function onWheel(event: WheelEvent): void {
		// Ctrl+wheel belongs to the browser (zoom): never hijacked.
		if (event.ctrlKey) return;
		// Consumed non-ctrl wheel inside the projects region never scrolls
		// the page; scrollTop stays 0 and no native scrollbar ever moves.
		event.preventDefault();
		const pageLength =
			window.innerHeight || document.documentElement.clientHeight || 0;
		const steps = consumeWheelSteps(
			accumulator,
			event.deltaY,
			event.deltaMode,
			pageLength,
		);
		for (let i = 0; i < Math.abs(steps); i += 1) {
			move(steps < 0 ? "up" : "down");
		}
	}

	function slotClickHandler(slot: number): () => void {
		return () => {
			state = clickProjectSlot(state, slot, data.length);
			render();
			focusSlot(state.focusedSlot);
			// The click sound is delegated: effects.ts plays "click" for
			// [data-project-slot] targets; this handler never duplicates it.
		};
	}

	function onHashChange(): void {
		const slug = decodeURIComponent(location.hash.slice(1));
		const next = stateForSlug(slug);
		if (!next) return;
		const changed =
			next.activeIndex !== state.activeIndex ||
			next.windowStart !== state.windowStart;
		state = next;
		render();
		if (changed) focusSlot(state.focusedSlot);
	}

	viewport.addEventListener("wheel", onWheel, { passive: false });
	document.addEventListener("keydown", onKeydown);
	const clickHandlers = slots.map((row, slot) => {
		const handler = slotClickHandler(slot);
		row.addEventListener("click", handler);
		return handler;
	});
	window.addEventListener("hashchange", onHashChange);

	// Hash preselection (#slug deep links) wins over the first record; the
	// fragment target id lives on the focused row.
	const slug = decodeURIComponent(location.hash.slice(1));
	state = stateForSlug(slug) ?? state;
	render();
	// Initial focus rests on the selected slot (persona-navigation: the
	// active row is the first tab stop).
	focusSlot(state.focusedSlot);

	return {
		dispose() {
			document.removeEventListener("keydown", onKeydown);
			viewport.removeEventListener("wheel", onWheel);
			window.removeEventListener("hashchange", onHashChange);
			slots.forEach((row, slot) => {
				row.removeEventListener("click", clickHandlers[slot]);
			});
		},
	};
}

let controller: ProjectsController | null = null;

function teardown(): void {
	controller?.dispose();
	controller = null;
}

function setup(): void {
	teardown();
	const region = document.querySelector<HTMLElement>("[data-projects-region]");
	const viewport = document.querySelector<HTMLElement>(
		"[data-projects-viewport]",
	);
	const data = readProjectsData();
	if (!region || !viewport || !data) return;
	controller = makeController(region, viewport, data);
}

document.addEventListener("astro:page-load", setup);
document.addEventListener("astro:before-swap", teardown);
setup();
