import { beforeEach, describe, expect, it } from "vitest";

import {
	playClick,
	playClose,
	playSelect,
	resolveClickEffect,
	resolveHoverTarget,
	setEffectSink,
} from "../../src/lib/audio/effects";

// The sink hook (setEffectSink) records which effect would play without any
// real audio playback or DOM.
function recordPlayed(): string[] {
	const played: string[] = [];
	setEffectSink((name) => played.push(name));
	return played;
}

describe("navigation effects", () => {
	beforeEach(() => {
		setEffectSink(() => {});
	});

	it("playClick dispatches the click effect", () => {
		const played = recordPlayed();
		playClick();
		expect(played).toEqual(["click"]);
	});

	it("playSelect dispatches the select effect", () => {
		const played = recordPlayed();
		playSelect();
		expect(played).toEqual(["select"]);
	});

	it("playClose dispatches the close effect", () => {
		const played = recordPlayed();
		playClose();
		expect(played).toEqual(["close"]);
	});
});

describe("resolveClickEffect", () => {
	it("ignores clicks outside menu/list/utility surfaces", () => {
		expect(resolveClickEffect(null)).toBeNull();
		expect(resolveClickEffect({ href: null, matches: () => false })).toBeNull();
	});

	it("plays close for a back action (any anchor pointing at the shell)", () => {
		expect(resolveClickEffect({ href: "/", matches: () => true })).toBe(
			"close",
		);
	});

	it("plays click for menu items", () => {
		expect(
			resolveClickEffect({
				href: "/about",
				matches: (selector) => selector.includes("data-menu-item"),
			}),
		).toBe("click");
	});

	it("plays click for list items", () => {
		expect(
			resolveClickEffect({
				href: null,
				matches: (selector) => selector.includes("data-list-item"),
			}),
		).toBe("click");
	});

	it("plays click for the mute control", () => {
		expect(
			resolveClickEffect({
				href: null,
				matches: (selector) => selector.includes("data-mute-control"),
			}),
		).toBe("click");
	});

	it("keeps a view-navigation href from being treated as a back action", () => {
		expect(resolveClickEffect({ href: "/about", matches: () => true })).toBe(
			"click",
		);
	});
});

describe("resolveHoverTarget", () => {
	it("ignores elements outside the hover surfaces", () => {
		expect(resolveHoverTarget(null)).toBe(false);
		expect(resolveHoverTarget({ matches: () => false })).toBe(false);
	});

	it("resolves menu items", () => {
		expect(
			resolveHoverTarget({
				matches: (selector) => selector.includes("data-menu-item"),
			}),
		).toBe(true);
	});

	it("resolves list items", () => {
		expect(
			resolveHoverTarget({
				matches: (selector) => selector.includes("data-list-item"),
			}),
		).toBe(true);
	});

	it("resolves the mute control", () => {
		expect(
			resolveHoverTarget({
				matches: (selector) => selector.includes("data-mute-control"),
			}),
		).toBe(true);
	});
});
