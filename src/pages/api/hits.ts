import type { APIRoute } from "astro";

import { incrementHits, readHits } from "@features/hits/hits-store";
import { countUniques, recordUnique, uniqueHash, utcDay } from "@features/hits/uniques-store";

export const prerender = false;

const headers = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { headers });
}

export const GET = (async () => {
  const [hits, uniques] = await Promise.all([readHits(), countUniques(utcDay()).catch(() => 0)]);

  return jsonResponse({ hits, uniques });
}) satisfies APIRoute;

export const POST = (async ({ request }: { request: Request }) => {
  const hits = await incrementHits();
  const hash = uniqueHash(request);

  if (hash) await recordUnique(hash).catch(() => {});

  return jsonResponse({ hits });
}) satisfies APIRoute;
