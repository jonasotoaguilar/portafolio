import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    date: z.date(),
    image: z.string().optional(),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/experience" }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    description: z.string(),
    url: z.string().url().optional(),
  }),
});

export const collections = { projects, experience };
