import type { APIContext } from "astro";

import { ask } from "@features/ask/ask";
import { failureResponses } from "@features/ask/response";
import { handleMcp } from "@features/mcp/handle-mcp";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { ALL, POST } from "@/src/pages/mcp";

vi.mock("@lib/feature-flags", () => ({ askEnabled: false }));
vi.mock("@features/ask/ask", () => ({ ask: vi.fn() }));

const askMock = vi.mocked(ask);

beforeEach(() => {
  askMock.mockReset();
});

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

function listBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: { _meta: META },
    ...overrides,
  };
}

function callBody(args: unknown, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "ask", arguments: args, _meta: META },
    ...overrides,
  };
}

type ToolListing = {
  name: string;
  title?: string;
  description?: string;
  inputSchema: Record<string, unknown>;
  outputSchema: { anyOf: unknown[] };
  annotations?: Record<string, unknown>;
};

type ToolCallResult = {
  structuredContent?: unknown;
  content: { type: string; text: string }[];
  isError?: boolean;
};

describe("handleMcp", () => {
  it("returns the 2026-07-28 discover result", async () => {
    const response = await handleMcp(requestFor(discoverBody()));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Vary")).toBeNull();

    const payload = (await response.json()) as Payload;

    expect(payload.jsonrpc).toBe("2.0");
    expect(payload.id).toBe(1);
    expect(payload.result?.resultType).toBe("complete");
    expect(payload.result?.supportedVersions).toEqual(["2026-07-28"]);
    expect(payload.result?.capabilities).toEqual({
      tools: { listChanged: true },
      resources: { listChanged: true },
    });
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
      requestFor(
        { jsonrpc: "2.0", method: "notifications/initialized" },
        { "Mcp-Method": "notifications/initialized" },
      ),
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

  it("lists exactly the ask tool with its schema, annotations and cache hints", async () => {
    const response = await handleMcp(requestFor(listBody(), { "Mcp-Method": "tools/list" }));

    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      result: { tools: [ToolListing]; ttlMs?: number; cacheScope?: string };
    };

    expect(payload.result.tools).toHaveLength(1);

    const [tool] = payload.result.tools;

    expect(tool.name).toBe("ask");
    expect(tool.title).toBe("Ask m4t.tf");
    expect(tool.description).toEqual(expect.any(String));
    expect(tool.annotations).toEqual({ readOnlyHint: true, openWorldHint: false });
    expect(tool.inputSchema).toMatchObject({
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "object", required: ["text"] },
        prefer: { type: "object", properties: { mode: { enum: ["list", "summarize"] } } },
      },
    });
    expect(tool.outputSchema.anyOf).toHaveLength(2);
    expect(payload.result.ttlMs).toBe(3600000);
    expect(payload.result.cacheScope).toBe("public");
  });

  it("returns the answer document from tools/call", async () => {
    askMock.mockResolvedValue({
      sources: [{ url: "https://m4t.tf/about", title: "About", content: "About Matt." }],
      summary: "Matt builds software.",
    });

    const response = await handleMcp(
      requestFor(callBody({ query: { text: "Who is Matt?" }, prefer: { mode: "summarize" } }), {
        "Mcp-Method": "tools/call",
        "Mcp-Name": "ask",
      }),
    );

    expect(response.status).toBe(200);

    const payload = (await response.json()) as { result: ToolCallResult };

    const document = {
      _meta: {
        response_type: "answer",
        response_format: "conversational_search",
        version: "0.55",
      },
      results: [
        { "@type": "SearchSummary", text: "Matt builds software." },
        { "@type": "WebPage", name: "About", url: "https://m4t.tf/about" },
      ],
    };

    expect(payload.result.structuredContent).toEqual(document);
    expect(payload.result.content).toEqual([{ type: "text", text: JSON.stringify(document) }]);
    expect(payload.result.isError).toBe(false);
    expect(askMock).toHaveBeenCalledWith("Who is Matt?", true, expect.any(AbortSignal));
  });

  it("returns only the matching Pages in list mode and ignores other NLWeb members", async () => {
    askMock.mockResolvedValue({
      sources: [{ url: "https://m4t.tf/about", title: "About", content: "About Matt." }],
    });

    const response = await handleMcp(
      requestFor(
        callBody({
          query: { text: "Who is Matt?", site: "m4t.tf" },
          context: { "@type": "Conversation", text: "earlier" },
          meta: { version: "0.55" },
        }),
        { "Mcp-Method": "tools/call", "Mcp-Name": "ask" },
      ),
    );

    const payload = (await response.json()) as { result: ToolCallResult };

    expect(payload.result.structuredContent).toEqual({
      _meta: {
        response_type: "answer",
        response_format: "conversational_search",
        version: "0.55",
      },
      results: [{ "@type": "WebPage", name: "About", url: "https://m4t.tf/about" }],
    });
    expect(payload.result.isError).toBe(false);
    expect(askMock).toHaveBeenCalledWith("Who is Matt?", false, expect.any(AbortSignal));
  });

  it("reports NO_RESULTS as a non-error tool result", async () => {
    askMock.mockResolvedValue(null);

    const response = await handleMcp(
      requestFor(callBody({ query: { text: "Who is Matt?" } }), {
        "Mcp-Method": "tools/call",
        "Mcp-Name": "ask",
      }),
    );

    const payload = (await response.json()) as { result: ToolCallResult };

    expect(payload.result.structuredContent).toEqual(failureResponses.NO_RESULTS);
    expect(payload.result.content).toEqual([
      { type: "text", text: JSON.stringify(failureResponses.NO_RESULTS) },
    ]);
    expect(payload.result.isError).toBe(false);
  });

  it("turns a thrown failure into INTERNAL_ERROR", async () => {
    askMock.mockRejectedValue(new Error("boom"));

    const response = await handleMcp(
      requestFor(callBody({ query: { text: "Who is Matt?" } }), {
        "Mcp-Method": "tools/call",
        "Mcp-Name": "ask",
      }),
    );

    const payload = (await response.json()) as { result: ToolCallResult };

    expect(payload.result.structuredContent).toEqual(failureResponses.INTERNAL_ERROR);
    expect(payload.result.isError).toBe(true);
  });

  it("rejects an unknown prefer mode before the tool runs", async () => {
    const response = await handleMcp(
      requestFor(callBody({ query: { text: "Who is Matt?" }, prefer: { mode: "unknown" } }), {
        "Mcp-Method": "tools/call",
        "Mcp-Name": "ask",
      }),
    );

    const payload = (await response.json()) as { result: ToolCallResult };

    expect(response.status).toBe(200);
    expect(payload.result.isError).toBe(true);
    expect(payload.result.content[0]?.text).toContain("prefer.mode");
    expect(askMock).not.toHaveBeenCalled();
  });

  it("does not meter server/discover or tools/list", async () => {
    await handleMcp(requestFor(discoverBody()));
    await handleMcp(requestFor(listBody(), { "Mcp-Method": "tools/list" }));

    expect(askMock).not.toHaveBeenCalled();
  });

  it("does not meter a tools/call for ask with no query text", async () => {
    await handleMcp(requestFor(callBody({}), { "Mcp-Method": "tools/call", "Mcp-Name": "ask" }));

    expect(askMock).not.toHaveBeenCalled();
  });
});
