import { mcpPath, siteUrl } from "@features/discovery/catalog";

export function buildMcpManifest() {
  return {
    mcp_version: "2026-07-28",
    endpoints: [
      {
        url: `${siteUrl}${mcpPath}`,
        transport: "streamable-http",
        capabilities: ["tools", "resources"],
      },
    ],
    serverCard: `${siteUrl}/.well-known/mcp/server-card.json`,
  };
}
