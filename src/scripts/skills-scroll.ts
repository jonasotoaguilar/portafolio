import { playSelect } from "../lib/audio/effects";
import {
	clickSkillSlot,
	consumeWheelSteps,
	initialSkillsState,
	type SkillRecord,
	type SkillsState,
	stepSkillsDown,
	stepSkillsUp,
	toRoman,
	VISIBLE_SLOTS,
	type WheelAccumulator,
} from "../lib/skills/window";

// SKILLS fixed seven-slot recycled list (skills contract): the enhanced UI
// shows exactly VISIBLE_SLOTS persistent parallelogram slot buttons whose
// text/category/rank content is updated as the global data window advances —
// NOT a native scrollable 22-card list and not a conventional scrollable
// carousel. The 22 fallback cards render in normal document flow (no-JS);
// on successful initialization this script adopts the first seven as the
// persistent slots, removes the rest, and gates the enhanced CSS. There is
// no scrollTop anywhere: ArrowUp/Down move focus through the slots and
// shift the window at the edges, and wheel deltas accumulate into discrete
// one-step transitions (exactly one playSelect per transition, never per
// raw event). The script resolves its elements, is a no-op when they are
// absent or initialization fails (the fallback stays untouched), and never
// touches other routes (it is only imported by the /skills page).
//
// Accessibility: the list becomes a Skills-specific listbox (`role="listbox"`),
// each slot an `role="option"` with `aria-selected`, `aria-setsize`, and
// `aria-posinset` reflecting the GLOBAL index, plus roving `tabIndex`. The
// slots drop `data-list-item`, so the generic view.ts list logic no-ops on
// Skills (its document-level Escape still works); click/hover effect sounds
// come from the existing delegated wiring, which now targets
// `[data-skill-slot]`.

const DATA_ID = "skills-data";
const FALLBACK_CARD_SELECTOR = "[data-skill-card]";

interface SkillsController {
	dispose: () => void;
}

/** Reads and validates the inline `type="application/json"` skill blob. */
function readSkillsData(): SkillRecord[] | null {
	const node = document.getElementById(DATA_ID);
	if (!node?.textContent) return null;
	let parsed: unknown;
	try {
		parsed = JSON.parse(node.textContent);
	} catch {
		return null;
	}
	if (!Array.isArray(parsed)) return null;
	const records = parsed.filter(
		(entry): entry is SkillRecord =>
			typeof entry === "object" &&
			entry !== null &&
			typeof (entry as SkillRecord).name === "string" &&
			typeof (entry as SkillRecord).category === "string" &&
			typeof (entry as SkillRecord).rank === "number",
	);
	return records.length >= VISIBLE_SLOTS ? records : null;
}

function makeController(
	region: HTMLElement,
	viewport: HTMLElement,
	data: SkillRecord[],
): SkillsController | null {
	const list = viewport.querySelector<HTMLElement>("[data-list]");
	if (!list) return null;

	// Re-init on an already-enhanced list (astro:page-load re-entry after the
	// direct setup), or adopt the first seven fallback cards as the
	// persistent slots. Their <li> wrappers keep the diagonal slot geometry
	// (--skill-index from the fallback markup); the remaining cards go away.
	let slotButtons = [
		...viewport.querySelectorAll<HTMLButtonElement>("[data-skill-slot]"),
	];
	if (slotButtons.length >= VISIBLE_SLOTS) {
		slotButtons = slotButtons.slice(0, VISIBLE_SLOTS);
	} else {
		const fallbackCards = [
			...list.querySelectorAll<HTMLElement>(FALLBACK_CARD_SELECTOR),
		];
		if (fallbackCards.length < VISIBLE_SLOTS) return null;
		slotButtons = fallbackCards
			.slice(0, VISIBLE_SLOTS)
			.map((button) => button as HTMLButtonElement);
		fallbackCards.slice(VISIBLE_SLOTS).forEach((button) => {
			button.closest(".skill-list-item")?.remove();
		});
		// Enhancement gate: fixed non-scrolling geometry + scrollbar
		// affordance. Not set when initialization fails, so the fallback
		// stays in normal document flow.
		region.setAttribute("data-skills-enhanced", "");
		list.setAttribute("role", "listbox");
		slotButtons.forEach((button) => {
			button.setAttribute("data-skill-slot", "");
			button.setAttribute("role", "option");
			// The adopted card is no longer a fallback card.
			button.removeAttribute("data-skill-card");
			// Toggle semantics don't apply to listbox options.
			button.removeAttribute("aria-pressed");
			// The li wrapper becomes presentational; the button is the option.
			button.closest(".skill-list-item")?.setAttribute("role", "presentation");
		});
	}

	let state: SkillsState = initialSkillsState();
	const accumulator: WheelAccumulator = { remainder: 0 };
	const thumb = region.querySelector<HTMLElement>("[data-skills-thumb]");

	function syncThumb(): void {
		if (!thumb) return;
		const maxStart = Math.max(1, data.length - VISIBLE_SLOTS);
		const ratio = Math.min(1, VISIBLE_SLOTS / data.length);
		const progress = state.windowStart / maxStart;
		thumb.style.setProperty("--skills-thumb-width", `${ratio * 100}%`);
		thumb.style.setProperty(
			"--skills-thumb-left",
			`${progress * (1 - ratio) * 100}%`,
		);
	}

	// Render writes every slot's content and ARIA attributes; the slot nodes
	// themselves are never replaced, so DOM focus is structurally preserved.
	function render(): void {
		slotButtons.forEach((button, slot) => {
			const globalIndex = state.windowStart + slot;
			const record = data[globalIndex];
			const name = button.querySelector<HTMLElement>(".block");
			const category = button.querySelector<HTMLElement>(
				".skill-card-category",
			);
			const rank = button.querySelector<HTMLElement>(".skill-card-rank-value");
			const position = button.querySelector<HTMLElement>(
				".skill-card-position",
			);
			if (!record || !name || !category || !rank || !position) return;
			name.textContent = record.name;
			category.textContent = record.category;
			rank.textContent = String(record.rank);
			position.textContent = toRoman(globalIndex + 1);
			const isActive = globalIndex === state.activeIndex;
			button.toggleAttribute("data-active", isActive);
			button.setAttribute("aria-selected", isActive ? "true" : "false");
			button.setAttribute("aria-posinset", String(globalIndex + 1));
			button.setAttribute("aria-setsize", String(data.length));
			button.tabIndex = slot === state.focusedSlot ? 0 : -1;
		});
		syncThumb();
	}

	// There is no scroll container: focus({preventScroll:true}) is a no-op
	// guard against any future scrollable ancestor.
	function focusSlot(slot: number): void {
		const button = slotButtons[slot];
		if (button && document.activeElement !== button) {
			button.focus({ preventScroll: true });
		}
	}

	// One discrete transition: exactly one select sound per move; DOM focus
	// follows only when the focused slot changed (window shifts at the edges
	// keep the focus visually stuck to the edge slot).
	function move(direction: "down" | "up"): void {
		const next =
			direction === "down"
				? stepSkillsDown(state, data.length)
				: stepSkillsUp(state, data.length);
		const slotChanged = next.focusedSlot !== state.focusedSlot;
		state = next;
		render();
		if (slotChanged) focusSlot(state.focusedSlot);
		playSelect();
	}

	function onKeydown(event: KeyboardEvent): void {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
		if (!(event.target instanceof Node) || !viewport.contains(event.target))
			return;
		event.preventDefault();
		move(event.key === "ArrowDown" ? "down" : "up");
	}

	function onWheel(event: WheelEvent): void {
		// Ctrl+wheel belongs to the browser (zoom): never hijacked.
		if (event.ctrlKey) return;
		// Consumed non-ctrl wheel inside the Skills region never scrolls the
		// page; scrollTop stays 0 and no native scrollbar ever moves.
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
			state = clickSkillSlot(state, slot);
			render();
			focusSlot(state.focusedSlot);
			// The click sound is delegated: effects.ts plays "click" for
			// [data-skill-slot] targets; this handler never duplicates it.
		};
	}

	viewport.addEventListener("keydown", onKeydown);
	viewport.addEventListener("wheel", onWheel, { passive: false });
	const clickHandlers = slotButtons.map((button, slot) => {
		const handler = slotClickHandler(slot);
		button.addEventListener("click", handler);
		return handler;
	});

	render();
	// Initial focus rests on slot 1 (persona-navigation: the active item is
	// the first tab stop).
	focusSlot(state.focusedSlot);

	return {
		dispose() {
			viewport.removeEventListener("keydown", onKeydown);
			viewport.removeEventListener("wheel", onWheel);
			slotButtons.forEach((button, slot) => {
				button.removeEventListener("click", clickHandlers[slot]);
			});
			const thumb = region.querySelector<HTMLElement>("[data-skills-thumb]");
			if (thumb) {
				const maxStart = Math.max(1, data.length - VISIBLE_SLOTS);
				const ratio = Math.min(1, VISIBLE_SLOTS / data.length);
				const progress = state.windowStart / maxStart;
				thumb.style.setProperty("--skills-thumb-width", `${ratio * 100}%`);
				thumb.style.setProperty(
					"--skills-thumb-left",
					`${progress * (1 - ratio) * 100}%`,
				);
			}
		},
	};
}

let controller: SkillsController | null = null;

function teardown(): void {
	controller?.dispose();
	controller = null;
}

function setup(): void {
	teardown();
	const region = document.querySelector<HTMLElement>(".skills-scroll-region");
	const viewport = document.querySelector<HTMLElement>(
		"[data-skills-viewport]",
	);
	const data = readSkillsData();
	if (!region || !viewport || !data) return;
	controller = makeController(region, viewport, data);
}

document.addEventListener("astro:page-load", setup);
document.addEventListener("astro:before-swap", teardown);
setup();
