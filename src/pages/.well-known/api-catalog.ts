import type { APIRoute } from "astro";

import { buildApiCatalog } from "@features/discovery/documents/api-catalog";

export const GET = (() =>
  Response.json(buildApiCatalog(), {
    headers: { "Content-Type": "application/linkset+json" },
  })) satisfies APIRoute;
