// Pure state transitions for the PROJECTS fixed-slot recycled list (projects
// contract): the enhanced UI shows at most MAX_VISIBLE_SLOTS persistent row
// nodes whose title/href/icon content is updated as the global data window
// advances — NOT a native scrollable list and not a conventional carousel.
// One source of truth drives everything:
//   DATA: N {id, title, link} records (the project collection, 4+ entries)
//   activeIndex: 0..N-1   (the selected record)
//   windowStart: 0..N-v   (first record of the visible window)
//   focusedSlot: 0..v-1   (the roving-tabindex slot; v = min(N, 5))
// The invariant activeIndex = windowStart + focusedSlot holds after every
// step, and the visible slot count shrinks to the record count when the
// collection has fewer than MAX_VISIBLE_SLOTS entries (4 projects show 4
// slots; 6/7 show exactly 5). These functions are pure so the mapping is
// unit-testable without a DOM; src/scripts/projects-scroll.ts wires them to
// the live slot nodes. The wheel math is shared: src/lib/wheel.ts.

/** Hard cap on the number of persistent slot rows the enhanced list shows. */
export const MAX_VISIBLE_SLOTS = 5;

/** One flattened project record (id + title + external link + metrics). */
export interface ProjectRecord {
	id: string;
	title: string;
	link: string;
	/** GitHub metrics; null when the project has no GitHub repository. */
	pullRequests: number | null;
	commits: number | null;
}

/**
 * The visible slot count for a collection of `count` records: exactly
 * MAX_VISIBLE_SLOTS when the list overflows, otherwise every record gets
 * its own slot (4 projects -> 4 slots).
 */
export function visibleSlotCount(count: number): number {
	return Math.min(Math.max(count, 1), MAX_VISIBLE_SLOTS);
}

/** The single projects interaction state. */
export interface ProjectsState {
	/** Selected record index in 0..count-1. */
	activeIndex: number;
	/** First record of the visible window in 0..count-visible. */
	windowStart: number;
	/** Roving-tabindex slot in 0..visible-1. */
	focusedSlot: number;
}

/** Initial state: project 1, window at the top, focus on slot 1. */
export function initialProjectsState(): ProjectsState {
	return { activeIndex: 0, windowStart: 0, focusedSlot: 0 };
}

/**
 * ArrowDown on the projects list: one record forward. Inside the window the
 * focus moves to the next slot; at the bottom slot the window advances one
 * record and the focus stays stuck to the bottom slot. Last -> first wraps
 * to the initial window and slot 1.
 */
export function stepProjectsDown(
	state: ProjectsState,
	count: number,
): ProjectsState {
	if (count <= 0) return state;
	const visible = visibleSlotCount(count);
	if (state.activeIndex >= count - 1) return initialProjectsState();
	const nextIndex = state.activeIndex + 1;
	if (state.focusedSlot < visible - 1) {
		return {
			activeIndex: nextIndex,
			windowStart: state.windowStart,
			focusedSlot: state.focusedSlot + 1,
		};
	}
	return {
		activeIndex: nextIndex,
		windowStart: state.windowStart + 1,
		focusedSlot: state.focusedSlot,
	};
}

/**
 * ArrowUp on the projects list: one record back. Inside the window the focus
 * moves to the previous slot; at the top slot the window moves back one
 * record and the focus stays stuck to the top slot. First -> last wraps to
 * the final window and the last slot.
 */
export function stepProjectsUp(
	state: ProjectsState,
	count: number,
): ProjectsState {
	if (count <= 0) return state;
	const visible = visibleSlotCount(count);
	if (state.activeIndex <= 0) {
		return {
			activeIndex: count - 1,
			windowStart: Math.max(0, count - visible),
			focusedSlot: visible - 1,
		};
	}
	const nextIndex = state.activeIndex - 1;
	if (state.focusedSlot > 0) {
		return {
			activeIndex: nextIndex,
			windowStart: state.windowStart,
			focusedSlot: state.focusedSlot - 1,
		};
	}
	return {
		activeIndex: nextIndex,
		windowStart: state.windowStart - 1,
		focusedSlot: 0,
	};
}

/**
 * Click on a slot: the clicked record becomes active and the clicked slot
 * takes the focus, without moving the window.
 */
export function clickProjectSlot(
	state: ProjectsState,
	slot: number,
	count: number,
): ProjectsState {
	const visible = visibleSlotCount(count);
	const clamped = Math.min(Math.max(slot, 0), visible - 1);
	return {
		activeIndex: state.windowStart + clamped,
		windowStart: state.windowStart,
		focusedSlot: clamped,
	};
}
