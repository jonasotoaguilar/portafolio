import clickUrl from "../../../assets/effect/button_click.mp3";
import selectUrl from "../../../assets/effect/button_select.mp3";
import closeUrl from "../../../assets/effect/menu_close.mp3";

import { EFFECT_VOLUME } from "./levels";

// Navigation effect sounds — button_click / button_select / menu_close.
//
// Fully independent from the ambient music wiring: effects play through
// their own Audio elements (created lazily on first use, reused afterwards)
// at their own volume (EFFECT_VOLUME in ./levels), so muting the ambient
// bed never silences UI feedback. The three assets are imported through
// Vite so the build emits them; no public paths are invented.
//
// Interaction contract:
//   - click / Enter activation      -> click  (menu items, list items, mute control)
//   - arrow move / hover            -> select (menu/list items, fine pointers only)
//   - Escape / back / a[href="/"]   -> close  (leaving a view back to the shell)
//
// The deterministic sink hook (setEffectSink) lets unit tests observe which
// effect would play without touching real audio.

export type EffectName = "click" | "select" | "close";

const SOURCES: Record<EffectName, string> = {
	click: clickUrl,
	select: selectUrl,
	close: closeUrl,
};

// Interactive surfaces that count as "menu actions" for the click sound.
// [data-skill-slot] covers the enhanced Skills persistent slots and
// [data-project-slot] the enhanced Projects persistent rows (both drop
// data-list-item so the generic view.ts list logic no-ops on those routes).
const CLICK_TARGETS =
	"[data-menu-item], [data-list-item], [data-skill-slot], [data-project-slot], [data-mute-control]";
// Hover feedback covers menu/list items, the carousel slots, and the mute
// control; anything else stays silent on hover.
const HOVER_TARGETS =
	"[data-menu-item], [data-list-item], [data-skill-slot], [data-project-slot], [data-mute-control]";
// Hover sounds only make sense for a real pointer; coarse/touch-only
// surfaces skip them.
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

const elements: Partial<Record<EffectName, HTMLAudioElement>> = {};

function playEffect(name: EffectName): void {
	const url = SOURCES[name];
	if (!url) return;
	let el = elements[name];
	if (!el) {
		el = new Audio(url);
		elements[name] = el;
	}
	el.volume = EFFECT_VOLUME;
	el.currentTime = 0;
	void el.play().catch(() => {
		// Transient autoplay/gesture failure: feedback audio never throws.
	});
}

type EffectSink = (name: EffectName) => void;

// Production always routes through playEffect; tests swap in a recorder.
let sink: EffectSink = playEffect;

export function playClick(): void {
	sink("click");
}

export function playSelect(): void {
	sink("select");
}

export function playClose(): void {
	sink("close");
}

/** Test hook: replaces the playback sink with a recorder. */
export function setEffectSink(next: EffectSink): void {
	sink = next;
}

export interface ClickCandidate {
	/** href of the closest enclosing anchor, or null outside one. */
	href: string | null;
	matches: (selector: string) => boolean;
}

// Pure decision for the delegated click wiring: any anchor pointing back to
// the shell route is a "close" action (Back to menu, Escape's back link);
// menu/list items and the mute control are "click" actions; everything else
// stays silent.
export function resolveClickEffect(
	candidate: ClickCandidate | null,
): EffectName | null {
	if (!candidate) return null;
	if (candidate.href === "/") return "close";
	return candidate.matches(CLICK_TARGETS) ? "click" : null;
}

export interface HoverCandidate {
	matches: (selector: string) => boolean;
}

// Pure decision for the delegated hover wiring: menu/list items and the mute
// control are the hover-feedback surfaces (button_select); everything else
// stays silent. Mirrors resolveClickEffect so unit tests can probe the
// selector set without a DOM.
export function resolveHoverTarget(candidate: HoverCandidate | null): boolean {
	return candidate?.matches(HOVER_TARGETS) ?? false;
}

// --- delegated wiring (document-level, mirrors the shell/view scripts) ---

let hoveredItem: Element | null = null;
let hoverEnabled = false;
let lastRoute = "/";

function clickTargetOf(event: Event): ClickCandidate | null {
	const el = event.target instanceof Element ? event.target : null;
	if (!el) return null;
	return {
		href: el.closest("a")?.getAttribute("href") ?? null,
		matches: (selector) => el.closest(selector) !== null,
	};
}

function onDelegatedClick(event: MouseEvent): void {
	const effect = resolveClickEffect(clickTargetOf(event));
	if (effect) sink(effect);
}

function onPointerOver(event: PointerEvent): void {
	if (!hoverEnabled) return;
	const el = event.target instanceof Element ? event.target : null;
	const item = el?.closest(HOVER_TARGETS) ?? null;
	// Replays only when the item actually changes: moving between the
	// descendants of one item must not repeat the sound.
	if (
		item &&
		resolveHoverTarget({ matches: (selector) => item.matches(selector) }) &&
		item !== hoveredItem
	) {
		hoveredItem = item;
		sink("select");
	}
}

function onPointerOut(event: PointerEvent): void {
	const related =
		event.relatedTarget instanceof Element
			? event.relatedTarget.closest(HOVER_TARGETS)
			: null;
	if (!related) hoveredItem = null;
}

function onPopState(): void {
	// Browser Back/forward: leaving a view back to the shell route is the
	// close moment (lastRoute is the route of the document being left).
	if (lastRoute !== "/" && location.pathname === "/") sink("close");
	lastRoute = location.pathname;
}

export function initNavigationEffects(): void {
	document.addEventListener("click", onDelegatedClick);
	hoverEnabled = window.matchMedia(FINE_POINTER_QUERY).matches;
	if (hoverEnabled) {
		document.addEventListener("pointerover", onPointerOver);
		document.addEventListener("pointerout", onPointerOut);
	}
	lastRoute = location.pathname;
	window.addEventListener("popstate", onPopState);
}

export function teardownNavigationEffects(): void {
	document.removeEventListener("click", onDelegatedClick);
	document.removeEventListener("pointerover", onPointerOver);
	document.removeEventListener("pointerout", onPointerOut);
	window.removeEventListener("popstate", onPopState);
	hoveredItem = null;
}
