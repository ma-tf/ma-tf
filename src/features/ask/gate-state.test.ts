import type { PublishedPage } from "@features/ask/published-page";

import { buildGateState, pageExcerpt } from "@features/ask/gate-state";
import { describe, expect, it } from "vite-plus/test";

function page(overrides: Partial<PublishedPage> = {}): PublishedPage {
  return {
    url: "https://m4t.tf/about",
    title: "About",
    content:
      '---\ntitle: "About | Matt"\ndescription: "A short description."\ncanonical: https://m4t.tf/about\n---\n\n[![](/favicon.png)](/)\n\n[Home](/)[Blog](/blog)\n\nAbout body text.',
    ...overrides,
  };
}

describe("pageExcerpt", () => {
  it("keeps the description and body while dropping frontmatter and navigation", () => {
    const excerpt = pageExcerpt(page(), 4000);

    expect(excerpt).toContain("A short description.");
    expect(excerpt).toContain("About body text.");
    expect(excerpt).not.toContain("canonical");
    expect(excerpt).not.toContain("[Blog](/blog)");
    expect(excerpt).not.toContain("[Home](/)[");
  });

  it("clamps a long body and marks the cut", () => {
    const excerpt = pageExcerpt(page({ content: `${"word ".repeat(4000)}` }), 200);

    expect(excerpt.length).toBeLessThanOrEqual(200);
    expect(excerpt.endsWith("…")).toBe(true);
  });

  it("retains the invisible tags within the budget", () => {
    const content = `${"word ".repeat(4000)}\n\n## Invisible tags\n\n- Bolex H-16 SBM — 16mm camera`;
    const excerpt = pageExcerpt(page({ content }), 200);

    expect(excerpt).toContain("## Invisible tags");
    expect(excerpt).toContain("Bolex H-16 SBM");
    expect(excerpt.length).toBeLessThanOrEqual(200);
  });
});

describe("buildGateState", () => {
  it("represents every page with its url and title", () => {
    const pages = [page(), page({ url: "https://m4t.tf/music", title: "Music" })];
    const state = buildGateState("What do you play?", pages);

    expect(state.visitor_question).toBe("What do you play?");
    expect(state.published_pages.map((entry) => entry.url)).toEqual([
      "https://m4t.tf/about",
      "https://m4t.tf/music",
    ]);
    expect(state.published_pages.map((entry) => entry.title)).toEqual(["About", "Music"]);
  });

  it("bounds the total excerpt length as the corpus grows", () => {
    const pages = Array.from({ length: 29 }, (_, index) =>
      page({ url: `https://m4t.tf/p${index}`, content: `body ${"word ".repeat(2000)}` }),
    );
    const total = buildGateState("q", pages).published_pages.reduce(
      (length, entry) => length + entry.excerpt.length,
      0,
    );

    expect(total).toBeLessThanOrEqual(48000);
  });

  it("handles content without frontmatter", () => {
    const state = buildGateState("q", [page({ content: "Just some body." })]);

    expect(state.published_pages[0]!.excerpt).toContain("Just some body.");
  });
});
