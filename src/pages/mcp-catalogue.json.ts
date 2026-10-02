import type { APIRoute } from "astro";

import { listResourceMetadata } from "@features/mcp/catalogue";

export const GET = (async () => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });

  return Response.json({ resources: await listResourceMetadata() });
}) satisfies APIRoute;
