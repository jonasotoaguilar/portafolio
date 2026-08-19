import { describe, expect, it } from "vitest";

import {
	clickProjectSlot,
	initialProjectsState,
	MAX_VISIBLE_SLOTS,
	type ProjectsState,
	stepProjectsDown,
	stepProjectsUp,
	visibleSlotCount,
} from "../../src/lib/projects/window";

// The approved persistent-slot contract: at most 5 persistent rows, one
// state {activeIndex, windowStart, focusedSlot}. The invariant
// activeIndex = windowStart + focusedSlot holds after every step, and the
// visible slot count shrinks to the record count below the cap (4 projects
// show 4 slots; 6/7 show exactly 5).

describe("visibleSlotCount", () => {
	it("caps the visible slots at five", () => {
		expect(visibleSlotCount(6)).toBe(5);
		expect(visibleSlotCount(7)).toBe(5);
		expect(visibleSlotCount(5)).toBe(5);
	});

	it("shows every record when the collection fits the cap", () => {
		expect(visibleSlotCount(4)).toBe(4);
		expect(visibleSlotCount(1)).toBe(1);
	});

	it("is safe with degenerate inputs", () => {
		expect(visibleSlotCount(0)).toBe(1);
		expect(visibleSlotCount(-3)).toBe(1);
	});
});

describe("initialProjectsState", () => {
	it("starts on project 1 with the window at the top and focus on slot 1", () => {
		expect(initialProjectsState()).toEqual({
			activeIndex: 0,
			windowStart: 0,
			focusedSlot: 0,
		});
	});
});

describe("stepProjectsDown", () => {
	it("moves through the five slots without moving the window", () => {
		const count = 7;
		let state = initialProjectsState();
		for (let slot = 1; slot < MAX_VISIBLE_SLOTS; slot += 1) {
			state = stepProjectsDown(state, count);
			expect(state).toEqual({
				activeIndex: slot,
				windowStart: 0,
				focusedSlot: slot,
			});
		}
		expect(state).toEqual({
			activeIndex: 4,
			windowStart: 0,
			focusedSlot: 4,
		});
	});

	it("advances the window one project at the bottom slot; focus stays stuck to slot 5", () => {
		const count = 7;
		expect(
			stepProjectsDown(
				{ activeIndex: 4, windowStart: 0, focusedSlot: 4 },
				count,
			),
		).toEqual({ activeIndex: 5, windowStart: 1, focusedSlot: 4 });
		// Every further edge step rotates the window one project per press.
		for (let active = 5; active < 6; active += 1) {
			const next = stepProjectsDown(
				{ activeIndex: active, windowStart: active - 4, focusedSlot: 4 },
				count,
			);
			expect(next).toEqual({
				activeIndex: active + 1,
				windowStart: active - 3,
				focusedSlot: 4,
			});
		}
	});

	it("walks the whole 7-project list forward with the invariant holding", () => {
		const count = 7;
		let state = initialProjectsState();
		for (let active = 1; active <= count - 1; active += 1) {
			state = stepProjectsDown(state, count);
			expect(state.activeIndex).toBe(active);
			expect(state.focusedSlot).toBe(state.activeIndex - state.windowStart);
			expect(state.windowStart).toBeGreaterThanOrEqual(0);
			expect(state.windowStart).toBeLessThanOrEqual(count - MAX_VISIBLE_SLOTS);
		}
	});

	it("wraps last -> first to the initial window and slot 1", () => {
		expect(
			stepProjectsDown({ activeIndex: 6, windowStart: 2, focusedSlot: 4 }, 7),
		).toEqual(initialProjectsState());
	});

	it("with four projects the slots wrap inside a single window", () => {
		const count = 4;
		let state = initialProjectsState();
		state = stepProjectsDown(state, count);
		state = stepProjectsDown(state, count);
		state = stepProjectsDown(state, count);
		expect(state).toEqual({ activeIndex: 3, windowStart: 0, focusedSlot: 3 });
		// One more press wraps back to project 1, still in window 1..4.
		expect(stepProjectsDown(state, count)).toEqual(initialProjectsState());
	});

	it("is safe with degenerate inputs", () => {
		const state = initialProjectsState();
		expect(stepProjectsDown(state, 0)).toBe(state);
	});
});

describe("stepProjectsUp", () => {
	it("moves back through the slots without moving the window", () => {
		const count = 7;
		let state: ProjectsState = {
			activeIndex: 4,
			windowStart: 0,
			focusedSlot: 4,
		};
		for (let slot = 3; slot >= 0; slot -= 1) {
			state = stepProjectsUp(state, count);
			expect(state).toEqual({
				activeIndex: slot,
				windowStart: 0,
				focusedSlot: slot,
			});
		}
	});

	it("moves the window one project back at the top slot; focus stays stuck to slot 1", () => {
		const count = 7;
		// Inside the window: slot 5 -> slot 4, window untouched.
		expect(
			stepProjectsUp({ activeIndex: 5, windowStart: 1, focusedSlot: 4 }, count),
		).toEqual({ activeIndex: 4, windowStart: 1, focusedSlot: 3 });
		// At the top slot: the window shifts one project back.
		expect(
			stepProjectsUp({ activeIndex: 1, windowStart: 1, focusedSlot: 0 }, count),
		).toEqual({ activeIndex: 0, windowStart: 0, focusedSlot: 0 });
	});

	it("walks the window back one project per press with focus stuck to the top slot", () => {
		const count = 7;
		let state: ProjectsState = {
			activeIndex: 6,
			windowStart: 2,
			focusedSlot: 4,
		};
		for (let slot = 3; slot >= 1; slot -= 1) {
			state = stepProjectsUp(state, count);
			expect(state.focusedSlot).toBe(slot);
			expect(state.windowStart).toBe(2);
		}
		state = stepProjectsUp(state, count);
		expect(state).toEqual({ activeIndex: 2, windowStart: 2, focusedSlot: 0 });
		for (let active = 1; active >= 1; active -= 1) {
			state = stepProjectsUp(state, count);
			expect(state).toEqual({
				activeIndex: active,
				windowStart: active,
				focusedSlot: 0,
			});
		}
		expect(state).toEqual({ activeIndex: 1, windowStart: 1, focusedSlot: 0 });
		state = stepProjectsUp(state, count);
		expect(state).toEqual(initialProjectsState());
	});

	it("wraps first -> last to the final window and slot 5", () => {
		expect(stepProjectsUp(initialProjectsState(), 7)).toEqual({
			activeIndex: 6,
			windowStart: 2,
			focusedSlot: 4,
		});
	});

	it("with four projects the slots wrap inside a single window", () => {
		expect(stepProjectsUp(initialProjectsState(), 4)).toEqual({
			activeIndex: 3,
			windowStart: 0,
			focusedSlot: 3,
		});
	});

	it("is safe with degenerate inputs", () => {
		const state = initialProjectsState();
		expect(stepProjectsUp(state, 0)).toBe(state);
	});
});

describe("clickProjectSlot", () => {
	it("selects the clicked slot within the current window without moving it", () => {
		expect(clickProjectSlot(initialProjectsState(), 4, 7)).toEqual({
			activeIndex: 4,
			windowStart: 0,
			focusedSlot: 4,
		});
		expect(
			clickProjectSlot(
				{ activeIndex: 6, windowStart: 2, focusedSlot: 4 },
				2,
				7,
			),
		).toEqual({
			activeIndex: 4,
			windowStart: 2,
			focusedSlot: 2,
		});
	});

	it("clamps out-of-range slots to the visible window", () => {
		expect(clickProjectSlot(initialProjectsState(), 9, 7)).toEqual({
			activeIndex: 4,
			windowStart: 0,
			focusedSlot: 4,
		});
		expect(clickProjectSlot(initialProjectsState(), -3, 7)).toEqual(
			initialProjectsState(),
		);
	});

	it("respects a sub-five collection", () => {
		expect(clickProjectSlot(initialProjectsState(), 3, 4)).toEqual({
			activeIndex: 3,
			windowStart: 0,
			focusedSlot: 3,
		});
		expect(clickProjectSlot(initialProjectsState(), 6, 4)).toEqual({
			activeIndex: 3,
			windowStart: 0,
			focusedSlot: 3,
		});
	});
});

// Whatever the starting position, repeated moves never leave the list.
describe("state bounds", () => {
	it("always land inside a 7-project list", () => {
		const count = 7;
		let state = initialProjectsState();
		const states: ProjectsState[] = [state];
		for (let i = 0; i < 30; i += 1) {
			state = stepProjectsDown(state, count);
			states.push(state);
		}
		for (let i = 0; i < 30; i += 1) {
			state = stepProjectsUp(state, count);
			states.push(state);
		}
		for (const state of states) {
			expect(state.activeIndex).toBeGreaterThanOrEqual(0);
			expect(state.activeIndex).toBeLessThan(count);
			expect(state.windowStart).toBeGreaterThanOrEqual(0);
			expect(state.windowStart).toBeLessThanOrEqual(count - MAX_VISIBLE_SLOTS);
			expect(state.focusedSlot).toBeGreaterThanOrEqual(0);
			expect(state.focusedSlot).toBeLessThan(MAX_VISIBLE_SLOTS);
		}
	});
});
