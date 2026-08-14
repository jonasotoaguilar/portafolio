// Unit B2 — PENDING scope (maintainer split 2026-08-13): optimizer + responsive
// derivatives. Preserved from the original oversized Unit B (historical RED:
// module-not-found; GREEN 2/2 byte-identity/regenerability). B2 re-adds the
// derivative width contract: WIDTHS_BY_ROLE lives in the optimizer (single
// source of truth) and assertWidthContract validates the register against it.
import { createHash } from "node:crypto";
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	assertWidthContract,
	optimize,
	WIDTHS_BY_ROLE,
} from "../../scripts/optimize-assets.mjs";
import {
	loadRegister,
	OWNER,
	OWNER_LICENSE,
} from "../../scripts/verify-provenance.mjs";

const ROOT = join(import.meta.dirname, "..", "..");

// Locked design mapping (design.md "Route Asset Matrix"): source -> role widths.
const WIDTHS_MATRIX = {
	persona_1: WIDTHS_BY_ROLE.portrait,
	persona_2: WIDTHS_BY_ROLE.portrait,
	persona_6: WIDTHS_BY_ROLE.landscape,
	persona_9: WIDTHS_BY_ROLE.landscape,
	persona_11: WIDTHS_BY_ROLE.landscape,
	persona_8: WIDTHS_BY_ROLE.landscape,
	asset_12_clock: WIDTHS_BY_ROLE.sprite,
	asset_09_badge_dev: WIDTHS_BY_ROLE.sprite,
	asset_10_computer: WIDTHS_BY_ROLE.sprite,
	asset_14_fire: WIDTHS_BY_ROLE.sprite,
	asset_04_mariposa_neon: WIDTHS_BY_ROLE.sprite,
	asset_05_card: WIDTHS_BY_ROLE.sprite,
};

function sha256(path: string) {
	return createHash("sha256").update(readFileSync(path)).digest("hex");
}
function tmpDir() {
	return mkdtempSync(join(tmpdir(), "prov-"));
}
function quote(v: unknown) {
	const s = String(v);
	return /[, ]/.test(s) ? `"${s}"` : s;
}
function writeRegister(dir: string, entries: any[], schemaVersion = 1) {
	const body = entries
		.map(
			(e: any) =>
				`  - {${Object.entries(e)
					.map(([k, v]) => `${k}: ${quote(v)}`)
					.join(", ")}}`,
		)
		.join("\n");
	writeFileSync(
		join(dir, "PROVENANCE.yaml"),
		`schema-version: ${schemaVersion}\nregister:\n${body}\n`,
	);
	return join(dir, "PROVENANCE.yaml");
}
function baseEntry(over: any = {}) {
	return {
		file: "persona_1.png",
		"origin-class": "owner-created",
		license: OWNER_LICENSE,
		creator: OWNER,
		"commercial-use": "permitted",
		modification: "permitted",
		"usage-role": "principal-persona",
		selected: true,
		widths: WIDTHS_MATRIX.persona_1,
		...over,
	};
}

describe("asset pipeline — originals untouched, derivatives regenerable", () => {
	it("pipeline keeps originals byte-identical; derivatives match matrix with alpha; manifest deterministic", async () => {
		const source = join(ROOT, "assets", "persona", "persona_1.png");
		const before = sha256(source);
		const dir = tmpDir();
		const register = loadRegister(writeRegister(dir, [baseEntry()]));
		const out1 = join(dir, "out1");
		const out2 = join(dir, "out2");
		const results = await optimize({
			register,
			assetsDir: join(ROOT, "assets"),
			outDir: out1,
		});
		expect(sha256(source)).toBe(before);
		expect(
			results.map((r: any) => `${r.format}@${r.width}:${r.height}`),
		).toEqual([
			"avif@480:720",
			"webp@480:720",
			"avif@768:1152",
			"webp@768:1152",
			"avif@960:1440",
			"webp@960:1440",
		]);
		expect(results.every((r: any) => r.hasAlpha === true && r.bytes > 0)).toBe(
			true,
		);
		const manifest = JSON.parse(
			readFileSync(join(out1, "manifest.json"), "utf8"),
		);
		expect(manifest.schema).toBe("derivative-manifest-v1");
		expect(manifest.entries).toEqual(results);
		await optimize({ register, assetsDir: join(ROOT, "assets"), outDir: out2 });
		for (const r of results) {
			expect(readFileSync(join(out2, r.file))).toEqual(
				readFileSync(join(out1, r.file)),
			);
		}
		expect(readFileSync(join(out2, "manifest.json"))).toEqual(
			readFileSync(join(out1, "manifest.json")),
		);
	}, 60000);

	it("deferred entries generate no derivatives", async () => {
		const dir = tmpDir();
		mkdirSync(join(dir, "persona"), { recursive: true });
		copyFileSync(
			join(ROOT, "assets", "persona", "persona_1.png"),
			join(dir, "persona", "persona_1.png"),
		);
		writeFileSync(join(dir, "persona", "persona_7.png"), "fake-png-bytes");
		const register = loadRegister(
			writeRegister(dir, [
				baseEntry(),
				{
					file: "persona_7.png",
					"origin-class": "owner-created",
					license: OWNER_LICENSE,
					creator: OWNER,
					"commercial-use": "permitted",
					modification: "permitted",
					"usage-role": "principal-persona",
					selected: false,
				},
			]),
		);
		const results = await optimize({
			register,
			assetsDir: dir,
			outDir: join(dir, "out"),
		});
		expect(results).toHaveLength(6);
		expect(results.every((r: any) => r.file.startsWith("persona_1-"))).toBe(
			true,
		);
	}, 60000);
});

describe("derivative width contract — register declares the locked matrix", () => {
	it("rejects a portrait persona declaring the landscape width set", async () => {
		const dir = tmpDir();
		const register = loadRegister(
			writeRegister(dir, [baseEntry({ widths: WIDTHS_BY_ROLE.landscape })]),
		);
		await expect(
			assertWidthContract(register, join(ROOT, "assets")),
		).rejects.toThrow(/width contract violations/);
		await expect(
			optimize({
				register,
				assetsDir: join(ROOT, "assets"),
				outDir: join(dir, "out"),
			}),
		).rejects.toThrow(/width contract violations/);
	});

	it("rejects a sprite accent whose widths are not 96,160", async () => {
		const dir = tmpDir();
		const register = loadRegister(
			writeRegister(dir, [
				baseEntry({
					file: "asset_04_mariposa_neon.png",
					"usage-role": "sprite-accent",
					widths: "96,320",
				}),
			]),
		);
		await expect(
			assertWidthContract(register, join(ROOT, "assets")),
		).rejects.toThrow(/96,160/);
	});

	it("matrix uses the canonical sprite key; legacy icon key is rejected", () => {
		expect(WIDTHS_BY_ROLE.sprite).toBe("96,160");
		expect(WIDTHS_BY_ROLE).not.toHaveProperty("icon");
	});

	it("accepts the real register — all 12 selected entries match the matrix", async () => {
		const register = loadRegister(join(ROOT, "assets", "PROVENANCE.yaml"));
		await expect(
			assertWidthContract(register, join(ROOT, "assets")),
		).resolves.toBeUndefined();
	});
});
