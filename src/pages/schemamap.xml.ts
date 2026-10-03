import type { APIRoute } from "astro";

import { buildSchemaMap } from "@features/discovery/documents/schemamap";

export const GET = (async () => {
  const body = buildSchemaMap();

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}) satisfies APIRoute;
