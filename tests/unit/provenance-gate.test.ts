// Unit B1 — provenance gate (fs-only): register completeness, owner metadata,
// license vocabulary, roles/selection, source paths, dist exclusions (width map and optimizer in B2).
import { createHash } from "node:crypto";
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	assetPath,
	loadRegister,
	OWNER,
	OWNER_LICENSE,
	scanDist,
	validateRegister,
} from "../../scripts/verify-provenance.mjs";

const ROOT = join(import.meta.dirname, "..", "..");
const tmp = () => mkdtempSync(join(tmpdir(), "prov-"));

function writeRegister(dir: string, entry: any, version = 1) {
	const path = join(dir, "PROVENANCE.yaml");
	const fields = Object.entries(entry)
		.filter(([, v]) => v !== undefined)
		.map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
		.join(", ");
	writeFileSync(path, `schema-version: ${version}\nregister: [{${fields}}]`);
	return path;
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
		...over,
	};
}

function fakeAssets(dir: string, files: string[]) {
	for (const f of files) {
		const sub = f.startsWith("persona_") ? "persona" : "sprites";
		mkdirSync(join(dir, sub), { recursive: true });
		writeFileSync(join(dir, sub, f), "fake-png-bytes");
	}
}

describe("provenance gate — register", () => {
	it("real register: 25 complete owner entries with locked roles/selection", () => {
		const register = loadRegister(join(ROOT, "assets", "PROVENANCE.yaml"));
		expect(register.entries).toHaveLength(25);
		expect(validateRegister(register, join(ROOT, "assets"))).toEqual([]);
		expect(
			register.entries.find((e: any) => e.file === "persona_1.png"),
		).toMatchObject({
			creator: OWNER,
			"commercial-use": "permitted",
			modification: "permitted",
			"usage-role": "principal-persona",
			selected: true,
		});
		const roles = [
			["persona_3.png", false, "support-avatar"],
			["asset_12_clock.png", true, "sprite-accent"],
		] as const;
		for (const [file, selected, role] of roles) {
			expect(register.entries.find((e: any) => e.file === file)).toMatchObject({
				selected,
				"usage-role": role,
			});
		}
		expect(
			register.entries.filter((e: any) => e["usage-role"] === "sprite-accent"),
		).toHaveLength(14);
		expect(
			register.entries.some((e: any) => e["usage-role"] === "icon-accent"),
		).toBe(false);
		expect(register.entries.filter((e: any) => !e.selected)).toHaveLength(13);
	});

	it("malformed entries are rejected with the failing field named", () => {
		const bad = (
			over: any,
			fragment: string,
			files = ["persona_1.png"],
			version = 1,
		) => {
			const dir = tmp();
			fakeAssets(dir, files);
			const errors = validateRegister(
				loadRegister(writeRegister(dir, baseEntry(over), version)),
				dir,
			);
			expect(
				errors.some((e) => e.includes(fragment)),
				`${errors.join("; ")}`,
			).toBe(true);
		};
		bad({}, "persona_2.png", ["persona_1.png", "persona_2.png"]); // unregistered
		bad({}, "missing on disk", []);
		bad({ modification: undefined }, "modification");
		bad({ creator: "Someone Else" }, "creator");
		bad({ "commercial-use": "restricted" }, "commercial-use");
		bad({ modification: "restricted" }, "modification");
		bad({ license: "unknown" }, "license");
		bad({}, "schema-version", undefined, 2);
	});

	it("external CC0/MIT pass with full fields; proprietary or missing source-url fail", () => {
		const dir = tmp();
		fakeAssets(dir, ["ext.png"]);
		const ext = (over: any = {}) => ({
			file: "ext.png",
			"origin-class": "external",
			license: "CC0",
			creator: "Example Author",
			"commercial-use": "permitted",
			modification: "permitted",
			"usage-role": "sprite-accent",
			"source-url": "https://example.com/ext.png",
			attribution: "Example",
			...over,
		});
		for (const license of ["CC0", "MIT"]) {
			expect(
				validateRegister(
					loadRegister(writeRegister(dir, ext({ license }))),
					dir,
				),
			).toEqual([]);
		}
		expect(
			validateRegister(
				loadRegister(writeRegister(dir, ext({ license: "proprietary" }))),
				dir,
			).some((e) => e.includes("license")),
		).toBe(true);
		const noUrl = ext({ "source-url": undefined });
		expect(
			validateRegister(loadRegister(writeRegister(dir, noUrl)), dir).some((e) =>
				e.includes("source-url"),
			),
		).toBe(true);
	});
});

describe("provenance gate — dist scan", () => {
	it("mockup/asset_sheet/example, original bytes, and audio rejected; clean dist passes", () => {
		const dir = tmp();
		const forbidden = ["mockup_1.png", "asset_sheet_1.png", "example.jpg"];
		for (const f of forbidden) writeFileSync(join(dir, f), "x");
		writeFileSync(join(dir, "index.html"), "x");
		copyFileSync(
			join(ROOT, "assets", "persona", "persona_1.png"),
			join(dir, "persona_1.png"),
		);
		writeFileSync(join(dir, "background.mp3"), "x");
		const h = createHash("sha256")
			.update(readFileSync(join(ROOT, "assets", "persona", "persona_1.png")))
			.digest("hex");
		const originals = new Map([["persona_1.png", h]]);
		const errors = scanDist(dir, originals);
		for (const f of [...forbidden, "persona_1.png", "background.mp3"]) {
			expect(errors.some((e) => e.includes(f))).toBe(true);
		}
		expect(errors.some((e) => e.includes("index.html"))).toBe(false);
		expect(scanDist(join(tmp(), "missing"), new Map())).toEqual([]);
	});
});

describe("provenance gate — sprite canonical path (B3 rename)", () => {
	const spriteEntry = (over: any = {}) =>
		baseEntry({
			file: "asset_04_mariposa_neon.png",
			"usage-role": "sprite-accent",
			...over,
		});

	it("sprite-accent is the accepted accent role; icon-accent is rejected", () => {
		const dir = tmp();
		fakeAssets(dir, ["asset_04_mariposa_neon.png"]);
		expect(
			validateRegister(loadRegister(writeRegister(dir, spriteEntry())), dir),
		).toEqual([]);
		expect(
			validateRegister(
				loadRegister(
					writeRegister(dir, spriteEntry({ "usage-role": "icon-accent" })),
				),
				dir,
			).some((e) => e.includes("unknown usage-role icon-accent")),
		).toBe(true);
	});

	it("assetPath resolves sprite sources under assets/sprites, never assets/icon", () => {
		const p = assetPath(join(ROOT, "assets"), "asset_04_mariposa_neon.png");
		expect(p).toBe(
			join(ROOT, "assets", "sprites", "asset_04_mariposa_neon.png"),
		);
		expect(p).not.toContain("icon");
	});

	it("assets/icon presence fails the gate as dir, file, or symlink; absence passes", () => {
		const dir = tmp();
		fakeAssets(dir, ["asset_04_mariposa_neon.png"]);
		const register = loadRegister(writeRegister(dir, spriteEntry()));
		expect(validateRegister(register, dir)).toEqual([]);
		const mkOld = (kind: "dir" | "file" | "symlink") => {
			const old = join(dir, "icon");
			rmSync(old, { recursive: true, force: true });
			if (kind === "dir") mkdirSync(old);
			else if (kind === "file") writeFileSync(old, "x");
			else symlinkSync(join(dir, "sprites"), old, "dir");
		};
		for (const kind of ["dir", "file", "symlink"] as const) {
			mkOld(kind);
			expect(
				validateRegister(register, dir).some((e) => e.includes("assets/icon")),
				`${kind} presence must fail the gate`,
			).toBe(true);
		}
		rmSync(join(dir, "icon"), { recursive: true, force: true });
	});
});
