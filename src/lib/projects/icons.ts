// Technology icons for the PROJECTS black band (projects contract): every
// stack entry renders as its developer-icons component — the official
// package's brand glyphs, SSR React markup with NO client directive (static
// HTML, zero hydrated islands). Keys are normalized stack entries
// (versions/suffixes stripped, e.g. "Next.js 16" -> "next-js"; "Python
// 3.12" -> "python").
//
// Only VERIFIED distinct package exports are mapped: a stack name without a
// package export gets NO glyph at all — its name stays available to screen
// readers (the tech row's sr-only text) but no generic fallback shape is
// rendered, so unsupported technologies never pretend to be distinct icons
// by repeating the same fallback glyph. Repeated icon components within one
// project (e.g. "Docker" and "Docker Compose") are deduped into a single
// glyph whose sr-only text lists every stack name it covers.
//
// The generic DeveloperIcons export is deliberately NOT a fallback here.

import {
	Appwrite,
	BunJs,
	CSharp,
	Docker,
	FastAPI,
	JavaScript,
	NextJs,
	NodeJs,
	PostgreSQL,
	Python,
	React,
	Redis,
	RustLight,
	Supabase,
	TailwindCSS,
	TypeScript,
	Zod,
} from "developer-icons";

/** One developer-icons brand component (the shared export shape). */
export type TechIcon = typeof TypeScript;

/** Verified distinct brand exports, keyed by normalized stack name. */
export const TECH_ICONS: Record<string, TechIcon> = {
	"next-js": NextJs,
	typescript: TypeScript,
	react: React,
	"tailwind-css": TailwindCSS,
	appwrite: Appwrite,
	docker: Docker,
	// Docker Compose is part of the Docker toolchain: the real Docker brand
	// glyph, never a look-alike.
	"docker-compose": Docker,
	javascript: JavaScript,
	python: Python,
	fastapi: FastAPI,
	"c#": CSharp,
	bun: BunJs,
	"node-js": NodeJs,
	supabase: Supabase,
	zod: Zod,
	// Light glyph: the tech row sits on the black band.
	rust: RustLight,
	redis: Redis,
	// pgvector is a PostgreSQL extension: the actual Postgres brand glyph.
	postgresql: PostgreSQL,
};

/**
 * Verified brand glyphs that are DARK and would vanish on the black band
 * (NextJs is near-black, Zod is deep navy, C# is deep purple — all fail
 * ~3:1 against `--color-bg-base`). These keep the library's exact shape
 * and get the smallest route-scoped presentation fix: a CSS filter that
 * re-renders them as white silhouettes (the same visual voice as the
 * RustLight glyph already mapped for the black band). Never a replaced or
 * invented glyph.
 */
export const TECH_ICONS_DARK: ReadonlySet<TechIcon> = new Set<TechIcon>([
	NextJs,
	Zod,
	CSharp,
]);

/**
 * Normalizes a declared stack name to its map key: lowercase, trailing
 * version numbers stripped FIRST (so dotted versions like "Python 3.12"
 * reduce cleanly before separators become dashes), then separators to
 * dashes and dangling dashes removed ("Next.js 16" -> "next-js",
 * "Python 3.12" -> "python", "C#" -> "c#").
 */
export function techIconKey(tech: string): string {
	return tech
		.toLowerCase()
		.replace(/(?:-?\s*v?)?\d+(?:\.\d+)*$/, "")
		.replace(/[\s.,/]+/g, "-")
		.replace(/-+$/, "");
}

/**
 * One rendered tech glyph: a verified distinct icon (or null when the stack
 * name has no package export) plus every stack name it covers. The names
 * feed the sr-only text and the item's aria-label.
 */
export interface TechGlyph {
	icon: TechIcon | null;
	names: string[];
}

/**
 * Groups a project's stack into renderable glyphs, preserving stack order:
 * the first occurrence of a name creates its glyph; later names sharing the
 * same icon component (or the same "no icon" state) join that glyph's names
 * instead of rendering a repeated visual.
 */
export function techGlyphs(stack: readonly string[]): TechGlyph[] {
	const glyphs: TechGlyph[] = [];
	for (const tech of stack) {
		const icon = TECH_ICONS[techIconKey(tech)] ?? null;
		const existing = glyphs.find((glyph) => glyph.icon === icon);
		if (existing) {
			existing.names.push(tech);
		} else {
			glyphs.push({ icon, names: [tech] });
		}
	}
	return glyphs;
}

/** A glyph that actually renders an icon (never a null-icon group). */
export type VisibleTechGlyph = TechGlyph & { icon: TechIcon };

/**
 * The visible technology row (projects contract): only glyphs backed by a
 * real developer-icons component render on the black band — a null-icon
 * group (an unsupported stack name) produces NO `<li>`, so unsupported
 * technologies never leave an empty gap. The full stack stays accessible
 * through the row's aria-label (the page composes it from every declared
 * name) and the sr-only text on each rendered glyph.
 */
export function visibleTechGlyphs(
	stack: readonly string[],
): VisibleTechGlyph[] {
	return techGlyphs(stack).filter(
		(glyph): glyph is VisibleTechGlyph => glyph.icon !== null,
	);
}
