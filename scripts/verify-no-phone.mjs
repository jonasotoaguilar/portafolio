#!/usr/bin/env node
// L2 privacy gate: exact-value scan of the shipped content surface. The value
// comes ONLY from the ephemeral CV_PHONE env var; it is never accepted through
// argv, never written to output, and never persisted. A missing value is a
// typed failure ("unavailable"), never a silent pass. fs-only: no shell, no
// child processes.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SCAN_PATHS = [
	"src",
	"tests",
	"dist",
	"scripts",
	"openspec",
	"package.json",
];

function filesUnder(dir) {
	const out = [];
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		out.push(...(statSync(path).isDirectory() ? filesUnder(path) : [path]));
	}
	return out;
}

function scanTargets() {
	return SCAN_PATHS.filter((path) => existsSync(path)).flatMap((path) =>
		statSync(path).isDirectory() ? filesUnder(path) : [path],
	);
}

function main() {
	const value = process.env.CV_PHONE;
	if (!value) {
		console.error("privacy gate: unavailable (CV_PHONE not set)");
		process.exit(2);
	}
	let matches = 0;
	for (const path of scanTargets()) {
		try {
			if (readFileSync(path, "utf8").includes(value)) matches += 1;
		} catch {
			// Unreadable or binary files cannot leak the value as text.
		}
	}
	if (matches > 0) {
		console.error(`privacy gate: FAILED (value present in ${matches} file(s))`);
		process.exit(1);
	}
	console.log(`privacy gate: OK (${scanTargets().length} files scanned)`);
}

main();
