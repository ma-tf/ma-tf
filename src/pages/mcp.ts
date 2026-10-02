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

export const POST = (async ({ request }) => {
  if (!askEnabled) return new Response(null, { status: 404 });

  const rejection =
    hostHeaderValidationResponse(request, allowedHostnames) ??
    originValidationResponse(request, allowedOrigins);

  if (rejection) return rejection;

  let parsedBody;

  try {
    parsedBody = await request.json();
  } catch {
    parsedBody = undefined;
  }

  return handleMcp(request, { parsedBody });
}) satisfies APIRoute;

export const ALL = (() =>
  new Response(null, { status: 405, headers: { Allow: "POST" } })) satisfies APIRoute;
