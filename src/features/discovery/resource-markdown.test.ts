import { resources, siteUrl } from "@features/discovery/catalog";
import { resourceMarkdownResponse } from "@features/discovery/resource-markdown";
import { describe, expect, it } from "vite-plus/test";

describe("resourceMarkdownResponse", () => {
  it("returns a heading-led markdown twin for every machine-readable resource", async () => {
    for (const resource of resources) {
      const response = resourceMarkdownResponse(resource.path);
      if (!response) throw new Error(`Missing markdown twin for ${resource.path}`);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toMatch(/^text\/markdown\b/);

      const body = await response.text();
      expect(body.startsWith(`# ${resource.title}`)).toBe(true);
      expect(body).toContain(`${siteUrl}${resource.path}`);
    }
  });

  it("renders the sampled resource paths as markdown", async () => {
    const openapi = resourceMarkdownResponse("/openapi.json");
    if (!openapi) throw new Error("Missing markdown twin for /openapi.json");

    expect(openapi.headers.get("Content-Type")).toMatch(/^text\/markdown\b/);
    expect(await openapi.text()).toContain("# OpenAPI document");

    const catalog = resourceMarkdownResponse("/.well-known/api-catalog");
    if (!catalog) throw new Error("Missing markdown twin for /.well-known/api-catalog");

    expect(await catalog.text()).toContain("# API catalog");
  });

  it("returns undefined for non-resource and unknown well-known paths", () => {
    expect(resourceMarkdownResponse("/about")).toBeUndefined();
    expect(resourceMarkdownResponse("/.well-known/missing")).toBeUndefined();
  });
});
