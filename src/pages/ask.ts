import type { APIRoute } from "astro";

import { handleAsk } from "@features/ask/handle-ask";
import { askEnabled } from "@lib/feature-flags";

export const POST = (({ request }) =>
  askEnabled ? handleAsk(request) : new Response(null, { status: 404 })) satisfies APIRoute;
