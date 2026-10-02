import { listResourceMetadata } from "@features/mcp/catalogue";
import { describe, expect, it, vi } from "vite-plus/test";

const collections = vi.hoisted(() => ({
  posts: Array.from({ length: 2 }, (_, index) => ({
    data: {
      slug: `post-${index + 1}`,
      title: `Post ${index + 1}`,
      description: `Description ${index + 1}`,
      publicationDate: new Date(`2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
    },
  })),
  vignettes: Array.from({ length: 3 }, (_, index) => ({
    data: {
      slug: `vignette-${index + 1}`,
      id: `Vignette ${index + 1}`,
      summary: `Summary ${index + 1}`,
      enabled: index < 2,
    },
  })),
}));

vi.mock("@features/blog/post-data", () => ({
  getRawPosts: vi.fn(async () => collections.posts),
}));
vi.mock("@features/tags/tag-data", () => ({
  getTagIndex: vi.fn(async () => ({ tags: [{ tag: "testing", count: 2 }], postsByTag: {} })),
}));
vi.mock("astro:content", () => ({
  getCollection: vi.fn(async (collection: string) =>
    collection === "vignettes" ? collections.vignettes : [],
  ),
}));

describe("listResourceMetadata", () => {
  it("lists pages, guides and Agent Skills as metadata only", async () => {
    const resources = await listResourceMetadata();

    expect(resources).toHaveLength(11 + 2 + 2 + 4 + 3);
    expect(new Set(resources.map((resource) => resource.uri)).size).toBe(resources.length);

    for (const resource of resources) {
      expect(resource.mimeType).toBe("text/markdown");
      expect(resource).not.toHaveProperty("text");
    }
  });

  it("names resources by path", async () => {
    const resources = await listResourceMetadata();
    const names = new Map(resources.map((resource) => [resource.uri, resource.name]));

    expect(names.get("https://m4t.tf/")).toBe("home");
    expect(names.get("https://m4t.tf/posts/post-1")).toBe("posts/post-1");
    expect(names.get("https://m4t.tf/blog/llms.txt")).toBe("blog/llms.txt");
    expect(
      names.get("https://m4t.tf/.well-known/agent-skills/retrieve-site-content/SKILL.md"),
    ).toBe("agent-skills/retrieve-site-content");
  });

  it("annotates posts only", async () => {
    const resources = await listResourceMetadata();
    const posts = resources.filter((resource) => resource.uri.includes("/posts/"));
    const others = resources.filter((resource) => !resource.uri.includes("/posts/"));

    expect(posts).toHaveLength(2);
    for (const post of posts) {
      expect(post.annotations?.lastModified).toMatch(/^2026-09-\d{2}T00:00:00\.000Z$/);
    }
    for (const resource of others) {
      expect(resource.annotations).toBeUndefined();
    }
  });

  it("includes the guides and Agent Skills from the discovery catalog", async () => {
    const resources = await listResourceMetadata();
    const uris = resources.map((resource) => resource.uri);

    expect(uris).toContain("https://m4t.tf/llms.txt");
    expect(uris).toContain("https://m4t.tf/blog/llms.txt");
    expect(uris).toContain("https://m4t.tf/developers/llms.txt");
    expect(uris).toContain("https://m4t.tf/cv/llms.txt");
    expect(uris).toContain("https://m4t.tf/.well-known/agent-skills/fact-check-matt-f/SKILL.md");

    const skill = resources.find((resource) => resource.name === "agent-skills/fact-check-matt-f");

    expect(skill?.title).toBe("fact-check-matt-f");
    expect(skill?.description).toEqual(expect.any(String));
  });

  it("omits tags, the aggregate guide and the JSON catalogues", async () => {
    const resources = await listResourceMetadata();
    const uris = resources.map((resource) => resource.uri);

    for (const excluded of [
      "https://m4t.tf/tags/testing",
      "https://m4t.tf/llms-full.txt",
      "https://m4t.tf/openapi.json",
      "https://m4t.tf/.well-known/api-catalog",
      "https://m4t.tf/.well-known/ard.json",
      "https://m4t.tf/.well-known/agent-skills/index.json",
      "https://m4t.tf/rss.xml",
      "https://m4t.tf/sitemap.xml",
      "https://m4t.tf/robots.txt",
    ]) {
      expect(uris).not.toContain(excluded);
    }
  });
});
