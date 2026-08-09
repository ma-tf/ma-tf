import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    pubDate: z.coerce.date(),
    description: z.string(),
    author: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});

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
    title: z.string(),
    url: z.string(),
    topics: z.array(z.string()),
  }),
});

const education = defineCollection({
  loader: glob({ base: "./src/content/education", pattern: "**/*.md" }),
  schema: z.object({
    institution: z.string(),
    location: z.string(),
    start: z.coerce.date(),
    finish: z.coerce.date(),
    courses: z.array(
      z.object({
        name: z.string(),
        grade: z.string().optional(),
      }),
    ),
  }),
});

const photography = defineCollection({
  loader: glob({ base: "./src/content/photography", pattern: "**/*.md" }),
  schema: z.object({
    image: z.string(),
    camera: z.string(),
    film: z.string().optional(),
    column: z.number().min(1).max(3),
    order: z.number(),
  }),
});

export const collections = { blog, experience, projects, education, photography };
