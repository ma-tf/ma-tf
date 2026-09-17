import type { APIRoute } from "astro";

import { buildAiCatalog } from "@features/discovery/documents/ai-catalog";

export const GET = (() =>
  Response.json(buildAiCatalog(), {
    headers: {
      "Content-Type": "application/ai-catalog+json",
      "Access-Control-Allow-Origin": "*",
    },
  })) satisfies APIRoute;
