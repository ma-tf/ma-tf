import { type Node, postBirdBreakIndex, remarkPostBirdBreak } from "@lib/remark-post-bird-break";
import { describe, expect, it } from "vite-plus/test";

function paragraph(words: number): Node {
  return {
    type: "paragraph",
    children: [{ type: "text", value: Array.from({ length: words }, () => "word").join(" ") }],
  };
}

function heading(words: number): Node {
  return {
    type: "heading",
    depth: 2,
    children: [{ type: "text", value: Array.from({ length: words }, () => "word").join(" ") }],
  };
}

function mdxFile() {
  return {
    extname: ".mdx",
    path: "src/content/blog/post.mdx",
    data: { astro: { frontmatter: { slug: "post" } } },
  };
}

function tree(): { children: Node[] } {
  return { children: [paragraph(10), paragraph(10), paragraph(10)] };
}

describe("postBirdBreakIndex", () => {
  it("breaks near the middle by word count", () => {
    const children = [paragraph(10), paragraph(10), paragraph(10), paragraph(10), paragraph(10)];

    expect(postBirdBreakIndex(children)).toBe(2);
  });

  it("does not separate a heading from its content", () => {
    const children = [paragraph(10), heading(5), paragraph(10), paragraph(10), paragraph(10)];

    expect(postBirdBreakIndex(children)).toBe(3);
  });

  it("leaves content with fewer than three blocks alone", () => {
    expect(postBirdBreakIndex([paragraph(10), paragraph(10)])).toBeUndefined();
  });
});

describe("remarkPostBirdBreak", () => {
  it("inserts one break component into an MDX post", () => {
    const content = tree();
    const file = mdxFile();

    remarkPostBirdBreak()(content, file);
    remarkPostBirdBreak()(content, file);

    const inserted = content.children.filter(
      (node) => node.type === "mdxJsxFlowElement" && node.name === "PostBirdBreak",
    );

    expect(inserted).toHaveLength(1);
  });

  it("ignores markdown files", () => {
    const content = tree();

    remarkPostBirdBreak()(content, {
      ...mdxFile(),
      extname: ".md",
      path: "src/content/faq/post.md",
    });

    expect(content.children).toHaveLength(3);
  });

  it("ignores MDX outside the blog", () => {
    const content = tree();

    remarkPostBirdBreak()(content, { ...mdxFile(), data: { astro: { frontmatter: {} } } });

    expect(content.children).toHaveLength(3);
  });
});
