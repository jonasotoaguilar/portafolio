import { AMBIENT_VOLUME } from "../lib/audio/levels";
import {
	type AudioState,
	createAudioState,
	reduceAudio,
} from "../lib/audio/state";

// Design AD5 ambient-audio wiring. This module runs once per page load: it
// finds the persisted control cluster, adopts the probe outcome stashed on it
// by the previous page (so swaps never re-probe), and re-arms the one-time
// gesture unlock. The <audio> element itself survives view-transition swaps
// via transition:persist, so playback continues across navigation.

const PROBE_URL = "/audio/background.mp3";
const STORAGE_KEY = "portfolio:audio:muted";
const FADE_MS = 400;
const REDUCED_FADE_MS = 200;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const GESTURE_EVENTS = ["pointerdown", "keydown"] as const;
// Case-insensitive keyboard shortcut for the mute control (aria-keyshortcuts
// in AudioControl.astro mirrors this).
const MUTE_SHORTCUT_KEY = "m";

type ProbeResult = "ok" | "fail" | null;

// Stashed on the persisted cluster element: probe outcome + last known state
// survive the swap so the next page's init adopts them without re-probing.
interface AudioStash {
	probe: ProbeResult;
	state: AudioState;
}

let cluster: HTMLElement | null = null;
let audio: HTMLAudioElement | null = null;
let button: HTMLButtonElement | null = null;
let state = createAudioState();
let probeResult: ProbeResult = null;
let probeInFlight = false;
let probeController: AbortController | null = null;
let fadeTimer = 0;

function fadeMs(): number {
	return window.matchMedia(REDUCED_MOTION_QUERY).matches
		? REDUCED_FADE_MS
		: FADE_MS;
}

function writeStash(): void {
	if (!cluster) return;
	(cluster as unknown as { __ambientAudio?: AudioStash }).__ambientAudio = {
		probe: probeResult,
		state,
	};
}

function readStash(): AudioStash | undefined {
	if (!cluster) return undefined;
	return (cluster as unknown as { __ambientAudio?: AudioStash }).__ambientAudio;
}

function persistMuted(): void {
	try {
		localStorage.setItem(STORAGE_KEY, state.muted ? "1" : "0");
	} catch {
		// Storage unavailable: keep the in-memory state, never throw.
	}
}

function readPersistedMuted(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) === "1";
	} catch {
		return false;
	}
}

function render(): void {
	if (!button) return;
	const noTrack = state.status === "no-track";
	button.disabled = noTrack;
	button.setAttribute("aria-pressed", state.muted ? "true" : "false");
	button.dataset.audioState = state.status;
	// The visible face is the music-note icon (crossed out off-state, clean
	// on-state, toggled by data-audio-state in global.css); the accessible
	// name stays on aria-label so assistive tech reads the real state.
	const label = noTrack || state.muted ? "Sound: Off" : "Sound: On";
	if (button.getAttribute("aria-label") !== label) {
		button.setAttribute("aria-label", label);
	}
	writeStash();
}

function cancelFade(): void {
	if (fadeTimer) clearInterval(fadeTimer);
	fadeTimer = 0;
}

// Volume ramp over 400ms (200ms under reduced motion); pauses once silent.
// Interruptible: a later fade cancels this one and retargets from the
// current element volume (a mute mid-fade-in ramps from what was audible).
// The timer driver is drift-corrected wall-clock math, so a stalled frame
// loop (throttled tabs, busy main thread) delays rather than kills the fade.
function fadeVolume(to: number, onDone?: () => void): void {
	const el = audio;
	if (!el) return;
	cancelFade();
	const from = el.volume;
	const start = performance.now();
	fadeTimer = window.setInterval(() => {
		const t = Math.min(1, (performance.now() - start) / fadeMs());
		el.volume = from + (to - from) * t;
		if (t >= 1) {
			cancelFade();
			onDone?.();
		}
	}, 25);
}

function playWithFade(): void {
	const el = audio;
	if (!el) return;
	el.volume = 0;
	void el.play().catch(() => {
		// Transient autoplay/failure: the error event drives the machine.
	});
	// The music is a quiet background bed: the fade ramps to the reduced
	// ambient target (levels.ts), never full scale — UI feedback would be
	// masked at volume 1.
	fadeVolume(AMBIENT_VOLUME);
}

function muteWithFade(): void {
	fadeVolume(0, () => audio?.pause());
}

function disarmGesture(): void {
	for (const type of GESTURE_EVENTS) {
		document.removeEventListener(type, onGesture);
	}
}

function onGesture(): void {
	if (state.status !== "ready") return;
	state = reduceAudio(state, { kind: "gesture" });
	render();
	disarmGesture();
	if (state.status === "playing") playWithFade();
}

function armGesture(): void {
	if (state.status !== "ready") return;
	for (const type of GESTURE_EVENTS) {
		document.addEventListener(type, onGesture, { once: true });
	}
}

// Shared toggle path for the click handler and the M shortcut: flips through
// the same reducer, fades, and persists — one state machine, never a second.
// Click-originated toggles capture the button's focus before render() mutates
// disabled/aria attributes and restore it afterwards, so a pointer click
// always leaves the control focused; keyboard/M toggles never move focus.
function applyToggle(restoreClickFocus: boolean): void {
	const restoreFocus = restoreClickFocus && document.activeElement === button;
	// The first click doubles as the unlock gesture: its pointer/keydown
	// fires first and starts playback, then the click's toggle flips it
	// (design data flow: gesture → toggle). For later toggles this is a
	// no-op guard.
	onGesture();
	const next = reduceAudio(state, { kind: "toggle" });
	if (next === state) {
		if (restoreFocus) button?.focus();
		return;
	}
	state = next;
	render();
	if (restoreFocus) button?.focus();
	if (state.status === "playing") {
		playWithFade();
	} else if (state.status === "muted") {
		muteWithFade();
	}
	persistMuted();
}

function onToggle(event: MouseEvent): void {
	// detail > 0 marks a pointer-originated click (keyboard activation sends
	// detail 0): only pointer clicks get the focus-restore treatment.
	applyToggle(event.detail > 0);
}

// Typing surfaces own their keys; the shortcut never fires from them.
function isTypingSurface(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLElement &&
		target.closest("input, textarea, select, [contenteditable]") !== null
	);
}

function onMShortcut(event: KeyboardEvent): void {
	if (event.repeat) return;
	if (event.key.toLowerCase() !== MUTE_SHORTCUT_KEY) return;
	if (isTypingSurface(event.target)) return;
	// Still locked (ready): this very keydown IS the first gesture. Unlock
	// here — onGesture() disarms the generic first-gesture listener
	// mid-dispatch, so this keydown cannot fire it again — and skip the
	// toggle: one M press, one transition, never a double flip.
	if (state.status === "ready") {
		onGesture();
		return;
	}
	applyToggle(false);
}

function onAudioError(): void {
	if (state.status === "no-track") return;
	state = reduceAudio(state, { kind: "audio-error" });
	probeResult = "fail";
	render();
}

function onProbeResult(result: "ok" | "fail"): void {
	probeInFlight = false;
	probeResult = result;
	state = reduceAudio(state, {
		kind: result === "ok" ? "probe-ok" : "probe-fail",
	});
	render();
	if (result === "ok") armGesture();
}

async function runProbe(): Promise<void> {
	if (probeInFlight || probeResult !== null) return;
	probeInFlight = true;
	probeController = new AbortController();
	let ok = false;
	try {
		const response = await fetch(PROBE_URL, {
			method: "HEAD",
			signal: probeController.signal,
		});
		// 200 → track present; 405 → host without HEAD, optimistic; anything
		// else (404) → absent, terminal no-track.
		ok = response.status === 200 || response.status === 405;
	} catch {
		if (probeController?.signal.aborted) return;
		ok = true; // network hiccup: optimistic; an <audio> error corrects it
	}
	onProbeResult(ok ? "ok" : "fail");
}

function bindAudioEvents(): void {
	audio?.addEventListener("error", onAudioError);
	button?.addEventListener("click", onToggle);
	// Registered before armGesture() so the shortcut always runs ahead of the
	// generic first-gesture keydown listener (see onMShortcut).
	document.addEventListener("keydown", onMShortcut);
}

function teardownAudio(): void {
	disarmGesture();
	cancelFade();
	audio?.removeEventListener("error", onAudioError);
	button?.removeEventListener("click", onToggle);
	document.removeEventListener("keydown", onMShortcut);
	cluster = null;
	audio = null;
	button = null;
}

function setupAudio(): void {
	const found = document.querySelector<HTMLElement>("[data-control-cluster]");
	if (!found) return;
	cluster = found;
	audio = found.querySelector<HTMLAudioElement>("[data-audio-element]");
	button = found.querySelector<HTMLButtonElement>("[data-mute-control]");
	if (!audio || !button) return;

	const stash = readStash();
	if (stash?.probe === "ok") {
		probeResult = "ok";
		// Adopt the stashed state; a still-playing element is the truth.
		state = audio.paused
			? { ...stash.state }
			: { ...stash.state, status: "playing", muted: false };
	} else if (stash?.probe === "fail") {
		probeResult = "fail";
		state = { status: "no-track", muted: stash.state.muted };
	} else {
		// Fresh load (or an aborted in-flight probe): restore the persisted
		// preference, then probe exactly once.
		state = reduceAudio(createAudioState(), {
			kind: "restore",
			muted: readPersistedMuted(),
		});
		void runProbe();
	}
	bindAudioEvents();
	armGesture();
	render();
}

document.addEventListener("astro:page-load", () => {
	teardownAudio();
	setupAudio();
});
document.addEventListener("astro:before-swap", () => {
	// Stash probe outcome + state on the element that survives the swap, then
	// abort any in-flight probe so the next page re-probes fresh.
	writeStash();
	probeController?.abort();
	probeInFlight = false;
	teardownAudio();
});
setupAudio();
