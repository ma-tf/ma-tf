import profile from "@content/profile.json";
import { askEnabled } from "@lib/feature-flags";

export const siteUrl = "https://m4t.tf";

export const mcpPath = "/mcp";

export const schemaMapPath = "/schemamap.xml";

export const registryServerPath = "/server.json";

export const aiCatalogPath = "/.well-known/ai-catalog.json";

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

const primaryResources: readonly DiscoveryResource[] = [
  {
    path: "/llms.txt",
    type: "text/plain",
    title: "Agent site guide",
    description: "A guide to the site and when agents should use it.",
    rel: "describedby",
    identifier: "urn:air:m4t.tf:guide:llms",
    tags: ["llms", "guide", "identity"],
    representativeQueries: [
      `Who is ${profile.name}?`,
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
      `Give me the full text of ${profile.name}'s blog.`,
      `What has ${profile.name} written about?`,
      `Summarise ${profile.name}'s published content.`,
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
    path: "/.well-known/ard.json",
    type: "application/ard+json",
    title: "ARD catalogue",
    description: "The ARD manifest of the site's agent-facing resources.",
    rel: "ard",
    identifier: "urn:air:m4t.tf:catalog:ard",
    tags: ["ard", "catalog", "discovery"],
    representativeQueries: [
      "What agent-facing resources does m4t.tf expose?",
      "Where is the m4t.tf ARD catalogue?",
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
      `How do I subscribe to ${profile.name}'s writing?`,
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
  {
    path: "/sitemap.xml",
    type: "application/xml",
    title: "Sitemap",
    description: "The indexable site pages.",
    identifier: "urn:air:m4t.tf:index:sitemap",
    tags: ["sitemap", "index", "pages"],
    representativeQueries: [
      "Which pages does m4t.tf publish?",
      "Give me the list of indexable m4t.tf pages.",
      "Where is the m4t.tf sitemap?",
    ],
  },
  {
    path: schemaMapPath,
    type: "application/xml",
    title: "Schema map",
    description: "The schema.org structured-data feeds the site publishes for agents.",
    identifier: "urn:air:m4t.tf:index:schemamap",
    tags: ["schemamap", "schema", "feeds"],
    representativeQueries: [
      "Which structured-data feeds does m4t.tf publish?",
      "Where is the m4t.tf schema map?",
      "How do I discover m4t.tf content as structured data?",
    ],
  },
  {
    path: "/.well-known/agent-skills/index.json",
    type: "application/json",
    title: "Agent Skills index",
    description: "The Agent Skills the site publishes for agents.",
    rel: "agent-skills",
    identifier: "urn:air:m4t.tf:catalog:agent-skills",
    tags: ["agent-skills", "skills", "discovery"],
    representativeQueries: [
      "What agent skills does m4t.tf publish?",
      "How should an agent work with m4t.tf?",
      "Where is the m4t.tf Agent Skills index?",
    ],
  },
  {
    path: registryServerPath,
    type: "application/json",
    title: "MCP registry manifest",
    description: "The registry manifest for the m4t.tf server.",
    identifier: "urn:air:m4t.tf:server:registry",
    tags: ["mcp", "registry", "manifest", "server"],
    representativeQueries: [
      "Where is the m4t.tf server manifest?",
      "How do I register the m4t.tf server?",
      "What transport does the m4t.tf server use?",
    ],
  },
  {
    path: aiCatalogPath,
    type: "application/json",
    title: "AI catalog",
    description: "The AI catalogue of the site's agent-facing resources.",
    identifier: "urn:air:m4t.tf:catalog:ai",
    tags: ["ai-catalog", "catalog", "discovery"],
    representativeQueries: [
      "What agent-facing resources does m4t.tf publish?",
      "Where is the m4t.tf AI catalogue?",
      "How do I discover the m4t.tf resources?",
    ],
  },
];

export const sectionGuides: readonly DiscoveryResource[] = [
  {
    path: "/blog/llms.txt",
    type: "text/plain",
    title: "Blog section guide",
    description: "An index of the published posts and tags for agents working on the writing.",
    identifier: "urn:air:m4t.tf:guide:blog",
    tags: ["llms", "guide", "blog", "writing"],
    representativeQueries: [
      `What has ${profile.name} written about?`,
      "List the m4t.tf blog posts.",
      "Which tags does the m4t.tf blog use?",
    ],
  },
  {
    path: "/developers/llms.txt",
    type: "text/plain",
    title: "Developers section guide",
    description: "A scoped guide to the machine-readable surface and how to retrieve it.",
    identifier: "urn:air:m4t.tf:guide:developers",
    tags: ["llms", "guide", "developers", "api"],
    representativeQueries: [
      "How do I retrieve content from m4t.tf?",
      "What resources does m4t.tf publish for agents?",
      "How do m4t.tf errors and versioning work?",
    ],
  },
  {
    path: "/cv/llms.txt",
    type: "text/plain",
    title: "CV section guide",
    description: "A scoped guide to the professional profile for agents fact-checking claims.",
    identifier: "urn:air:m4t.tf:guide:cv",
    tags: ["llms", "guide", "cv", "profile"],
    representativeQueries: [
      `What experience does ${profile.name} have?`,
      `Which pages verify claims about ${profile.name}?`,
      "How do I cite m4t.tf for hiring or recruiting?",
    ],
  },
  {
    path: "/api/llms.txt",
    type: "text/plain",
    title: "API section guide",
    description: "A scoped guide to the HTTP interface for agents calling the site.",
    identifier: "urn:air:m4t.tf:guide:api",
    tags: ["llms", "guide", "api", "developers"],
    representativeQueries: [
      "How do I call the m4t.tf API?",
      "How does the m4t.tf API handle errors and versioning?",
      "What are the m4t.tf API rate limits?",
    ],
  },
];

export const resources: readonly DiscoveryResource[] = [...primaryResources, ...sectionGuides];

export function isSectionGuide(resource: DiscoveryResource): boolean {
  return sectionGuides.some((guide) => guide.path === resource.path);
}

export function isResourcePath(pathname: string): boolean {
  return (
    pathname.startsWith("/.well-known/") || resources.some((resource) => resource.path === pathname)
  );
}

export function isJsonMediaType(type: string): boolean {
  const mediaType = type.split(";", 1)[0]?.trim().toLowerCase() ?? "";

  return mediaType === "application/json" || mediaType.endsWith("+json");
}

export function resourceByPath(pathname: string): DiscoveryResource | undefined {
  return resources.find((resource) => resource.path === pathname);
}

export function resourceByRel(rel: string): DiscoveryResource {
  const resource = resources.find((candidate) => candidate.rel === rel);

  if (!resource) throw new Error(`No discovery resource declares rel="${rel}"`);

  return resource;
}

const serviceDocLink = `<${siteUrl}/developers>; rel="service-doc"; type="text/html"`;
const mcpLink = `<${mcpPath}>; rel="mcp"`;

export const linkHeader = [
  serviceDocLink,
  ...resources.flatMap((resource) =>
    resource.rel ? [`<${resource.path}>; rel="${resource.rel}"; type="${resource.type}"`] : [],
  ),
  ...(askEnabled ? [mcpLink] : []),
].join(", ");
