import type { APIContext } from "astro";

import { ask } from "@features/ask/ask";
import corpus from "@features/ask/published-pages.generated.json";
import { failureResponses } from "@features/ask/response";
import { agentSkillMarkdown } from "@features/discovery/documents/agent-skills";
import { buildLlmsTxt } from "@features/discovery/documents/llms";
import { handleMcp } from "@features/mcp/handle-mcp";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { ALL, POST } from "@/src/pages/mcp";

const collections = vi.hoisted(() => ({
  blog: Array.from({ length: 11 }, (_, index) => ({
    body: `# Post ${index + 1}`,
    data: {
      slug: `post-${index + 1}`,
      title: `Post ${index + 1}`,
      description: `Description ${index + 1}`,
      publicationDate: new Date(`2026-09-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
      tags: ["testing"],
      draft: false,
    },
  })),
  vignettes: Array.from({ length: 9 }, (_, index) => ({
    data: {
      slug: `vignette-${index + 1}`,
      id: `Vignette ${index + 1}`,
      summary: `Summary ${index + 1}`,
      enabled: index < 7,
    },
  })),
}));

vi.mock("@lib/feature-flags", () => ({ askEnabled: false }));
vi.mock("@features/ask/ask", () => ({ ask: vi.fn() }));
vi.mock("astro:content", () => ({
  getCollection: vi.fn(async (collection: string) => {
    if (collection === "blog") return collections.blog;
    if (collection === "vignettes") return collections.vignettes;
    return [];
  }),
}));

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

function resourcesListBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    jsonrpc: "2.0",
    id: 4,
    method: "resources/list",
    params: { _meta: META },
    ...overrides,
  };
}

function resourcesReadBody(
  uri: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    jsonrpc: "2.0",
    id: 5,
    method: "resources/read",
    params: { uri, _meta: META },
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

type ResourceListing = {
  uri: string;
  name: string;
  title: string;
  description: string;
  mimeType: string;
  annotations?: { lastModified?: string };
  size?: unknown;
  icons?: unknown;
};

type ResourceReadResult = {
  contents: { uri: string; mimeType: string; text: string }[];
  ttlMs?: number;
  cacheScope?: string;
};

type ResourcePayload = {
  result?: ResourceReadResult;
  error?: { code: number; message: string };
};

async function listResources(): Promise<ResourceListing[]> {
  const response = await handleMcp(
    requestFor(resourcesListBody(), { "Mcp-Method": "resources/list" }),
  );
  const payload = (await response.json()) as {
    result: { resources: ResourceListing[]; ttlMs?: number; cacheScope?: string };
  };

  return payload.result.resources;
}

function readRequest(uri: string): Request {
  return requestFor(resourcesReadBody(uri), {
    "Mcp-Method": "resources/read",
    "Mcp-Name": uri,
  });
}

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

  it("lists the 36 resources and omits tags, the aggregate guide and the JSON catalogues", async () => {
    const resources = await listResources();

    expect(resources).toHaveLength(36);
    expect(new Set(resources.map((resource) => resource.uri)).size).toBe(36);

    const uris = resources.map((resource) => resource.uri);

    for (const excluded of [
      "https://m4t.tf/tags/testing",
      "https://m4t.tf/llms-full.txt",
      "https://m4t.tf/openapi.json",
      "https://m4t.tf/.well-known/api-catalog",
      "https://m4t.tf/.well-known/ard.json",
      "https://m4t.tf/.well-known/agent-skills/index.json",
      "https://m4t.tf/rss.xml",
      "https://m4t.tf/sitemap.xml",
      "https://m4t.tf/robots.txt",
    ]) {
      expect(uris).not.toContain(excluded);
    }
  });

  it("shapes each resource entry and annotates posts only", async () => {
    const resources = await listResources();

    const home = resources.find((resource) => resource.uri === "https://m4t.tf/");
    const post = resources.find((resource) => resource.uri === "https://m4t.tf/posts/post-1");
    const about = resources.find((resource) => resource.uri === "https://m4t.tf/about");

    expect(home).toMatchObject({
      uri: "https://m4t.tf/",
      name: "home",
      title: "Home",
      description: expect.any(String),
      mimeType: "text/markdown",
    });
    expect(home?.annotations).toBeUndefined();

    expect(post).toMatchObject({
      uri: "https://m4t.tf/posts/post-1",
      name: "posts/post-1",
      title: "Post 1",
      description: "Description 1",
      mimeType: "text/markdown",
      annotations: { lastModified: "2026-09-01T00:00:00.000Z" },
    });
    expect(post?.size).toBeUndefined();
    expect(post?.icons).toBeUndefined();

    expect(about?.annotations).toBeUndefined();
    expect(about?.size).toBeUndefined();
    expect(about?.icons).toBeUndefined();
  });

  it("derives stable path-based names for pages, guides and skills", async () => {
    const resources = await listResources();
    const names = new Map(resources.map((resource) => [resource.uri, resource.name]));

    expect(names.get("https://m4t.tf/")).toBe("home");
    expect(names.get("https://m4t.tf/posts/post-1")).toBe("posts/post-1");
    expect(names.get("https://m4t.tf/blog/llms.txt")).toBe("blog/llms.txt");
    expect(
      names.get("https://m4t.tf/.well-known/agent-skills/retrieve-site-content/SKILL.md"),
    ).toBe("agent-skills/retrieve-site-content");
  });

  it("carries cache hints on resources/list and resources/read", async () => {
    const listResponse = await handleMcp(
      requestFor(resourcesListBody(), { "Mcp-Method": "resources/list" }),
    );
    const listPayload = (await listResponse.json()) as {
      result: { ttlMs?: number; cacheScope?: string };
    };

    expect(listPayload.result.ttlMs).toBe(3600000);
    expect(listPayload.result.cacheScope).toBe("public");

    const readResponse = await handleMcp(readRequest("https://m4t.tf/about"));
    const readPayload = (await readResponse.json()) as ResourcePayload;

    expect(readPayload.result?.ttlMs).toBe(3600000);
    expect(readPayload.result?.cacheScope).toBe("public");
  });

  it("reads a Page as its markdown twin", async () => {
    const uri = "https://m4t.tf/about";
    const response = await handleMcp(readRequest(uri));
    const payload = (await response.json()) as ResourcePayload;
    const page = corpus.pages.find((candidate) => candidate.url === uri);

    expect(response.status).toBe(200);
    expect(payload.result?.contents).toEqual([
      { uri, mimeType: "text/markdown", text: page?.content },
    ]);
  });

  it("reads a text guide from its builder", async () => {
    const uri = "https://m4t.tf/llms.txt";
    const response = await handleMcp(readRequest(uri));
    const payload = (await response.json()) as ResourcePayload;

    expect(payload.result?.contents).toEqual([
      { uri, mimeType: "text/markdown", text: buildLlmsTxt() },
    ]);
  });

  it("reads an Agent Skill as its SKILL.md markdown", async () => {
    const uri = "https://m4t.tf/.well-known/agent-skills/retrieve-site-content/SKILL.md";
    const response = await handleMcp(readRequest(uri));
    const payload = (await response.json()) as ResourcePayload;

    expect(payload.result?.contents).toEqual([
      { uri, mimeType: "text/markdown", text: agentSkillMarkdown("retrieve-site-content") },
    ]);
  });

  it("answers an unknown resource URI with -32602 and no contents", async () => {
    const uri = "https://m4t.tf/does-not-exist";
    const response = await handleMcp(readRequest(uri));
    const payload = (await response.json()) as ResourcePayload;

    expect(payload.error?.code).toBe(-32602);
    expect(payload.result).toBeUndefined();
  });

  it("rejects .md-suffixed and trailing-slash URI variants", async () => {
    for (const uri of [
      "https://m4t.tf/about.md",
      "https://m4t.tf/about/",
      "https://m4t.tf/blog/llms.txt.md",
    ]) {
      const response = await handleMcp(readRequest(uri));
      const payload = (await response.json()) as ResourcePayload;

      expect(payload.error?.code).toBe(-32602);
      expect(payload.result).toBeUndefined();
    }
  });

  it("answers a missing MCP-Protocol-Version header with -32020", async () => {
    const request = requestFor(discoverBody());
    request.headers.delete("MCP-Protocol-Version");

    const response = await handleMcp(request);

    expect(response.status).toBe(400);
    expect(((await response.json()) as Payload).error?.code).toBe(-32020);
  });

  it("answers a missing Mcp-Method header with -32020", async () => {
    const request = requestFor(discoverBody());
    request.headers.delete("Mcp-Method");

    const response = await handleMcp(request);

    expect(response.status).toBe(400);
    expect(((await response.json()) as Payload).error?.code).toBe(-32020);
  });

  it("answers a tools/call without Mcp-Name with -32020", async () => {
    const response = await handleMcp(
      requestFor(callBody({ query: { text: "Who is Matt?" } }), { "Mcp-Method": "tools/call" }),
    );

    expect(response.status).toBe(400);
    expect(((await response.json()) as Payload).error?.code).toBe(-32020);
  });

  it("answers a tools/call whose Mcp-Name disagrees with the body with -32020", async () => {
    const response = await handleMcp(
      requestFor(callBody({ query: { text: "Who is Matt?" } }), {
        "Mcp-Method": "tools/call",
        "Mcp-Name": "other",
      }),
    );

    expect(response.status).toBe(400);
    expect(((await response.json()) as Payload).error?.code).toBe(-32020);
  });

  it("answers a resources/read without Mcp-Name with -32020", async () => {
    const response = await handleMcp(
      requestFor(resourcesReadBody("https://m4t.tf/about"), { "Mcp-Method": "resources/read" }),
    );

    expect(response.status).toBe(400);
    expect(((await response.json()) as Payload).error?.code).toBe(-32020);
  });

  it("answers a non-JSON Content-Type with 415", async () => {
    const response = await handleMcp(requestFor(discoverBody(), { "Content-Type": "text/plain" }));

    expect(response.status).toBe(415);
  });

  it("answers an oversize body with 413", async () => {
    const response = await handleMcp(requestFor("x".repeat(8 * 1024 * 1024)));

    expect(response.status).toBe(413);
  });
});
