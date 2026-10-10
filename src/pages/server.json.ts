import type { APIRoute } from "astro";

import { buildMcpRegistryServer } from "@features/discovery/documents/mcp-registry";
import { askEnabled } from "@lib/feature-flags";

export const GET = (() =>
  askEnabled
    ? Response.json(buildMcpRegistryServer(), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "X-Content-Type-Options": "nosniff",
        },
      })
    : new Response(null, { status: 404 })) satisfies APIRoute;
