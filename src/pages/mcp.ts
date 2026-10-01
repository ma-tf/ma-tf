import type { APIRoute } from "astro";

import { handleMcp } from "@features/mcp/handle-mcp";
import { askEnabled } from "@lib/feature-flags";

export const POST = (({ request }) =>
  askEnabled ? handleMcp(request) : new Response(null, { status: 404 })) satisfies APIRoute;

export const ALL = (() =>
  new Response(null, { status: 405, headers: { Allow: "POST" } })) satisfies APIRoute;
