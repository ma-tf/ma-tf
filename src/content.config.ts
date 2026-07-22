import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const experience = defineCollection({
  loader: glob({ base: "./src/content/experience", pattern: "**/*.md" }),
  schema: z.object({
    company: z.string(),
    position: z.string(),
    location: z.string(),
    start: z.coerce.date(),
    finish: z.coerce.date().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
  schema: z.object({
    name: z.string(),
  }),
});

const education = defineCollection({
  loader: glob({ base: "./src/content/education", pattern: "**/*.md" }),
  schema: z.object({
    institution: z.string(),
    location: z.string(),
    start: z.coerce.date(),
    finish: z.coerce.date(),
  }),
});

export const collections = { experience, projects, education };
