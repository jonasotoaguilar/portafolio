import { describe, expect, it } from "vitest";

import {
	clickSkillSlot,
	initialSkillsState,
	type SkillsState,
	stepSkillsDown,
	stepSkillsUp,
	VISIBLE_SLOTS,
} from "../../src/lib/skills/window";

// Corrected five-slot contract: 22 records, 5 persistent slots,
// one state {activeIndex, windowStart, focusedSlot}. The invariant
// activeIndex = windowStart + focusedSlot holds after every step.
// Wrap uses total-5, last slot is index 4 (fifth slot), not 7.
const COUNT = 22;

describe("VISIBLE_SLOTS contract", () => {
	it("exposes exactly 5 visible slots", () => {
		expect(VISIBLE_SLOTS).toBe(5);
	});

	it("wraps total-5: final window start is count-5", () => {
		expect(COUNT - VISIBLE_SLOTS).toBe(17);
	});

	it("last slot is index 4 (fifth slot, not seventh)", () => {
		expect(VISIBLE_SLOTS - 1).toBe(4);
	});
});

describe("initialSkillsState", () => {
	it("starts on skill 1 with the window at the top and focus on slot 1", () => {
		expect(initialSkillsState()).toEqual({
			activeIndex: 0,
			windowStart: 0,
			focusedSlot: 0,
		});
	});
});

describe("stepSkillsDown", () => {
	it("moves through the five slots without moving the window", () => {
		let state = initialSkillsState();
		for (let slot = 1; slot < VISIBLE_SLOTS; slot += 1) {
			state = stepSkillsDown(state, COUNT);
			expect(state).toEqual({
				activeIndex: slot,
				windowStart: 0,
				focusedSlot: slot,
			});
		}
		// Slot 1..5 all sit inside the initial window 1..5.
		expect(state).toEqual({
			activeIndex: 4,
			windowStart: 0,
			focusedSlot: 4,
		});
	});

	it("advances the window one skill at the bottom slot; focus stays stuck to slot 5", () => {
		// From {4, 0, 4}: the window moves to skills 2..6 and the focus stays
		// on the bottom slot.
		expect(
			stepSkillsDown({ activeIndex: 4, windowStart: 0, focusedSlot: 4 }, COUNT),
		).toEqual({ activeIndex: 5, windowStart: 1, focusedSlot: 4 });
		// Every further edge step rotates the window one skill per press.
		for (let active = 5; active < 21; active += 1) {
			const next = stepSkillsDown(
				{ activeIndex: active, windowStart: active - 4, focusedSlot: 4 },
				COUNT,
			);
			expect(next).toEqual({
				activeIndex: active + 1,
				windowStart: active - 3,
				focusedSlot: 4,
			});
		}
	});

	it("walks the whole 22-skill list forward with the invariant holding", () => {
		let state = initialSkillsState();
		for (let active = 1; active <= 21; active += 1) {
			state = stepSkillsDown(state, COUNT);
			expect(state.activeIndex).toBe(active);
			expect(state.focusedSlot).toBe(state.activeIndex - state.windowStart);
			expect(state.windowStart).toBeGreaterThanOrEqual(0);
			expect(state.windowStart).toBeLessThanOrEqual(COUNT - VISIBLE_SLOTS);
		}
	});

	it("wraps last -> first to the initial window and slot 1", () => {
		expect(
			stepSkillsDown(
				{ activeIndex: 21, windowStart: 17, focusedSlot: 4 },
				COUNT,
			),
		).toEqual(initialSkillsState());
	});

	it("is safe with degenerate inputs", () => {
		const state = initialSkillsState();
		expect(stepSkillsDown(state, 0)).toBe(state);
	});
});

describe("stepSkillsUp", () => {
	it("moves back through the slots without moving the window", () => {
		let state: SkillsState = { activeIndex: 4, windowStart: 0, focusedSlot: 4 };
		for (let slot = 3; slot >= 0; slot -= 1) {
			state = stepSkillsUp(state, COUNT);
			expect(state).toEqual({
				activeIndex: slot,
				windowStart: 0,
				focusedSlot: slot,
			});
		}
	});

	it("moves the window one skill back at the top slot; focus stays stuck to slot 1", () => {
		// Inside the window: slot 5 -> slot 4, window untouched.
		expect(
			stepSkillsUp({ activeIndex: 5, windowStart: 1, focusedSlot: 4 }, COUNT),
		).toEqual({ activeIndex: 4, windowStart: 1, focusedSlot: 3 });
		// At the top slot: the window shifts one skill back.
		expect(
			stepSkillsUp({ activeIndex: 1, windowStart: 1, focusedSlot: 0 }, COUNT),
		).toEqual({ activeIndex: 0, windowStart: 0, focusedSlot: 0 });
	});

	it("walks the window back one skill per press with focus stuck to the top slot", () => {
		// From the last window: slots 5..2 move within the window, then the
		// window shifts one skill per press while slot 1 keeps the focus.
		let state: SkillsState = {
			activeIndex: 21,
			windowStart: 17,
			focusedSlot: 4,
		};
		for (let slot = 3; slot >= 1; slot -= 1) {
			state = stepSkillsUp(state, COUNT);
			expect(state.focusedSlot).toBe(slot);
			expect(state.windowStart).toBe(17);
		}
		state = stepSkillsUp(state, COUNT);
		expect(state).toEqual({ activeIndex: 17, windowStart: 17, focusedSlot: 0 });
		for (let active = 16; active >= 1; active -= 1) {
			state = stepSkillsUp(state, COUNT);
			expect(state).toEqual({
				activeIndex: active,
				windowStart: active,
				focusedSlot: 0,
			});
		}
		expect(state).toEqual({ activeIndex: 1, windowStart: 1, focusedSlot: 0 });
		state = stepSkillsUp(state, COUNT);
		expect(state).toEqual(initialSkillsState());
	});

	it("wraps first -> last to the final window and slot 5", () => {
		expect(stepSkillsUp(initialSkillsState(), COUNT)).toEqual({
			activeIndex: 21,
			windowStart: 17,
			focusedSlot: 4,
		});
	});

	it("is safe with degenerate inputs", () => {
		const state = initialSkillsState();
		expect(stepSkillsUp(state, 0)).toBe(state);
	});
});

describe("clickSkillSlot", () => {
	it("selects the clicked slot within the current window without moving it", () => {
		expect(clickSkillSlot(initialSkillsState(), 4)).toEqual({
			activeIndex: 4,
			windowStart: 0,
			focusedSlot: 4,
		});
		expect(
			clickSkillSlot({ activeIndex: 8, windowStart: 2, focusedSlot: 4 }, 3),
		).toEqual({
			activeIndex: 5,
			windowStart: 2,
			focusedSlot: 3,
		});
		expect(
			clickSkillSlot({ activeIndex: 21, windowStart: 17, focusedSlot: 4 }, 0),
		).toEqual({ activeIndex: 17, windowStart: 17, focusedSlot: 0 });
	});

	it("clamps out-of-range slots to the visible window", () => {
		expect(clickSkillSlot(initialSkillsState(), 9)).toEqual({
			activeIndex: 4,
			windowStart: 0,
			focusedSlot: 4,
		});
		expect(clickSkillSlot(initialSkillsState(), -3)).toEqual(
			initialSkillsState(),
		);
	});
});

// Whatever the starting position, repeated moves never leave the list.
describe("state bounds", () => {
	it("always land inside the 22-skill list with 5-slot window", () => {
		let state = initialSkillsState();
		const states: SkillsState[] = [state];
		for (let i = 0; i < 40; i += 1) {
			state = stepSkillsDown(state, COUNT);
			states.push(state);
		}
		for (let i = 0; i < 40; i += 1) {
			state = stepSkillsUp(state, COUNT);
			states.push(state);
		}
		for (const s of states) {
			expect(s.activeIndex).toBeGreaterThanOrEqual(0);
			expect(s.activeIndex).toBeLessThan(COUNT);
			expect(s.windowStart).toBeGreaterThanOrEqual(0);
			expect(s.windowStart).toBeLessThanOrEqual(COUNT - VISIBLE_SLOTS);
			expect(s.focusedSlot).toBeGreaterThanOrEqual(0);
			expect(s.focusedSlot).toBeLessThan(VISIBLE_SLOTS);
			// Triangulation: invariant must hold for every state.
			expect(s.activeIndex).toBe(s.windowStart + s.focusedSlot);
		}
	});
});
