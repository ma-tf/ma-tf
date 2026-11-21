import type { PlainPost } from "@features/blog/post-data";

import { SelectedTagPanel } from "@features/tags/selected-tag-panel";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

const post: PlainPost = {
  slug: "a-post",
  title: "A post",
  description: "A description",
  publicationDate: "2026-11-01T00:00:00.000Z",
};

const posts = Array.from({ length: 11 }, (_, index) => ({
  ...post,
  slug: `post-${index}`,
  title: `Post ${index}`,
}));

const render = (selected: { tag: string; count: number } | null) =>
  renderToStaticMarkup(
    <SelectedTagPanel
      selected={selected}
      postsByTag={selected ? { [selected.tag]: [post] } : {}}
      allPosts={selected ? [post] : posts}
    />,
  );

describe("SelectedTagPanel", () => {
  it("renders the tag name as the page heading", () => {
    const html = render(null);

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain(">blog</h1>");
  });

  it("renders a selected tag as the page heading", () => {
    const html = render({ tag: "astro", count: 1 });

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain(">astro</h1>");
  });

  it("hides the panel nav on mobile and keeps the list in the page flow", () => {
    const html = render(null);

    expect(html).toContain("hidden items-center justify-end md:flex");
    expect(html).toContain("gap-4 md:overflow-y-auto");
    expect(html).toContain("min-h-11 items-center text-sm");
  });

  it("renders pagination as buttons with labels", () => {
    const html = render(null);

    expect(html).toContain('aria-label="Previous page"');
    expect(html).toContain('aria-label="Next page"');
    expect(html).toContain('type="button"');
    expect(html).toContain("disabled");
  });
});
