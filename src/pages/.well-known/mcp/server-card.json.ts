import type { APIRoute } from "astro";

import { buildMcpServerCard } from "@features/discovery/documents/mcp-server-card";
import { askEnabled } from "@lib/feature-flags";

export const GET = (() =>
  askEnabled
    ? Response.json(buildMcpServerCard(), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      })
    : new Response(null, { status: 404 })) satisfies APIRoute;
