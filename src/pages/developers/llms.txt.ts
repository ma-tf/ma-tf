import type { APIRoute } from "astro";

import { buildDevelopersLlmsTxt } from "@features/discovery/documents/llms";

export const GET = (() =>
  new Response(buildDevelopersLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })) satisfies APIRoute;
