import type { APIRoute } from "astro";

import { getRawPosts } from "@features/blog/post-data";
import { buildLlmsFullTxt } from "@features/discovery/documents/llms";

export const GET = (async () => {
  const posts = await getRawPosts();

  return new Response(buildLlmsFullTxt(posts), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}) satisfies APIRoute;
