import type { APIRoute } from "astro";

import { buildApiCatalog } from "@features/discovery/documents/api-catalog";

export const GET = (() =>
  Response.json(buildApiCatalog(), {
    headers: {
      "Content-Type": 'application/linkset+json;profile="https://www.rfc-editor.org/info/rfc9727"',
    },
  })) satisfies APIRoute;
