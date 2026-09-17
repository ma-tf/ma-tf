import type { DiscoveryResource } from "@features/discovery/catalog";

import { resourceByPath, siteUrl } from "@features/discovery/catalog";

function buildResourceMarkdown(resource: DiscoveryResource): string {
  return [
    `# ${resource.title}`,
    "",
    resource.description,
    "",
    `The canonical resource is served at ${siteUrl}${resource.path} as \`${resource.type}\`.`,
    "This markdown representation summarises it with the details below.",
    "",
    "## Details",
    "",
    `- Canonical URL: ${siteUrl}${resource.path}`,
    `- Media type: ${resource.type}`,
    `- Tags: ${resource.tags.join(", ")}`,
    "",
    "## Representative queries",
    "",
    ...resource.representativeQueries.map((query) => `- ${query}`),
    "",
  ].join("\n");
}

export function resourceMarkdownResponse(pathname: string): Response | undefined {
  const resource = resourceByPath(pathname);
  if (!resource) return undefined;

  return new Response(buildResourceMarkdown(resource), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
