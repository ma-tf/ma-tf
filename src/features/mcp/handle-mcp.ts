import type {
  Implementation,
  McpServerFactory,
  ResourceMetadata,
  ServerContext,
  ServerOptions,
} from "@modelcontextprotocol/server";

import { askInputSchema, askOutputSchema, askTool, type AskInput } from "@features/mcp/ask";
import {
  askToolAnnotations,
  askToolDescription,
  askToolTitle,
  serverInstructions,
  serverName,
  serverVersion,
} from "@features/mcp/identity";
import { listResources, readResource } from "@features/mcp/read";
import { McpServer, ResourceNotFoundError, createMcpHandler } from "@modelcontextprotocol/server";

const createServer: McpServerFactory = async () => {
  const server = new McpServer(
    { name: serverName, version: serverVersion } satisfies Implementation,
    {
      capabilities: { tools: {}, resources: {} } satisfies ServerOptions["capabilities"],
      instructions: serverInstructions,
      cacheHints: {
        "server/discover": { ttlMs: 3600000, cacheScope: "public" },
        "tools/list": { ttlMs: 3600000, cacheScope: "public" },
        "resources/list": { ttlMs: 3600000, cacheScope: "public" },
        "resources/read": { ttlMs: 3600000, cacheScope: "public" },
      } satisfies ServerOptions["cacheHints"],
    },
  );

  server.registerTool(
    "ask",
    {
      title: askToolTitle,
      description: askToolDescription,
      inputSchema: askInputSchema,
      outputSchema: askOutputSchema,
      annotations: askToolAnnotations,
    },
    async (args: AskInput, ctx: ServerContext) => askTool(args, ctx.mcpReq.signal),
  );

  for (const resource of listResources()) {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        title: resource.title,
        description: resource.description,
        mimeType: resource.mimeType,
        ...(resource.annotations ? { annotations: resource.annotations } : {}),
      } satisfies ResourceMetadata,
      async (uri) => {
        const contents = readResource(uri.href);

        if (!contents) throw new ResourceNotFoundError(uri.href);

        return { contents: [contents] };
      },
    );
  }

  return server;
};

const handler = createMcpHandler(createServer, { legacy: "reject", responseMode: "json" });

export const handleMcp = (request: Request): Promise<Response> => handler.fetch(request);
