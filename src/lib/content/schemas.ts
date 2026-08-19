import { z } from "astro/zod";

/** Schema for one portfolio project entry (Markdown frontmatter). */
export const projectSchema = z.object({
	title: z.string(),
	description: z.string(),
	stack: z.array(z.string()).min(1),
	link: z.url(),
	/** Declared content semantics; off-site link behavior is derived from the URL. */
	external: z.boolean().default(false),
	order: z.number().int(),
});

/**
 * One skill entry: explicit editable name + rank on the 1..4 scale
 * (1 basic, 2 intermediate, 3 advanced, 4 expert). Strict so unknown keys
 * (levels, metrics, ...) fail the build instead of being silently stripped.
 */
const skillEntrySchema = z
	.object({
		name: z.string().min(1),
		rank: z.number().int().min(1).max(4),
	})
	.strict();

/** Grouped skills: category (group key) -> ranked skill entries. */
export const skillsSchema = z.record(
	z.string(),
	z.array(skillEntrySchema).min(1),
);

/** Non-empty collection of `shape` entries (generic keeps zod inference). */
const item = <T extends z.ZodTypeAny>(shape: T) => z.array(shape).min(1);

/**
 * Resume content typed from the verified CV, English-only for the RESUME
 * view: the degree, professional experience with selectable descriptions,
 * and the professional summary. Projects and skills have their own views
 * and never render here, so the collection must not carry them. Strict
 * everywhere so that any unknown key (phone, rank, level, metric, project,
 * skill, ...) fails the build instead of being silently stripped.
 */
export const resumeSchema = z
	.object({
		degree: z
			.object({
				institution: z.string(),
				title: z.string(),
				period: z.string(),
			})
			.strict(),
		experience: item(
			z
				.object({
					company: z.string(),
					role: z.string(),
					period: z.string(),
					description: z.string(),
				})
				.strict(),
		),
		summary: z.string(),
	})
	.strict();

/** Single site config consumed by the page shell and sections. */
export const siteConfigSchema = z.object({
	name: z.string(),
	role: z.string(),
	tagline: z.string(),
	focusAreas: z.array(z.string()).min(1),
	email: z.email(),
	socials: z.object({
		github: z.url(),
		wealthquest: z.url(),
	}),
	pageTitle: z.string(),
});

export type Project = z.infer<typeof projectSchema>;
export type Resume = z.infer<typeof resumeSchema>;
export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type Skills = z.infer<typeof skillsSchema>;
