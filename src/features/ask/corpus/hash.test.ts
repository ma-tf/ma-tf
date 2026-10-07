import { corpusSourceHash, hashInputPaths } from "@features/ask/corpus/hash";
import { describe, expect, it } from "vite-plus/test";

describe("hashInputPaths", () => {
  it("includes the modules that build the generated content", async () => {
    const paths = await hashInputPaths();

    expect(paths).toContain("src/features/mcp/catalogue.ts");
    expect(paths).toContain("src/features/discovery/documents/llms.ts");
    expect(paths).toContain("src/lib/rate-limits.ts");
    expect(paths).toContain("src/lib/feature-flags.ts");
    expect(paths).toContain("src/content/profile.json");
  });

  it("includes content sources and the content configuration", async () => {
    const paths = await hashInputPaths();

    expect(paths).toContain("src/content.config.ts");
    expect(paths).toContain("src/content/vignettes.json");
    expect(paths.some((path) => path.startsWith("src/content/blog/"))).toBe(true);
  });

  it("includes the route wrappers the generator fetches", async () => {
    const paths = await hashInputPaths();

    expect(paths).toContain("src/pages/mcp-catalogue.json.ts");
    expect(paths).toContain("src/pages/llms.txt.ts");
    expect(paths).toContain("src/pages/blog/llms.txt.ts");
    expect(paths).toContain("src/pages/developers/llms.txt.ts");
    expect(paths).toContain("src/pages/cv/llms.txt.ts");
  });

  it("includes the Ask tag overrides", async () => {
    expect(await hashInputPaths()).toContain("src/features/ask/ask-tags.json");
  });

  it("excludes test files so editing one cannot move the hash", async () => {
    expect((await hashInputPaths()).filter((path) => path.endsWith(".test.ts"))).toEqual([]);
  });

  it("excludes modules the generated content does not import", async () => {
    expect(await hashInputPaths()).not.toContain("src/lib/accept.ts");
  });

  it("excludes the dependency manifest so dependency bumps cannot move the hash", async () => {
    const paths = await hashInputPaths();

    expect(paths).not.toContain("package.json");
    expect(paths).not.toContain("pnpm-lock.yaml");
    expect(paths).not.toContain("pnpm-workspace.yaml");
    expect(paths).not.toContain(".node-version");
  });

  it("includes the build config that shapes rendering", async () => {
    const paths = await hashInputPaths();

    expect(paths).toContain("astro.config.mjs");
    expect(paths).toContain("tsconfig.json");
  });

  it("returns a sorted, de-duplicated path set", async () => {
    const paths = await hashInputPaths();

    expect(paths).toEqual([...new Set(paths)].sort());
  });
});

describe("corpusSourceHash", () => {
  it("is deterministic", async () => {
    expect(await corpusSourceHash()).toBe(await corpusSourceHash());
  });
});
