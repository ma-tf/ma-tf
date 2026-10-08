import type { APIRoute } from "astro";

import { buildApiLlmsTxt } from "@features/discovery/documents/llms";

export const GET = (() =>
  new Response(buildApiLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })) satisfies APIRoute;
