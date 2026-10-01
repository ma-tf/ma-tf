import { linkHeader, mcpPath, resources, siteUrl } from "@features/discovery/catalog";
import { buildApiCatalog } from "@features/discovery/documents/api-catalog";
import { describe, expect, it } from "vite-plus/test";

describe("linkHeader", () => {
  it("advertises the MCP capability with rel=mcp and no type", () => {
    expect(linkHeader.endsWith(`<${mcpPath}>; rel="mcp"`)).toBe(true);
  });
});

describe("resource catalogue", () => {
  it("keeps the MCP capability out of the discovery resources", () => {
    expect(resources.some((resource) => resource.path === mcpPath)).toBe(false);
  });

  it("keeps the MCP capability out of the api-catalog linkset", () => {
    const items = buildApiCatalog().linkset.flatMap((entry) => entry.item);

    expect(items.some((item) => item.href === `${siteUrl}${mcpPath}`)).toBe(false);
  });
});
