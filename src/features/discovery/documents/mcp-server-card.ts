import { mcpPath, siteUrl } from "@features/discovery/catalog";
import { askInputSchema } from "@features/mcp/ask";
import {
  askToolAnnotations,
  askToolDescription,
  askToolTitle,
  serverInstructions,
  serverName,
  serverVersion,
} from "@features/mcp/identity";

const askInputJsonSchema = {
  type: "object",
  ...askInputSchema["~standard"].jsonSchema.input({ target: "draft-2020-12" }),
};

export function buildMcpServerCard() {
  return {
    name: serverName,
    version: serverVersion,
    kind: "docs",
    description: "Answers questions from the content published on m4t.tf.",
    icon: `${siteUrl}/favicon.png`,
    url: `${siteUrl}${mcpPath}`,
    serverUrl: `${siteUrl}${mcpPath}`,
    transport: "streamable-http",
    protocolVersion: "2026-07-28",
    instructions: serverInstructions,
    capabilities: { tools: true, resources: true },
    tools: [
      {
        name: "ask",
        title: askToolTitle,
        description: askToolDescription,
        inputSchema: askInputJsonSchema,
        annotations: askToolAnnotations,
      },
    ],
  };
}
