#!/usr/bin/env node
import { spawnSync } from "node:child_process";
// Deterministic ambient-track derivative generator (ADR-0006 "Bundled
// Pixabay-licensed ambient track over BYO"). Re-encodes the byte-untouched
// source assets/music/background.mp3 into the committed derivative
// public/audio/background.mp3 with pinned ffmpeg flags, so the derivative is
// a maintainer-run, CI-safe artifact: CI never needs ffmpeg, and the
// provenance gate verifies the committed file against the sha256 recorded in
// assets/PROVENANCE.yaml (music entry).
//
// Pinned encode (ADR-0006): -c:a libmp3lame -b:a 128k -ar 48000
// -joint_stereo 1 — MP3 is universally supported, no codec fallback needed.
//
// Usage: node scripts/optimize-audio.mjs
// On success it prints the derivative path, byte size and sha256 (record the
// hash in assets/PROVENANCE.yaml under music[].derivative-sha256).
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "assets", "music", "background.mp3");
const DERIVATIVE = join(ROOT, "public", "audio", "background.mp3");

// Pinned flags from ADR-0006; any change here is a derivative contract change
// and must be recorded in the provenance register.
const FFMPEG_FLAGS = [
	"-y",
	"-i",
	SOURCE,
	"-c:a",
	"libmp3lame",
	"-b:a",
	"128k",
	"-ar",
	"48000",
	"-joint_stereo",
	"1",
	DERIVATIVE,
];

function sha256(path) {
	return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function main() {
	const result = spawnSync("ffmpeg", FFMPEG_FLAGS, { stdio: "inherit" });
	if (result.error) {
		console.error(
			`optimize-audio: ffmpeg unavailable (${result.error.message}); ` +
				"install ffmpeg or regenerate manually with the pinned flags from ADR-0006",
		);
		process.exit(1);
	}
	if (result.status !== 0) {
		console.error(`optimize-audio: ffmpeg exited ${result.status}`);
		process.exit(1);
	}
	const size = statSync(DERIVATIVE).size;
	const hash = sha256(DERIVATIVE);
	console.log(`optimize-audio: ${DERIVATIVE}`);
	console.log(`optimize-audio: ${size} bytes, sha256 ${hash}`);
	console.log(
		"optimize-audio: record the sha256 in assets/PROVENANCE.yaml (music[].derivative-sha256)",
	);
}

main();
