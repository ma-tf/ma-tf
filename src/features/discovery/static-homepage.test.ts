import { linkHeader } from "@features/discovery/catalog";
import { htmlToMarkdown } from "@features/discovery/html-markdown";
import { buildStaticHeaders } from "@features/discovery/static-headers";
import { writeHomeMarkdown } from "@features/discovery/static-homepage";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vite-plus/test";

import homeMarkdown, { config } from "@/netlify/edge-functions/home-markdown";

function edge(accept: string) {
  return homeMarkdown(new Request("https://m4t.tf/", { headers: { Accept: accept } }));
}

describe("homepage markdown", () => {
  it("writes a markdown copy of the built homepage", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "home-markdown-"));
    await writeFile(
      join(outDir, "index.html"),
      "<html><head><title>Home</title></head><body><h1>Hello</h1></body></html>",
    );

    await writeHomeMarkdown(pathToFileURL(outDir + sep), htmlToMarkdown);

    const markdown = await readFile(join(outDir, "index.md"), "utf8");
    expect(markdown).toContain('title: "Home"');
    expect(markdown).toContain("Hello");

    await rm(outDir, { recursive: true });
  });

  it("rewrites a client that prefers markdown to the markdown copy", () => {
    expect(edge("text/markdown")?.href).toBe("https://m4t.tf/index.md");
  });

  it("passes through a client that rates HTML higher", () => {
    expect(edge("text/html, text/markdown;q=0.5")).toBeUndefined();
  });

  it("runs only for requests that name markdown", () => {
    expect(config.path).toBe("/");
    expect(new RegExp(config.header.accept).test("text/html,*/*;q=0.8")).toBe(false);
  });

  it.each(["/", "/index.md"])("declares the discovery headers for %s", (path) => {
    const block = buildStaticHeaders()
      .split("\n\n")
      .find((candidate) => candidate.startsWith(`${path}\n`));

    expect(block).toContain(`  Link: ${linkHeader}\n`);
    expect(block).toContain("  Vary: Accept");
  });
});
