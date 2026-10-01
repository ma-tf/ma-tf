import { resources, siteUrl } from "@features/discovery/catalog";
import { buildArd } from "@features/discovery/documents/ard";
import { describe, expect, it } from "vite-plus/test";

const manifest = buildArd();

const mcpEntry = {
  identifier: "urn:air:m4t.tf:server:mcp",
  displayName: "m4t.tf MCP server",
  type: "application/mcp-server-card+json",
  url: `${siteUrl}/mcp`,
  description: "Ask questions answered from the content published on m4t.tf.",
  tags: ["ask", "site-content"],
  capabilities: ["ask"],
  representativeQueries: [
    "What has Matt written about <topic>?",
    "Who is Matt Fehrenbach?",
    "What has Matt worked on?",
  ],
};

describe("buildArd", () => {
  it("keeps the ARD manifest outer shape", () => {
    expect(Object.keys(manifest)).toEqual(["specVersion", "host", "entries"]);
    expect(manifest.specVersion).toBe("1.0");
  });

  it("lists one entry per discovery resource plus the MCP server", () => {
    expect(manifest.entries).toHaveLength(resources.length + 1);
    expect(manifest.entries.slice(0, resources.length).map((entry) => entry.url)).toEqual(
      resources.map((resource) => `${siteUrl}${resource.path}`),
    );
  });

  it("describes the catalogue as an ARD resource", () => {
    expect(manifest.entries).toContainEqual(
      expect.objectContaining({
        identifier: "urn:air:m4t.tf:catalog:ard",
        type: "application/ard+json",
        url: `${siteUrl}/.well-known/ard.json`,
      }),
    );
  });

  it("advertises the MCP server as an Agent capability", () => {
    expect(manifest.entries).toContainEqual(mcpEntry);
  });
});
