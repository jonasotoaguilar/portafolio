// Pure state transitions for the SKILLS fixed seven-slot recycled list
// (skills contract): the enhanced UI shows exactly VISIBLE_SLOTS persistent
// parallelogram slot nodes whose text/category/rank content is updated as
// the global data window advances — NOT a native scrollable 22-card list and
// not a conventional carousel. One source of truth drives everything:
//   DATA: 22 {name, category, rank} records
//   activeIndex: 0..21 (the selected record)
//   windowStart: 0..15 (first record of the visible window)
//   focusedSlot: 0..6  (the roving-tabindex slot)
// The invariant activeIndex = windowStart + focusedSlot holds after every
// step. These functions are pure so the mapping is unit-testable without a
// DOM; src/scripts/skills-scroll.ts wires them to the live slot nodes.
//
// The wheel math lives in the shared src/lib/wheel.ts (both the skills and
// projects carousels consume it) and is re-exported here so this module's
// public surface stays the single import point for skills consumers.

/** Number of persistent slot nodes the enhanced skills list shows. */
export const VISIBLE_SLOTS = 7;

/** One flattened skill record (name + category + explicit 1..4 rank). */
export interface SkillRecord {
	name: string;
	category: string;
	rank: number;
}

/** The single skills interaction state. */
export interface SkillsState {
	/** Selected record index in 0..count-1. */
	activeIndex: number;
	/** First record of the visible window in 0..count-VISIBLE_SLOTS. */
	windowStart: number;
	/** Roving-tabindex slot in 0..VISIBLE_SLOTS-1. */
	focusedSlot: number;
}

/** Initial state: skill 1, window 1..7, focus on slot 1. */
export function initialSkillsState(): SkillsState {
	return { activeIndex: 0, windowStart: 0, focusedSlot: 0 };
}

/**
 * ArrowDown on the skills list: one record forward. Inside the window the
 * focus moves to the next slot; at the bottom slot the window advances one
 * record and the focus stays stuck to the bottom slot. Last -> first wraps
 * to the initial window and slot 1.
 */
export function stepSkillsDown(state: SkillsState, count = 22): SkillsState {
	if (count <= 0) return state;
	if (state.activeIndex >= count - 1) return initialSkillsState();
	const nextIndex = state.activeIndex + 1;
	if (state.focusedSlot < VISIBLE_SLOTS - 1) {
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
 * ArrowUp on the skills list: one record back. Inside the window the focus
 * moves to the previous slot; at the top slot the window moves back one
 * record and the focus stays stuck to the top slot. First -> last wraps to
 * the final window and slot 7.
 */
export function stepSkillsUp(state: SkillsState, count = 22): SkillsState {
	if (count <= 0) return state;
	if (state.activeIndex <= 0) {
		return {
			activeIndex: count - 1,
			windowStart: Math.max(0, count - VISIBLE_SLOTS),
			focusedSlot: VISIBLE_SLOTS - 1,
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
export function clickSkillSlot(state: SkillsState, slot: number): SkillsState {
	const clamped = Math.min(Math.max(slot, 0), VISIBLE_SLOTS - 1);
	return {
		activeIndex: state.windowStart + clamped,
		windowStart: state.windowStart,
		focusedSlot: clamped,
	};
}

/** Running remainder of unspent wheel delta, carried across events. */
export type { WheelAccumulator } from "../wheel";
export {
	consumeWheelSteps,
	normalizeWheelDelta,
	WHEEL_LINE_HEIGHT,
	WHEEL_THRESHOLD_PX,
} from "../wheel";
