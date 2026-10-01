import type { APIContext } from "astro";

import { handleMcp } from "@features/mcp/handle-mcp";
import { describe, expect, it, vi } from "vite-plus/test";

import { ALL, POST } from "@/src/pages/mcp";

vi.mock("@lib/rate-limit-middleware", () => ({ enforceRateLimit: vi.fn() }));
vi.mock("@lib/feature-flags", () => ({ askEnabled: false }));

const META = {
  "io.modelcontextprotocol/protocolVersion": "2026-07-28",
  "io.modelcontextprotocol/clientCapabilities": {},
};

type DiscoverResult = {
  resultType: string;
  supportedVersions: string[];
  capabilities: { tools: unknown; resources: unknown };
  instructions: string;
  ttlMs: number;
  cacheScope: string;
  _meta: Record<string, { name: string; version: string }>;
  serverInfo?: unknown;
  protocolVersion?: unknown;
};

type Payload = {
  jsonrpc: string;
  id: string | number | null;
  result?: DiscoverResult;
  error?: {
    code: number;
    message: string;
    data?: { supported: string[]; requested: string };
  };
};

function requestFor(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://m4t.tf/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2026-07-28",
      "Mcp-Method": "server/discover",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function discoverBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    jsonrpc: "2.0",
    id: 1,
    method: "server/discover",
    params: { _meta: META },
    ...overrides,
  };
}

describe("handleMcp", () => {
  it("returns the 2026-07-28 discover result", async () => {
    const response = await handleMcp(requestFor(discoverBody()));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("Vary")).toBeNull();

    const payload = (await response.json()) as Payload;

    expect(payload.jsonrpc).toBe("2.0");
    expect(payload.id).toBe(1);
    expect(payload.result?.resultType).toBe("complete");
    expect(payload.result?.supportedVersions).toEqual(["2026-07-28"]);
    expect(payload.result?.capabilities).toEqual({ tools: {}, resources: {} });
    expect(payload.result?.instructions).toEqual(expect.any(String));
    expect(payload.result?.ttlMs).toBe(3600000);
    expect(payload.result?.cacheScope).toBe("public");
    expect(payload.result?._meta["io.modelcontextprotocol/serverInfo"]).toEqual({
      name: "m4t.tf",
      version: "0.1.0",
    });
    expect(payload.result?.serverInfo).toBeUndefined();
    expect(payload.result?.protocolVersion).toBeUndefined();
  });

  it("answers unparsable JSON with -32700 and a null id", async () => {
    const response = await handleMcp(requestFor("{"));

    expect(response.status).toBe(400);

    const payload = (await response.json()) as Payload;

    expect(payload.error?.code).toBe(-32700);
    expect(payload.id).toBeNull();
  });

  it("answers a top-level array with -32600", async () => {
    const response = await handleMcp(requestFor([1, 2, 3]));

    expect(response.status).toBe(400);
    expect(((await response.json()) as Payload).error?.code).toBe(-32600);
  });

  it("answers a non-request object with -32600", async () => {
    const response = await handleMcp(
      requestFor({ jsonrpc: "2.0", method: "server/discover", id: null }),
    );

    expect(response.status).toBe(400);
    expect(((await response.json()) as Payload).error?.code).toBe(-32600);
  });

  it("answers a header and body method mismatch with -32020", async () => {
    const response = await handleMcp(requestFor(discoverBody(), { "Mcp-Method": "tools/list" }));

    expect(response.status).toBe(400);
    expect(((await response.json()) as Payload).error?.code).toBe(-32020);
  });

  it("answers missing protocol metadata with -32602", async () => {
    const response = await handleMcp(
      requestFor({ jsonrpc: "2.0", id: 7, method: "server/discover", params: {} }),
    );

    expect(response.status).toBe(400);
    expect(((await response.json()) as Payload).error?.code).toBe(-32602);
  });

  it("answers a header and body version mismatch with -32020", async () => {
    const body = discoverBody({
      params: {
        _meta: { ...META, "io.modelcontextprotocol/protocolVersion": "2025-06-18" },
      },
    });

    const response = await handleMcp(requestFor(body));

    expect(response.status).toBe(400);
    expect(((await response.json()) as Payload).error?.code).toBe(-32020);
  });

  it("answers an unsupported protocol version with -32022", async () => {
    const body = discoverBody({
      params: {
        _meta: { ...META, "io.modelcontextprotocol/protocolVersion": "2025-06-18" },
      },
    });

    const response = await handleMcp(requestFor(body, { "MCP-Protocol-Version": "2025-06-18" }));

    expect(response.status).toBe(400);

    const payload = (await response.json()) as Payload;

    expect(payload.error?.code).toBe(-32022);
    expect(payload.error?.data).toEqual({
      supported: ["2026-07-28"],
      requested: "2025-06-18",
    });
  });

  it("answers an unknown method with -32601 at 404", async () => {
    const body = { jsonrpc: "2.0", id: 3, method: "prompts/list", params: { _meta: META } };

    const response = await handleMcp(requestFor(body, { "Mcp-Method": "prompts/list" }));

    expect(response.status).toBe(404);
    expect(((await response.json()) as Payload).error?.code).toBe(-32601);
  });

  it("accepts a notification with 202 and an empty body", async () => {
    const response = await handleMcp(
      requestFor({ jsonrpc: "2.0", method: "notifications/initialized" }),
    );

    expect(response.status).toBe(202);
    expect(await response.text()).toBe("");
  });

  it("answers non-POST methods with 405 and Allow: POST", async () => {
    const response = ALL();

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
    expect(await response.text()).toBe("");
  });

  it("returns 404 before parsing when the ask flag is off", async () => {
    const request = requestFor(discoverBody());
    const response = await POST({ request } as unknown as APIContext);

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });
});
