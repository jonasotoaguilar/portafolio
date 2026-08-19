import { DeveloperIcons } from "developer-icons";
import { describe, expect, it } from "vitest";

import {
	TECH_ICONS,
	TECH_ICONS_DARK,
	techGlyphs,
	techIconKey,
	visibleTechGlyphs,
} from "../../src/lib/projects/icons";

// Technology icons (projects contract): only VERIFIED distinct
// developer-icons exports map to stack names; a stack name without an
// export gets NO glyph (sr-only name only), and repeated icon components
// within one project dedupe into a single glyph. The generic
// DeveloperIcons export is never a fallback.

describe("techIconKey", () => {
	it("normalizes case and separators", () => {
		expect(techIconKey("Next.js 16")).toBe("next-js");
		expect(techIconKey("Tailwind CSS v4")).toBe("tailwind-css");
		expect(techIconKey("Docker Compose")).toBe("docker-compose");
		expect(techIconKey("OpenCode TUI")).toBe("opencode-tui");
	});

	it("strips trailing version numbers", () => {
		expect(techIconKey("Python 3.12")).toBe("python");
		expect(techIconKey("Python 3.13")).toBe("python");
		expect(techIconKey("Rust 2024")).toBe("rust");
		expect(techIconKey("SQLAlchemy 2")).toBe("sqlalchemy");
		expect(techIconKey("NativeWind 5")).toBe("nativewind");
		expect(techIconKey("React 19")).toBe("react");
	});

	it("keeps C# intact", () => {
		expect(techIconKey("C#")).toBe("c#");
	});
});

describe("TECH_ICONS", () => {
	it("never uses the generic DeveloperIcons export as a glyph", () => {
		for (const icon of Object.values(TECH_ICONS)) {
			expect(icon).not.toBe(DeveloperIcons);
		}
	});

	it("maps every stack the four original projects declare", () => {
		expect(TECH_ICONS["next-js"]).toBeDefined();
		expect(TECH_ICONS.typescript).toBeDefined();
		expect(TECH_ICONS.react).toBeDefined();
		expect(TECH_ICONS["tailwind-css"]).toBeDefined();
		expect(TECH_ICONS.appwrite).toBeDefined();
		expect(TECH_ICONS.docker).toBeDefined();
		expect(TECH_ICONS.javascript).toBeDefined();
		expect(TECH_ICONS.python).toBeDefined();
		expect(TECH_ICONS.fastapi).toBeDefined();
		expect(TECH_ICONS["c#"]).toBeDefined();
	});

	it("provides distinct icons for the new projects' supported stacks", () => {
		expect(TECH_ICONS.bun).toBeDefined();
		expect(TECH_ICONS["node-js"]).toBeDefined();
		expect(TECH_ICONS.supabase).toBeDefined();
		expect(TECH_ICONS.zod).toBeDefined();
		expect(TECH_ICONS.rust).toBeDefined();
		expect(TECH_ICONS.redis).toBeDefined();
		expect(TECH_ICONS.postgresql).toBeDefined();
	});
});

describe("techGlyphs", () => {
	it("maps every supported stack entry to a distinct verified icon", () => {
		const glyphs = techGlyphs(["TypeScript", "Bun", "Node.js", "FastAPI"]);
		const icons = glyphs.map((glyph) => glyph.icon);
		expect(icons).toEqual([
			TECH_ICONS.typescript,
			TECH_ICONS.bun,
			TECH_ICONS["node-js"],
			TECH_ICONS.fastapi,
		]);
		expect(glyphs.every((glyph) => glyph.icon !== null)).toBe(true);
	});

	it("dedupes repeated icon components into one glyph with all names", () => {
		const glyphs = techGlyphs(["Docker", "Docker Compose", "TypeScript"]);
		expect(glyphs).toHaveLength(2);
		const docker = glyphs.find((glyph) => glyph.icon === TECH_ICONS.docker);
		expect(docker?.names).toEqual(["Docker", "Docker Compose"]);
	});

	it("groups unsupported stack names with a null icon, never a fallback glyph", () => {
		const glyphs = techGlyphs(["Unity", "C#"]);
		expect(glyphs).toHaveLength(2);
		expect(glyphs[0]).toEqual({ icon: null, names: ["Unity"] });
		expect(glyphs[1].icon).toBe(TECH_ICONS["c#"]);
	});

	it("dedupes unsupported names into a single sr-only group", () => {
		const glyphs = techGlyphs([
			"Expo",
			"React Native",
			"NativeWind 5",
			"Supabase",
		]);
		expect(glyphs).toHaveLength(2);
		expect(glyphs[0]).toEqual({
			icon: null,
			names: ["Expo", "React Native", "NativeWind 5"],
		});
		expect(glyphs[1].icon).toBe(TECH_ICONS.supabase);
	});

	it("keeps stack order for the first occurrence of each glyph", () => {
		const glyphs = techGlyphs([
			"Python 3.13",
			"FastAPI",
			"SQLAlchemy 2",
			"Redis",
			"Docker",
		]);
		expect(glyphs.map((glyph) => glyph.names[0])).toEqual([
			"Python 3.13",
			"FastAPI",
			"SQLAlchemy 2",
			"Redis",
			"Docker",
		]);
	});

	it("renders nothing for an empty stack", () => {
		expect(techGlyphs([])).toEqual([]);
	});
});

describe("TECH_ICONS_DARK", () => {
	it("only lists verified exports that are actually dark on the black band", () => {
		expect(TECH_ICONS_DARK.size).toBeGreaterThan(0);
		for (const icon of TECH_ICONS_DARK) {
			// Every dark entry is a real mapped glyph, never the generic fallback.
			expect(Object.values(TECH_ICONS)).toContain(icon);
			expect(icon).not.toBe(DeveloperIcons);
		}
	});

	it("covers the dark marks used by the shipped projects (Next.js, C#, Zod)", () => {
		expect(TECH_ICONS_DARK.has(TECH_ICONS["next-js"])).toBe(true);
		expect(TECH_ICONS_DARK.has(TECH_ICONS["c#"])).toBe(true);
		expect(TECH_ICONS_DARK.has(TECH_ICONS.zod)).toBe(true);
	});
});

describe("visibleTechGlyphs", () => {
	it("drops unsupported stack names (no empty <li> slot) and keeps every real icon", () => {
		const glyphs = visibleTechGlyphs(["Unity", "C#", "OSV"]);
		expect(glyphs).toHaveLength(1);
		expect(glyphs[0].icon).toBe(TECH_ICONS["c#"]);
		expect(glyphs[0].names).toEqual(["C#"]);
	});

	it("preserves the distinct-icon dedupe for supported entries", () => {
		const glyphs = visibleTechGlyphs([
			"Unity",
			"Docker",
			"Docker Compose",
			"TypeScript",
		]);
		expect(glyphs).toHaveLength(2);
		expect(glyphs[0].icon).toBe(TECH_ICONS.docker);
		expect(glyphs[0].names).toEqual(["Docker", "Docker Compose"]);
		expect(glyphs[1].icon).toBe(TECH_ICONS.typescript);
	});

	it("renders nothing when no supported technology is declared", () => {
		expect(visibleTechGlyphs(["Unity", "OSV"])).toEqual([]);
	});

	it("keeps stack order for the first occurrence of each rendered glyph", () => {
		const glyphs = visibleTechGlyphs([
			"Python 3.13",
			"uv",
			"FastAPI",
			"pgvector",
			"Redis",
		]);
		expect(glyphs.map((glyph) => glyph.names[0])).toEqual([
			"Python 3.13",
			"FastAPI",
			"Redis",
		]);
	});
});
