// Content collections: projects (glob), skills/siteConfig/resume (file loaders).
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";

import {
	projectSchema,
	resumeSchema,
	siteConfigSchema,
	skillsSchema,
} from "./lib/content/schemas";

const projects = defineCollection({
	loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
	schema: projectSchema,
});

const skills = defineCollection({
	loader: file("src/content/skills.yaml"),
	schema: skillsSchema,
});

const siteConfig = defineCollection({
	loader: file("src/content/site.config.yaml"),
	schema: siteConfigSchema,
});

const resume = defineCollection({
	loader: file("src/content/resume.yaml"),
	schema: resumeSchema,
});

export const collections = {
	projects,
	skills,
	siteConfig,
	resume,
};

export { projectSchema, resumeSchema, siteConfigSchema, skillsSchema };
