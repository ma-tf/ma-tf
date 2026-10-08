import type { APIRoute } from "astro";

import { buildArd } from "@features/discovery/documents/ard";

export const GET = (() =>
  Response.json(buildArd(), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  })) satisfies APIRoute;
