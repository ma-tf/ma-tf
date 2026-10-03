import { buildMcpServerCard } from "@features/discovery/documents/mcp-server-card";
import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("@features/ask/ask", () => ({ ask: vi.fn() }));

const card = buildMcpServerCard();

describe("buildMcpServerCard", () => {
  it("identifies the server", () => {
    expect(card.name).toBe("m4t.tf");
    expect(card.version).toBe("0.1.0");
    expect(card.kind).toBe("docs");
  });

  it("advertises the MCP endpoint in both URL fields", () => {
    expect(card.url).toBe("https://m4t.tf/mcp");
    expect(card.serverUrl).toBe("https://m4t.tf/mcp");
    expect(card.transport).toBe("streamable-http");
    expect(card.protocolVersion).toBe("2026-07-28");
  });

  it("describes the ask tool with its schema and annotations", () => {
    expect(card.tools).toHaveLength(1);

    const [tool] = card.tools;

    expect(tool?.name).toBe("ask");
    expect(tool?.inputSchema).toMatchObject({
      type: "object",
      properties: { query: { type: "object" } },
      required: ["query"],
    });
    expect(tool?.annotations).toEqual({ readOnlyHint: true, openWorldHint: false });
  });

  it("carries an icon", () => {
    expect(card.icon).toBe("https://m4t.tf/favicon.png");
  });
});
