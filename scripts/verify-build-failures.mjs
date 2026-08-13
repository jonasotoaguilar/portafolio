#!/usr/bin/env node
// Build-failure evidence harness (portfolio-content / resume-content): schema
// violations MUST fail `astro build` with no output, and the restored tree
// MUST build again. Each mutation is temporary and byte-restored in `finally`;
// nothing invalid is ever left on disk. "No output" is proven by comparing the
// dist tree before and after the failed build (Astro leaves dist untouched
// when content validation fails).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

const MUTATIONS = [
	{
		label: "project entry missing required link",
		path: "src/content/projects/serviceflow.md",
		apply: (content) => content.replace(/^link:.*$/m, ""),
	},
	{
		label: "malformed site config email",
		path: "src/content/site.config.yaml",
		apply: (content) =>
			content.replace(/^ {2}email:.*$/m, "  email: not-an-email"),
	},
	{
		label: "resume education entry missing required period",
		path: "src/content/resume.yaml",
		apply: (content) => content.replace(/^ {6}period: .*$/m, ""),
	},
];

function filesUnder(dir) {
	const out = [];
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		out.push(...(statSync(path).isDirectory() ? filesUnder(path) : [path]));
	}
	return out;
}

function distSnapshot() {
	if (!existsSync("dist")) return null;
	const files = filesUnder("dist").sort();
	const hash = createHash("sha256");
	for (const path of files) {
		hash.update(path);
		hash.update(readFileSync(path));
	}
	return { count: files.length, hash: hash.digest("hex") };
}

function build() {
	const result = spawnSync("pnpm", ["build"], {
		stdio: ["ignore", "pipe", "pipe"],
		encoding: "utf8",
	});
	return {
		code: result.status,
		output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
	};
}

const failures = [];
for (const mutation of MUTATIONS) {
	const original = readFileSync(mutation.path, "utf8");
	writeFileSync(mutation.path, mutation.apply(original));
	try {
		const before = distSnapshot();
		const { code } = build();
		const after = distSnapshot();
		const producedNoOutput =
			before === null
				? after === null
				: after !== null && after.hash === before.hash;
		const ok = code !== 0 && producedNoOutput;
		console.log(
			`${mutation.label}: exit ${code}, dist changed: ${!producedNoOutput} -> ${ok ? "PASS" : "FAIL"}`,
		);
		if (!ok) failures.push(mutation.label);
	} finally {
		writeFileSync(mutation.path, original);
	}
}
const restored = build();
console.log(
	`restored tree build: exit ${restored.code} -> ${restored.code === 0 ? "PASS" : "FAIL"}`,
);
if (restored.code !== 0) failures.push("restored tree build");
if (failures.length > 0) {
	console.error(`build-failure harness FAILED: ${failures.join(", ")}`);
	process.exit(1);
}
console.log(
	"build-failure harness: OK (3 schema violations failed the build with no output; restored tree builds again)",
);
