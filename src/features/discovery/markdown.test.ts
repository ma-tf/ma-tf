import { formatMarkdownResponse } from "@features/discovery/markdown";
import { describe, expect, it } from "vite-plus/test";

function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const page = `<!doctype html><html><head>
<title>About | Matt Fehrenbach</title>
<meta name="description" content="About Matt." />
<link rel="canonical" href="https://m4t.tf/about" />
</head><body><h1>Hello</h1></body></html>`;

describe("formatMarkdownResponse", () => {
  it("prepends frontmatter parsed from the document head", async () => {
    const response = await formatMarkdownResponse(htmlResponse(page), true);

    expect(response.headers.get("Content-Type")).toMatch(/^text\/markdown\b/);
    expect(response.headers.get("Vary")).toContain("Accept");

    const body = await response.text();
    expect(body.startsWith("---\n")).toBe(true);
    expect(body).toContain('title: "About | Matt Fehrenbach"');
    expect(body).toContain('description: "About Matt."');
    expect(body).toContain("canonical: https://m4t.tf/about");
    expect(body).toContain("Hello");
  });

  it("omits frontmatter when the document has no title", async () => {
    const response = await formatMarkdownResponse(htmlResponse("<h1>Hello</h1>"), false);

    expect(await response.text()).not.toContain("---");
  });

  it("passes through non-HTML responses untouched", async () => {
    const response = new Response("plain", { headers: { "Content-Type": "text/plain" } });

    expect(await formatMarkdownResponse(response, false).then((r) => r.text())).toBe("plain");
  });
});
