import type { APIRoute } from "astro";

import { buildMcpManifest } from "@features/discovery/documents/mcp-manifest";
import { askEnabled } from "@lib/feature-flags";

export const GET = (() =>
  askEnabled
    ? Response.json(buildMcpManifest(), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "X-Content-Type-Options": "nosniff",
        },
      })
    : new Response(null, { status: 404 })) satisfies APIRoute;
