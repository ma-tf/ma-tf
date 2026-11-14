import type { APIRoute } from "astro";

import { incrementHits, readHits } from "@features/hits/hits-store";

export const prerender = false;

const headers = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function hitsResponse(count: number): Response {
  return new Response(JSON.stringify({ count }), { headers });
}

export const GET = (async () => hitsResponse(await readHits())) satisfies APIRoute;

export const POST = (async () => hitsResponse(await incrementHits())) satisfies APIRoute;
