import type { APIRoute } from "astro";

import { handleMcp } from "@features/mcp/handle-mcp";
import { askEnabled } from "@lib/feature-flags";
import {
  hostHeaderValidationResponse,
  localhostAllowedHostnames,
  localhostAllowedOrigins,
  originValidationResponse,
} from "@modelcontextprotocol/server";

const allowedHostnames = ["m4t.tf", ...localhostAllowedHostnames()];
const allowedOrigins = ["m4t.tf", ...localhostAllowedOrigins()];

export const POST = (({ request }) => {
  if (!askEnabled) return new Response(null, { status: 404 });

  return (
    hostHeaderValidationResponse(request, allowedHostnames) ??
    originValidationResponse(request, allowedOrigins) ??
    handleMcp(request)
  );
}) satisfies APIRoute;

export const ALL = (() =>
  new Response(null, { status: 405, headers: { Allow: "POST" } })) satisfies APIRoute;
