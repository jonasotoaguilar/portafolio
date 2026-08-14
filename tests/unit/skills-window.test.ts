import { describe, expect, it } from "vitest";

import {
	clickSkillSlot,
	initialSkillsState,
	type SkillsState,
	stepSkillsDown,
	stepSkillsUp,
	VISIBLE_SLOTS,
} from "../../src/lib/skills/window";

// The approved persistent-slot contract: 22 records, 7 persistent slots,
// one state {activeIndex, windowStart, focusedSlot}. The invariant
// activeIndex = windowStart + focusedSlot holds after every step.
const COUNT = 22;

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
	it("moves through the seven slots without moving the window", () => {
		let state = initialSkillsState();
		for (let slot = 1; slot < VISIBLE_SLOTS; slot += 1) {
			state = stepSkillsDown(state, COUNT);
			expect(state).toEqual({
				activeIndex: slot,
				windowStart: 0,
				focusedSlot: slot,
			});
		}
		// Slot 1..7 all sit inside the initial window 1..7.
		expect(state).toEqual({
			activeIndex: 6,
			windowStart: 0,
			focusedSlot: 6,
		});
	});

	it("advances the window one skill at the bottom slot; focus stays stuck to slot 7", () => {
		// From {6, 0, 6}: the window moves to skills 2..8 and the focus stays
		// on the bottom slot.
		expect(
			stepSkillsDown({ activeIndex: 6, windowStart: 0, focusedSlot: 6 }, COUNT),
		).toEqual({ activeIndex: 7, windowStart: 1, focusedSlot: 6 });
		// Every further edge step rotates the window one skill per press.
		for (let active = 7; active < 21; active += 1) {
			const next = stepSkillsDown(
				{ activeIndex: active, windowStart: active - 6, focusedSlot: 6 },
				COUNT,
			);
			expect(next).toEqual({
				activeIndex: active + 1,
				windowStart: active - 5,
				focusedSlot: 6,
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
				{ activeIndex: 21, windowStart: 15, focusedSlot: 6 },
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
		let state: SkillsState = { activeIndex: 6, windowStart: 0, focusedSlot: 6 };
		for (let slot = 5; slot >= 0; slot -= 1) {
			state = stepSkillsUp(state, COUNT);
			expect(state).toEqual({
				activeIndex: slot,
				windowStart: 0,
				focusedSlot: slot,
			});
		}
	});

	it("moves the window one skill back at the top slot; focus stays stuck to slot 1", () => {
		// Inside the window: slot 7 -> slot 6, window untouched.
		expect(
			stepSkillsUp({ activeIndex: 7, windowStart: 1, focusedSlot: 6 }, COUNT),
		).toEqual({ activeIndex: 6, windowStart: 1, focusedSlot: 5 });
		// At the top slot: the window shifts one skill back.
		expect(
			stepSkillsUp({ activeIndex: 1, windowStart: 1, focusedSlot: 0 }, COUNT),
		).toEqual({ activeIndex: 0, windowStart: 0, focusedSlot: 0 });
	});

	it("walks the window back one skill per press with focus stuck to the top slot", () => {
		// From the last window: slots 7..2 move within the window, then the
		// window shifts one skill per press while slot 1 keeps the focus.
		let state: SkillsState = {
			activeIndex: 21,
			windowStart: 15,
			focusedSlot: 6,
		};
		for (let slot = 5; slot >= 1; slot -= 1) {
			state = stepSkillsUp(state, COUNT);
			expect(state.focusedSlot).toBe(slot);
			expect(state.windowStart).toBe(15);
		}
		state = stepSkillsUp(state, COUNT);
		expect(state).toEqual({ activeIndex: 15, windowStart: 15, focusedSlot: 0 });
		for (let active = 14; active >= 1; active -= 1) {
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

	it("wraps first -> last to the final window and slot 7", () => {
		expect(stepSkillsUp(initialSkillsState(), COUNT)).toEqual({
			activeIndex: 21,
			windowStart: 15,
			focusedSlot: 6,
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
			clickSkillSlot({ activeIndex: 8, windowStart: 2, focusedSlot: 6 }, 3),
		).toEqual({
			activeIndex: 5,
			windowStart: 2,
			focusedSlot: 3,
		});
		expect(
			clickSkillSlot({ activeIndex: 21, windowStart: 15, focusedSlot: 6 }, 0),
		).toEqual({ activeIndex: 15, windowStart: 15, focusedSlot: 0 });
	});

	it("clamps out-of-range slots to the visible window", () => {
		expect(clickSkillSlot(initialSkillsState(), 9)).toEqual({
			activeIndex: 6,
			windowStart: 0,
			focusedSlot: 6,
		});
		expect(clickSkillSlot(initialSkillsState(), -3)).toEqual(
			initialSkillsState(),
		);
	});
});

// Whatever the starting position, repeated moves never leave the list.
describe("state bounds", () => {
	it("always land inside the 22-skill list", () => {
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
		for (const state of states) {
			expect(state.activeIndex).toBeGreaterThanOrEqual(0);
			expect(state.activeIndex).toBeLessThan(COUNT);
			expect(state.windowStart).toBeGreaterThanOrEqual(0);
			expect(state.windowStart).toBeLessThanOrEqual(COUNT - VISIBLE_SLOTS);
			expect(state.focusedSlot).toBeGreaterThanOrEqual(0);
			expect(state.focusedSlot).toBeLessThan(VISIBLE_SLOTS);
		}
	});
});
