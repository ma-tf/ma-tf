import type { APIRoute } from "astro";

import { buildLlmsTxt } from "@features/discovery/documents/llms";

export const GET = (() =>
  new Response(buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })) satisfies APIRoute;
