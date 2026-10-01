import type { APIRoute } from "astro";

import { buildArd } from "@features/discovery/documents/ard";

export const GET = (() =>
  Response.json(buildArd(), {
    headers: {
      "Content-Type": "application/ard+json",
      "Access-Control-Allow-Origin": "*",
    },
  })) satisfies APIRoute;
