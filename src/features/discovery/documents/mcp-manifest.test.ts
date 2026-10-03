import { buildMcpManifest } from "@features/discovery/documents/mcp-manifest";
import { describe, expect, it } from "vite-plus/test";

const manifest = buildMcpManifest();

describe("buildMcpManifest", () => {
  it("pins the MCP revision", () => {
    expect(manifest.mcp_version).toBe("2026-07-28");
  });

  it("lists the streamable-http endpoint with its capabilities", () => {
    expect(manifest.endpoints).toEqual([
      {
        url: "https://m4t.tf/mcp",
        transport: "streamable-http",
        capabilities: ["tools", "resources"],
      },
    ]);
  });

  it("points at the server card", () => {
    expect(manifest.serverCard).toBe("https://m4t.tf/.well-known/mcp/server-card.json");
  });
});
