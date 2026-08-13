import { describe, expect, it } from "vitest";

import {
	escapeHierarchy,
	type MenuState,
	menuOverlayOptions,
	reduceListKey,
	reduceMenuKey,
} from "../../src/lib/menu/keys";

const SHELL_ITEMS = 5;

function state(overrides: Partial<MenuState> = {}): MenuState {
	return { open: true, activeIndex: 0, ...overrides };
}
const move = (activeIndex: number) => ({ kind: "move" as const, activeIndex });
const none = { kind: "none" as const };
const listState = (activeIndex: number) => ({ activeIndex });

describe("reduceMenuKey", () => {
	it("ArrowDown moves to the next shell item and wraps from the last", () => {
		expect(reduceMenuKey(state(), "ArrowDown", SHELL_ITEMS)).toEqual(move(1));
		expect(
			reduceMenuKey(state({ activeIndex: 4 }), "ArrowDown", SHELL_ITEMS),
		).toEqual(move(0));
		expect(
			reduceMenuKey(state({ activeIndex: -1 }), "ArrowDown", SHELL_ITEMS),
		).toEqual(move(0));
	});
	it("ArrowUp moves to the previous shell item and wraps from the first", () => {
		expect(
			reduceMenuKey(state({ activeIndex: 3 }), "ArrowUp", SHELL_ITEMS),
		).toEqual(move(2));
		expect(
			reduceMenuKey(state({ activeIndex: 0 }), "ArrowUp", SHELL_ITEMS),
		).toEqual(move(4));
		expect(
			reduceMenuKey(state({ activeIndex: -1 }), "ArrowUp", SHELL_ITEMS),
		).toEqual(move(4));
	});
	it("Enter signals activation intent", () => {
		expect(reduceMenuKey(state(), "Enter", SHELL_ITEMS)).toEqual({
			kind: "activate",
		});
	});
	it("is a no-op for unsupported keys, an inactive shell, and empty lists", () => {
		for (const key of ["a", " ", "Home", "Escape", "Tab"]) {
			expect(reduceMenuKey(state(), key, SHELL_ITEMS)).toEqual(none);
		}
		for (const key of ["ArrowDown", "ArrowUp", "Enter", "a"]) {
			expect(reduceMenuKey(state({ open: false }), key, SHELL_ITEMS)).toEqual(
				none,
			);
		}
		for (const key of ["ArrowDown", "ArrowUp", "Enter"]) {
			expect(reduceMenuKey(state(), key, 0)).toEqual(none);
		}
	});
});

describe("reduceListKey", () => {
	it("ArrowDown and ArrowUp move across list items, wrapping at the ends", () => {
		expect(reduceListKey(listState(0), "ArrowDown", 3)).toEqual(move(1));
		expect(reduceListKey(listState(2), "ArrowDown", 3)).toEqual(move(0));
		expect(reduceListKey(listState(1), "ArrowUp", 3)).toEqual(move(0));
		expect(reduceListKey(listState(0), "ArrowUp", 3)).toEqual(move(2));
		expect(reduceListKey(listState(-1), "ArrowDown", 3)).toEqual(move(0));
	});

	it("Enter and ArrowRight signal opening the detail panel", () => {
		expect(reduceListKey(listState(1), "Enter", 3)).toEqual({
			kind: "open",
		});
		expect(reduceListKey(listState(1), "ArrowRight", 3)).toEqual({
			kind: "open",
		});
	});

	it("is a no-op for unsupported keys and empty lists", () => {
		for (const key of ["a", " ", "Escape", "Tab", "ArrowLeft", "Home"]) {
			expect(reduceListKey(listState(0), key, 3)).toEqual(none);
		}
		for (const key of ["ArrowDown", "ArrowUp", "Enter", "ArrowRight"]) {
			expect(reduceListKey(listState(0), key, 0)).toEqual(none);
		}
	});
});

describe("escapeHierarchy", () => {
	it("closes the open panel before leaving the view", () => {
		expect(escapeHierarchy(true)).toBe("close-panel");
	});

	it("returns to the menu when no panel is open", () => {
		expect(escapeHierarchy(false)).toBe("to-menu");
	});
});

describe("menuOverlayOptions", () => {
	it("five-item overlay moment is exactly 300 + 4x25 = 400ms", () => {
		const options = menuOverlayOptions(false);
		expect(options.reduced).toBe(false);
		expect(options.itemDuration).toBe(300);
		expect(options.stagger).toBe(25);
		expect(options.itemDuration + 4 * options.stagger).toBe(400);
	});
	it("reduced motion is opacity-only at most 200ms with no stagger", () => {
		const options = menuOverlayOptions(true);
		expect(options.reduced).toBe(true);
		expect(options.itemDuration).toBeLessThanOrEqual(200);
		expect(options.stagger).toBe(0);
	});
});
