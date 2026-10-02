import { linkHeader, resources, siteUrl } from "@features/discovery/catalog";
import { agentSkillMarkdown } from "@features/discovery/documents/agent-skills";
import { buildArd } from "@features/discovery/documents/ard";
import { buildDevelopersLlmsTxt, buildLlmsTxt } from "@features/discovery/documents/llms";
import { buildOpenApiDocument } from "@features/discovery/documents/openapi";
import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("@lib/feature-flags", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@lib/feature-flags")>()),
  askEnabled: false,
}));

describe("ask disabled", () => {
  it("omits the MCP Link relation", () => {
    expect(linkHeader).not.toContain('rel="mcp"');
    expect(linkHeader).not.toContain("/mcp");
  });

  it("omits the MCP server from the ARD catalogue", () => {
    const entries = buildArd().entries;

    expect(entries).toHaveLength(resources.length);
    expect(entries.some((entry) => entry.url === `${siteUrl}/mcp`)).toBe(false);
  });

  it("omits MCP and ask from the site guide", () => {
    const text = buildLlmsTxt();

    expect(text).not.toContain("/mcp");
    expect(text).not.toContain("`POST /ask`");
  });

  it("omits MCP and ask from the developers guide", () => {
    const text = buildDevelopersLlmsTxt();

    expect(text).not.toContain("/mcp");
    expect(text).not.toContain("`POST /ask`");
  });

  it("omits MCP and ask from the resource-discovery skill", () => {
    const markdown = agentSkillMarkdown("discover-site-resources") ?? "";

    expect(markdown).not.toContain("/mcp");
    expect(markdown).not.toContain("`POST /ask`");
  });

  it("omits the ask and MCP paths from the OpenAPI document", () => {
    const paths = buildOpenApiDocument().paths;

    expect(paths).not.toHaveProperty("/ask");
    expect(paths).not.toHaveProperty("/mcp");
  });
});
