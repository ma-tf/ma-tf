import type { APIRoute } from "astro";

import { handleMcp } from "@features/mcp/handle-mcp";
import { askEnabled } from "@lib/feature-flags";
import { enrich } from "@lib/wide-event";
import {
  hostHeaderValidationResponse,
  localhostAllowedHostnames,
  localhostAllowedOrigins,
  originValidationResponse,
} from "@modelcontextprotocol/server";

const allowedHostnames = ["m4t.tf", ...localhostAllowedHostnames()];
const allowedOrigins = ["m4t.tf", ...localhostAllowedOrigins()];

export const POST = (({ request }) => {
  enrich({
    mcp: {
      method: request.headers.get("Mcp-Method") ?? undefined,
      name: request.headers.get("Mcp-Name") ?? undefined,
    },
  });

  if (!askEnabled) return new Response(null, { status: 404 });

  return (
    hostHeaderValidationResponse(request, allowedHostnames) ??
    originValidationResponse(request, allowedOrigins) ??
    handleMcp(request)
  );
}) satisfies APIRoute;

export const ALL = (() =>
  new Response(null, { status: 405, headers: { Allow: "POST" } })) satisfies APIRoute;
