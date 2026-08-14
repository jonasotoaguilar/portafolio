#!/usr/bin/env node
// Bounded responsive derivative generator (design.md "Asset Pipeline & Provenance"):
// AVIF (primary) + WebP (fallback) at the register's locked widths, from the
// byte-untouched originals. Alpha preserved; never enlarges beyond source.
// Width contract: register-declared widths must match WIDTHS_BY_ROLE (locked
// matrix by source role/aspect) — enforced before any derivative is written.
// Output: <stem>-<width>.<format> + manifest.json in the gitignored staging
// dir (dist-assets/); deterministic (byte-for-byte regenerable).
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	assetPath,
	loadRegister,
	requireFromStore,
} from "./verify-provenance.mjs";

const QUALITY = { avif: 55, webp: 80 };

// Locked derivative width matrix (design.md "Route Asset Matrix"): portrait
// principals 480/768/960; landscape principals 480/768/1280; sprites 96/160.
export const WIDTHS_BY_ROLE = {
	portrait: "480,768,960",
	landscape: "480,768,1280",
	sprite: "96,160",
};

// Derivative-contract validation (B2 ownership): every selected register entry
// must declare the exact widths for its source role/aspect. Throws on mismatch.
export async function assertWidthContract(register, assetsDir) {
	const sharp = requireFromStore("sharp");
	const errors = [];
	for (const entry of register.entries) {
		if (!entry.selected) continue;
		if (!entry.widths) {
			errors.push(`${entry.file}: selected entry must declare widths`);
			continue;
		}
		let expected = WIDTHS_BY_ROLE.sprite;
		if (!entry.file.startsWith("asset_")) {
			const meta = await sharp(assetPath(assetsDir, entry.file)).metadata();
			expected =
				meta.width > meta.height
					? WIDTHS_BY_ROLE.landscape
					: WIDTHS_BY_ROLE.portrait;
		}
		if (entry.widths !== expected) {
			errors.push(
				`${entry.file}: widths "${entry.widths}" violate locked matrix "${expected}"`,
			);
		}
	}
	if (errors.length > 0) {
		throw new Error(`width contract violations:\n${errors.join("\n")}`);
	}
}

export async function optimize({ register, assetsDir, outDir }) {
	const sharp = requireFromStore("sharp");
	await assertWidthContract(register, assetsDir);
	mkdirSync(outDir, { recursive: true });
	const results = [];
	for (const entry of register.entries) {
		if (!entry.selected) continue;
		const stem = entry.file.replace(/\.png$/, "");
		for (const width of entry.widths.split(",")) {
			for (const format of ["avif", "webp"]) {
				const out = join(outDir, `${stem}-${width}.${format}`);
				const info = await sharp(assetPath(assetsDir, entry.file))
					.resize({ width: Number(width), withoutEnlargement: true })
					[format]({ quality: QUALITY[format] })
					.toFile(out);
				results.push({
					file: `${stem}-${width}.${format}`,
					format,
					width: Number(width),
					height: info.height,
					bytes: info.size,
					hasAlpha: info.channels === 4,
					sha256: createHash("sha256").update(readFileSync(out)).digest("hex"),
				});
			}
		}
	}
	writeFileSync(
		join(outDir, "manifest.json"),
		`${JSON.stringify(
			{ schema: "derivative-manifest-v1", entries: results },
			null,
			2,
		)}\n`,
	);
	return results;
}

async function main() {
	const root = join(dirname(fileURLToPath(import.meta.url)), "..");
	const assetsDir = join(root, "assets");
	const outDir = join(root, "dist-assets");
	const register = loadRegister(join(assetsDir, "PROVENANCE.yaml"));
	const results = await optimize({ register, assetsDir, outDir });
	let total = 0;
	for (const r of results) {
		total += r.bytes;
		console.log(
			`${r.file}\t${r.width}x${r.height}\t${r.format}\talpha=${r.hasAlpha}\t${r.bytes} B`,
		);
	}
	console.log(
		`optimize: ${results.length} derivatives, ${total} bytes -> ${outDir}`,
	);
}

if (import.meta.main || process.argv[1] === fileURLToPath(import.meta.url)) {
	main().catch((err) => {
		console.error(`optimize: FAILED ${err.message}`);
		process.exit(1);
	});
}
