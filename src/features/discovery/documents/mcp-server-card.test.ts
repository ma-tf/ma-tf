import { buildMcpServerCard, serverCardName } from "@features/discovery/documents/mcp-server-card";
import { describe, expect, it } from "vite-plus/test";

const card = buildMcpServerCard();

describe("buildMcpServerCard", () => {
  it("declares the server-card schema", () => {
    expect(card.$schema).toBe(
      "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    );
  });

  it("names the server in reverse-DNS form", () => {
    expect(serverCardName).toBe("tf.m4t/mcp");
    expect(card.name).toBe("tf.m4t/mcp");
    expect(card.version).toBe("0.1.0");
    expect(card.kind).toBe("docs");
  });

  it("keeps the description within the schema limit", () => {
    expect(card.description.length).toBeLessThanOrEqual(100);
  });

  it("advertises the MCP endpoint in both URL fields and remotes", () => {
    expect(card.url).toBe("https://m4t.tf/mcp");
    expect(card.serverUrl).toBe("https://m4t.tf/mcp");
    expect(card.remotes).toEqual([{ type: "streamable-http", url: "https://m4t.tf/mcp" }]);
    expect(card.transport).toBe("streamable-http");
    expect(card.protocolVersion).toBe("2026-07-28");
  });

  it("omits tools so agents trust the live tools/list", () => {
    expect(card).not.toHaveProperty("tools");
  });

  it("carries an icon", () => {
    expect(card.icon).toBe("https://m4t.tf/favicon.png");
  });
});
