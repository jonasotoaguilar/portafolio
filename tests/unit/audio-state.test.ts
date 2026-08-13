import { describe, expect, it } from "vitest";

import {
	type AudioState,
	createAudioState,
	reduceAudio,
} from "../../src/lib/audio/state";

const noTrack = { status: "no-track" as const, muted: false };
const ready = { status: "ready" as const, muted: false };
const playing = { status: "playing" as const, muted: false };
const muted = { status: "muted" as const, muted: true };

describe("createAudioState", () => {
	it("starts safe: no track known, silent, unmuted", () => {
		expect(createAudioState()).toEqual(noTrack);
	});
});

describe("reduceAudio probe", () => {
	it("probe-ok moves no-track to ready", () => {
		expect(reduceAudio(noTrack, { kind: "probe-ok" })).toEqual(ready);
	});
	it("probe-ok is idempotent once ready", () => {
		expect(reduceAudio(ready, { kind: "probe-ok" })).toEqual(ready);
	});
	it("probe-fail lands in no-track", () => {
		expect(reduceAudio(ready, { kind: "probe-fail" })).toEqual(noTrack);
		expect(reduceAudio(noTrack, { kind: "probe-fail" })).toEqual(noTrack);
	});
});

describe("reduceAudio gesture", () => {
	it("first gesture from ready starts playing when unmuted", () => {
		expect(reduceAudio(ready, { kind: "gesture" })).toEqual(playing);
	});
	it("first gesture from a restored-muted ready stays silent as muted", () => {
		expect(reduceAudio({ ...ready, muted: true }, { kind: "gesture" })).toEqual(
			muted,
		);
	});
	it("is a no-op outside ready", () => {
		for (const state of [noTrack, playing, muted]) {
			expect(reduceAudio(state, { kind: "gesture" })).toEqual(state);
		}
	});
});

describe("reduceAudio toggle", () => {
	it("toggles playing to muted and back", () => {
		expect(reduceAudio(playing, { kind: "toggle" })).toEqual(muted);
		expect(reduceAudio(muted, { kind: "toggle" })).toEqual(playing);
	});
	it("is a no-op before unlock and without a track", () => {
		expect(reduceAudio(ready, { kind: "toggle" })).toEqual(ready);
		expect(reduceAudio(noTrack, { kind: "toggle" })).toEqual(noTrack);
	});
});

describe("reduceAudio audio-error terminal", () => {
	it("lands in no-track from any non-terminal status", () => {
		for (const state of [ready, playing, muted]) {
			expect(reduceAudio(state, { kind: "audio-error" }).status).toBe(
				"no-track",
			);
		}
	});
	it("preserves the mute preference while landing terminal", () => {
		expect(reduceAudio(muted, { kind: "audio-error" })).toEqual({
			status: "no-track",
			muted: true,
		});
		expect(reduceAudio(playing, { kind: "audio-error" })).toEqual(noTrack);
	});
	it("is terminal: no later gesture or toggle escapes no-track", () => {
		const terminal = reduceAudio(playing, { kind: "audio-error" });
		expect(terminal.status).toBe("no-track");
		expect(reduceAudio(terminal, { kind: "gesture" })).toEqual(terminal);
		expect(reduceAudio(terminal, { kind: "toggle" })).toEqual(terminal);
	});
});

describe("reduceAudio restore", () => {
	it("restores the persisted mute flag without changing status", () => {
		expect(reduceAudio(noTrack, { kind: "restore", muted: true })).toEqual({
			...noTrack,
			muted: true,
		});
		expect(reduceAudio(ready, { kind: "restore", muted: true })).toEqual({
			...ready,
			muted: true,
		});
		expect(reduceAudio(noTrack, { kind: "restore", muted: false })).toEqual(
			noTrack,
		);
	});
	it("a restored muted preference gates the first gesture", () => {
		const restored: AudioState = reduceAudio(ready, {
			kind: "restore",
			muted: true,
		});
		expect(reduceAudio(restored, { kind: "gesture" })).toEqual(muted);
	});
});
