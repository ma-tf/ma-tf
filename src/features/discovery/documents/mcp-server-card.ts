import { mcpPath, siteUrl } from "@features/discovery/catalog";
import { serverInstructions, serverVersion } from "@features/mcp/identity";

export const serverCardName = "tf.m4t/mcp";

export function buildMcpServerCard() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: serverCardName,
    version: serverVersion,
    kind: "docs",
    description: "Answers questions from the content published on m4t.tf.",
    icon: `${siteUrl}/favicon.png`,
    url: `${siteUrl}${mcpPath}`,
    serverUrl: `${siteUrl}${mcpPath}`,
    transport: "streamable-http",
    protocolVersion: "2026-07-28",
    remotes: [{ type: "streamable-http", url: `${siteUrl}${mcpPath}` }],
    instructions: serverInstructions,
    capabilities: { tools: true, resources: true },
  };
}
