import type { APIRoute } from "astro";

import { getRawPosts } from "@features/blog/post-data";
import { siteUrl } from "@lib/resource-catalog";

export const GET = (async () => {
  const posts = (await getRawPosts()).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const sections = posts.map((post) => {
    const { title, slug, pubDate, description, tags } = post.data;

    return [
      `## ${title}`,
      "",
      `- URL: ${siteUrl}/posts/${slug}`,
      `- Published: ${pubDate.toISOString().split("T")[0]}`,
      `- Description: ${description}`,
      `- Tags: ${tags.join(", ")}`,
      "",
      post.body?.trim() ?? "",
    ].join("\n");
  });

  const content = [
    "# m4t.tf: Full Content Archive",
    "",
    "This file contains the published blog content from m4t.tf.",
    "",
    ...sections.flatMap((section) => [section, "---", ""]),
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}) satisfies APIRoute;
