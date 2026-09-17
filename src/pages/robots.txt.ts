import type { APIRoute } from "astro";

import { buildRobotsTxt } from "@features/discovery/documents/robots";

export const prerender = true;

export const GET = (() =>
  new Response(buildRobotsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })) satisfies APIRoute;
