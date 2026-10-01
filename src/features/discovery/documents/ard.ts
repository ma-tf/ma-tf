import profile from "@content/profile.json";
import { resources, siteUrl } from "@features/discovery/catalog";

const mcpServerEntry = {
  identifier: "urn:air:m4t.tf:server:mcp",
  displayName: "m4t.tf MCP server",
  type: "application/mcp-server-card+json",
  url: `${siteUrl}/mcp`,
  description: "Ask questions answered from the content published on m4t.tf.",
  tags: ["ask", "site-content"],
  capabilities: ["ask"],
  representativeQueries: [
    "What has Matt written about <topic>?",
    "Who is Matt Fehrenbach?",
    "What has Matt worked on?",
  ],
};

export function buildArd() {
  return {
    specVersion: "1.0",
    host: {
      displayName: profile.name,
      identifier: "did:web:m4t.tf",
      documentationUrl: `${siteUrl}/developers`,
    },
    entries: [
      ...resources.map((resource) => ({
        identifier: resource.identifier,
        type: resource.type,
        url: `${siteUrl}${resource.path}`,
        displayName: resource.title,
        description: resource.description,
        tags: [...resource.tags],
        representativeQueries: [...resource.representativeQueries],
      })),
      mcpServerEntry,
    ],
  };
}
