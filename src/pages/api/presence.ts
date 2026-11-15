import type { APIRoute } from "astro";

import { recordPresence } from "@features/presence/presence-store";
import { visitorHash } from "@lib/visitor-hash";

export const prerender = false;

const headers = { "Cache-Control": "no-store" };

export const POST = (async ({ request }: { request: Request }) => {
  const hash = visitorHash(request, "presence");

  if (hash) await recordPresence(hash);

  return new Response(null, { status: 204, headers });
}) satisfies APIRoute;
