import type { DiscoveryResource } from "@features/discovery/catalog";

import { resourceByPath } from "@features/discovery/catalog";
import { describeResource } from "@features/discovery/resource-json";

function buildResourceMarkdown(resource: DiscoveryResource): string {
  const descriptor = describeResource(resource);

  return [
    `# ${descriptor.title}`,
    "",
    descriptor.description,
    "",
    `The canonical resource is served at ${descriptor.url} as \`${descriptor.mediaType}\`.`,
    "This markdown representation summarises it with the details below.",
    "",
    "## Details",
    "",
    `- Canonical URL: ${descriptor.url}`,
    `- Media type: ${descriptor.mediaType}`,
    `- Tags: ${descriptor.tags.join(", ")}`,
    "",
    "## Representative queries",
    "",
    ...descriptor.representativeQueries.map((query) => `- ${query}`),
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
