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

/** Grouped skills: group name -> plain skill names, no levels or metrics. */
export const skillsSchema = z.record(z.string(), z.array(z.string()).min(1));

/** Non-empty collection of `shape` entries (generic keeps zod inference). */
const item = <T extends z.ZodTypeAny>(shape: T) => z.array(shape).min(1);

/**
 * Resume content typed from the verified CV. Strict everywhere so that any
 * unknown key (phone, rank, level, metric, ...) fails the build instead of
 * being silently stripped; skills are plain string names only.
 */
export const resumeSchema = z
	.object({
		education: item(
			z
				.object({
					institution: z.string(),
					title: z.string(),
					period: z.string(),
				})
				.strict(),
		),
		experience: item(
			z
				.object({
					company: z.string(),
					role: z.string(),
					period: z.string(),
					details: z.array(z.string()),
				})
				.strict(),
		),
		projects: item(
			z
				.object({
					name: z.string(),
					published: z.string().optional(),
					description: z.string(),
				})
				.strict(),
		),
		skills: item(z.string()),
		languages: item(
			z.object({ name: z.string(), proficiency: z.string() }).strict(),
		),
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
