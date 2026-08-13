export type AudioStatus = "no-track" | "ready" | "playing" | "muted";

export type AudioEvent =
	| { kind: "probe-ok" }
	| { kind: "probe-fail" }
	| { kind: "audio-error" }
	| { kind: "gesture" }
	| { kind: "toggle" }
	| { kind: "restore"; muted: boolean };

export interface AudioState {
	status: AudioStatus;
	muted: boolean;
}

// Safe initial state: no track is known yet, so nothing can play and the
// control stays disabled until the HEAD probe resolves (design AD5).
export function createAudioState(): AudioState {
	return { status: "no-track", muted: false };
}

// Pure transition function (design AD5): probe-ok arms the track, the first
// gesture unlocks playback at the persisted mute preference, toggle flips
// playing/muted, and audio-error lands in the terminal no-track state — the
// wiring never re-probes after an error, so no-track stays silent.
export function reduceAudio(state: AudioState, event: AudioEvent): AudioState {
	switch (event.kind) {
		case "probe-ok":
			return state.status === "no-track"
				? { ...state, status: "ready" }
				: state;
		case "probe-fail":
			return state.status === "no-track"
				? state
				: { status: "no-track", muted: state.muted };
		case "audio-error":
			return { status: "no-track", muted: state.muted };
		case "gesture":
			if (state.status !== "ready") return state;
			return {
				status: state.muted ? "muted" : "playing",
				muted: state.muted,
			};
		case "toggle":
			if (state.status !== "playing" && state.status !== "muted") return state;
			return {
				status: state.muted ? "playing" : "muted",
				muted: !state.muted,
			};
		case "restore":
			return { ...state, muted: event.muted };
	}
}
