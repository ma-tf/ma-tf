import { resources, sectionGuides, siteUrl } from "@features/discovery/catalog";
import {
  buildBlogLlmsTxt,
  buildCvLlmsTxt,
  buildDevelopersLlmsTxt,
  buildLlmsTxt,
} from "@features/discovery/documents/llms";
import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("@lib/feature-flags", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@lib/feature-flags")>()),
  askEnabled: true,
}));

const posts = [
  {
    body: "Older body.",
    data: {
      title: "Older post",
      slug: "older-post",
      publicationDate: new Date("2026-01-01"),
      description: "An older post.",
      tags: ["astro", "typescript"],
    },
  },
  {
    body: "Newer body.",
    data: {
      title: "Newer post",
      slug: "newer-post",
      publicationDate: new Date("2026-03-01"),
      description: "A newer post.",
      tags: ["typescript"],
    },
  },
];

const occurrences = (haystack: string, needle: string) => haystack.split(needle).length - 1;

const section = (text: string, heading: string) => {
  const rest = text.slice(text.indexOf(heading) + heading.length);
  const end = rest.indexOf("\n## ");

  return end === -1 ? rest : rest.slice(0, end);
};

const serverCardUrl = `${siteUrl}/.well-known/mcp/server-card.json`;

describe("section guides", () => {
  it("registers every guide as a discovery resource", () => {
    for (const guide of sectionGuides) {
      expect(resources.some((resource) => resource.path === guide.path)).toBe(true);
    }
  });

  it("keeps guides out of the advertised Link relations", () => {
    for (const guide of sectionGuides) {
      expect(guide.rel).toBeUndefined();
    }
  });

  it("lists every guide exactly once in the root guide", () => {
    const text = buildLlmsTxt();

    for (const guide of sectionGuides) {
      expect(occurrences(text, `${siteUrl}${guide.path}`)).toBe(1);
    }
  });
});

describe("buildLlmsTxt", () => {
  it("names the MCP endpoint and widens the metered surface", () => {
    const text = buildLlmsTxt();

    expect(text).toContain("`POST /mcp`");
    expect(text).toContain("`POST /ask` and the `ask` tool on");
  });

  it("keeps the MCP endpoint out of the machine-readable list", () => {
    const text = buildLlmsTxt();

    expect(section(text, "## Machine-Readable Files")).not.toContain("/mcp");
    expect(text).toContain(`${siteUrl}/mcp`);
  });

  it("publishes an MCP section naming the server and its card", () => {
    const mcp = section(buildLlmsTxt(), "## MCP");

    expect(mcp).toContain(`${siteUrl}/mcp`);
    expect(mcp).toContain(serverCardUrl);
  });
});

describe("buildBlogLlmsTxt", () => {
  it("lists every post newest first", () => {
    const text = buildBlogLlmsTxt(posts);

    expect(text).toContain(`${siteUrl}/posts/newer-post`);
    expect(text).toContain(`${siteUrl}/posts/older-post`);
    expect(text.indexOf("newer-post")).toBeLessThan(text.indexOf("older-post"));
  });

  it("indexes the tags and links the full archive", () => {
    const text = buildBlogLlmsTxt(posts);

    expect(text).toContain(`${siteUrl}/tags/astro`);
    expect(text).toContain(`${siteUrl}/tags/typescript`);
    expect(text).toContain(`${siteUrl}/llms-full.txt`);
  });
});

describe("buildDevelopersLlmsTxt", () => {
  it("lists the published resources", () => {
    const text = buildDevelopersLlmsTxt();
    const listed = resources.filter((resource) => !sectionGuides.includes(resource));

    for (const resource of listed) {
      expect(text).toContain(`${siteUrl}${resource.path}`);
    }
  });

  it("stays scoped to the developers area", () => {
    const text = buildDevelopersLlmsTxt();

    for (const guide of sectionGuides) {
      expect(text).not.toContain(`${siteUrl}${guide.path}`);
    }
  });

  it("names the MCP endpoint and widens the metered surface", () => {
    const text = buildDevelopersLlmsTxt();

    expect(text).toContain("`POST /mcp`");
    expect(text).toContain("`POST /ask` and the `ask` tool on");
  });

  it("keeps the MCP endpoint out of the resource list", () => {
    const text = buildDevelopersLlmsTxt();

    expect(section(text, "## Resources")).not.toContain("/mcp");
    expect(text).toContain(`${siteUrl}/mcp`);
  });

  it("publishes an MCP section naming the server and its card", () => {
    const mcp = section(buildDevelopersLlmsTxt(), "## MCP");

    expect(mcp).toContain(`${siteUrl}/mcp`);
    expect(mcp).toContain(serverCardUrl);
  });
});

describe("buildCvLlmsTxt", () => {
  it("points at the professional profile pages", () => {
    const text = buildCvLlmsTxt();

    expect(text).toContain(`${siteUrl}/cv`);
    expect(text).toContain(`${siteUrl}/about`);
    expect(text).toContain(`${siteUrl}/contact`);
  });
});
