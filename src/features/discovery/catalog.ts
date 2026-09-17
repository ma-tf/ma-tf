export const siteUrl = "https://m4t.tf";

export type DiscoveryResource = {
  path: string;
  type: string;
  title: string;
  description: string;
  rel?: string;
  identifier: string;
  tags: readonly string[];
  representativeQueries: readonly string[];
};

export const resources: readonly DiscoveryResource[] = [
  {
    path: "/llms.txt",
    type: "text/plain",
    title: "Agent site guide",
    description: "A guide to the site and when agents should use it.",
    rel: "describedby",
    identifier: "urn:air:m4t.tf:guide:llms",
    tags: ["llms", "guide", "identity"],
    representativeQueries: [
      "Who is Matt F?",
      "What is m4t.tf and when should I use it?",
      "Which pages does m4t.tf publish?",
    ],
  },
  {
    path: "/llms-full.txt",
    type: "text/plain",
    title: "Full content archive",
    description: "The published-content archive for agent retrieval.",
    identifier: "urn:air:m4t.tf:archive:content",
    tags: ["archive", "blog", "content"],
    representativeQueries: [
      "Give me the full text of Matt F's blog.",
      "What has Matt F written about?",
      "Summarise Matt F's published content.",
    ],
  },
  {
    path: "/openapi.json",
    type: "application/vnd.oai.openapi+json;version=3.1",
    title: "OpenAPI document",
    description: "This machine-readable resource catalogue.",
    rel: "service-desc",
    identifier: "urn:air:m4t.tf:api:openapi",
    tags: ["openapi", "api", "schema"],
    representativeQueries: [
      "What API endpoints does m4t.tf expose?",
      "Show the OpenAPI schema for m4t.tf.",
      "How do I call the m4t.tf API?",
    ],
  },
  {
    path: "/.well-known/api-catalog",
    type: "application/linkset+json",
    title: "API catalog",
    description: "A machine-readable catalogue of published resources.",
    rel: "api-catalog",
    identifier: "urn:air:m4t.tf:catalog:api",
    tags: ["api", "catalog", "linkset"],
    representativeQueries: [
      "What machine-readable resources does m4t.tf publish?",
      "How do I discover the m4t.tf endpoints?",
      "List the m4t.tf resource catalogue.",
    ],
  },
  {
    path: "/.well-known/ai-catalog.json",
    type: "application/ai-catalog+json",
    title: "AI catalog",
    description: "A machine-readable catalogue of the site's agent-facing capabilities.",
    rel: "ai-catalog",
    identifier: "urn:air:m4t.tf:catalog:ai",
    tags: ["ai", "catalog", "discovery"],
    representativeQueries: [
      "What agent-facing capabilities does m4t.tf expose?",
      "Where is the m4t.tf AI catalog?",
      "How should an AI agent discover m4t.tf?",
    ],
  },
  {
    path: "/rss.xml",
    type: "application/rss+xml",
    title: "Blog RSS feed",
    description: "The feed of published blog posts.",
    identifier: "urn:air:m4t.tf:feed:blog",
    tags: ["rss", "feed", "blog"],
    representativeQueries: [
      "What are the latest blog posts on m4t.tf?",
      "List recent posts from m4t.tf.",
      "How do I subscribe to Matt F's writing?",
    ],
  },
  {
    path: "/robots.txt",
    type: "text/plain",
    title: "Robots exclusion policy",
    description: "Crawler instructions and the sitemap location.",
    identifier: "urn:air:m4t.tf:policy:robots",
    tags: ["robots", "crawler", "policy"],
    representativeQueries: [
      "May I crawl m4t.tf?",
      "What are the crawler rules for m4t.tf?",
      "Where is the m4t.tf sitemap?",
    ],
  },
];

export function isResourcePath(pathname: string): boolean {
  return (
    pathname.startsWith("/.well-known/") || resources.some((resource) => resource.path === pathname)
  );
}

export function resourceByRel(rel: string): DiscoveryResource {
  const resource = resources.find((candidate) => candidate.rel === rel);

  if (!resource) throw new Error(`No discovery resource declares rel="${rel}"`);

  return resource;
}

const serviceDocLink = `<${siteUrl}/developers>; rel="service-doc"; type="text/html"`;

export const linkHeader = [
  serviceDocLink,
  ...resources.flatMap((resource) =>
    resource.rel ? [`<${resource.path}>; rel="${resource.rel}"; type="${resource.type}"`] : [],
  ),
].join(", ");
