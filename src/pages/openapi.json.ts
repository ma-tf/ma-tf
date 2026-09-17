import type { APIRoute } from "astro";

import { buildOpenApiDocument } from "@features/discovery/documents/openapi";

export const GET = (() =>
  Response.json(buildOpenApiDocument(), {
    headers: { "Content-Type": "application/vnd.oai.openapi+json;version=3.1" },
  })) satisfies APIRoute;
