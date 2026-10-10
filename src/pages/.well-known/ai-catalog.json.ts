import type { APIRoute } from "astro";

import { buildArd } from "@features/discovery/documents/ard";

export const GET = (() =>
  Response.json(buildArd(), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  })) satisfies APIRoute;
