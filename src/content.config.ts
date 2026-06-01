import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    liveUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
    thesisUrl: z.string().url().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    date: z.date(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

export const collections = { projects };
