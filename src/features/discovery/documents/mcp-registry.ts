import { mcpPath, siteUrl } from "@features/discovery/catalog";
import { serverVersion } from "@features/mcp/identity";

export function buildMcpRegistryServer() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
    name: "tf.m4t/mcp",
    title: "m4t.tf MCP server",
    description: "Answers questions from the content published on m4t.tf.",
    version: serverVersion,
    websiteUrl: `${siteUrl}/developers`,
    remotes: [{ type: "streamable-http", url: `${siteUrl}${mcpPath}` }],
  };
}
