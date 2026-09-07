export const siteUrl = "https://m4t.tf";

export const resources = [
  {
    path: "/llms.txt",
    type: "text/plain",
    title: "Agent site guide",
    description: "A guide to the site and when agents should use it.",
  },
  {
    path: "/llms-full.txt",
    type: "text/plain",
    title: "Full content archive",
    description: "The published-content archive for agent retrieval.",
  },
  {
    path: "/openapi.json",
    type: "application/vnd.oai.openapi+json;version=3.1",
    title: "OpenAPI document",
    description: "This machine-readable resource catalogue.",
  },
  {
    path: "/.well-known/api-catalog",
    type: "application/linkset+json",
    title: "API catalog",
    description: "A machine-readable catalogue of published resources.",
  },
  {
    path: "/rss.xml",
    type: "application/rss+xml",
    title: "Blog RSS feed",
    description: "The feed of published blog posts.",
  },
] as const;
