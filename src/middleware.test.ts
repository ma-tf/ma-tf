import type { APIContext, MiddlewareNext } from "astro";

import { enforceRateLimit } from "@lib/rate-limit-middleware";
import { deferEmission } from "@lib/wide-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { onRequest } from "@/src/middleware";

vi.mock("@lib/rate-limit-middleware", () => ({ enforceRateLimit: vi.fn() }));

const enforce = vi.mocked(enforceRateLimit);

beforeEach(() => {
  enforce.mockResolvedValue({ limited: null, headers: new Headers() });
});

const html = "<!doctype html><html><body><h1>Hello</h1></body></html>";

type ContextInit = {
  accept?: string;
  method?: string;
  isPrerendered?: boolean;
  headers?: Record<string, string>;
  body?: unknown;
};

function buildContext(pathname: string, init: ContextInit = {}): APIContext {
  const url = new URL(pathname, "https://m4t.tf");
  const request = new Request(url, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: {
      ...(init.accept ? { Accept: init.accept } : {}),
      ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });

  return { isPrerendered: init.isPrerendered ?? false, url, request } as unknown as APIContext;
}

function htmlResponse(status = 200): Response {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const next: MiddlewareNext = async () => htmlResponse();

describe("onRequest", () => {
  it("applies the discovery headers to every response", async () => {
    const response = await onRequest(buildContext("/"), next);

    expect(response.headers.get("Link")).toContain('rel="service-doc"');
    expect(response.headers.get("Link")).toContain("/llms.txt");
  });

  it("serves HTML to a browser", async () => {
    const response = await onRequest(buildContext("/", { accept: "text/html" }), next);

    expect(response.headers.get("Content-Type")).toMatch(/^text\/html\b/);
    expect(await response.text()).toContain("Hello");
  });

  it("renders a page as markdown when the client prefers markdown", async () => {
    const response = await onRequest(buildContext("/about", { accept: "text/markdown" }), next);

    expect(response.headers.get("Content-Type")).toMatch(/^text\/markdown\b/);
    expect(response.headers.get("Vary")).toContain("Accept");
    expect(await response.text()).toContain("Hello");
  });

  it("serves a resource's markdown twin for a .md suffix", async () => {
    const response = await onRequest(buildContext("/llms.txt.md"), next);

    expect(response.headers.get("Content-Type")).toMatch(/^text\/markdown\b/);
    expect(await response.text()).toContain("# Agent site guide");
  });

  it("serves a resource's JSON descriptor when the client prefers JSON", async () => {
    const response = await onRequest(
      buildContext("/llms.txt", { accept: "application/json" }),
      next,
    );

    expect(response.headers.get("Content-Type")).toMatch(/^application\/json\b/);
    expect(response.headers.get("Vary")).toContain("Accept");

    const descriptor = (await response.json()) as { path: string; mediaType: string };
    expect(descriptor.path).toBe("/llms.txt");
    expect(descriptor.mediaType).toBe("text/plain");
  });

  it("serves a JSON resource as application/json when the client prefers JSON", async () => {
    const response = await onRequest(
      buildContext("/openapi.json", { accept: "application/json" }),
      next,
    );

    expect(response.headers.get("Content-Type")).toMatch(/^application\/json\b/);
    expect(response.headers.get("Vary")).toContain("Accept");
  });

  it("markdown-ifies a normal page for a .md suffix", async () => {
    const response = await onRequest(buildContext("/about.md"), next);

    expect(response.headers.get("Content-Type")).toMatch(/^text\/markdown\b/);
    expect(await response.text()).toContain("Hello");
  });

  it("leaves agent skill artifacts untouched", async () => {
    const response = await onRequest(
      buildContext("/.well-known/agent-skills/retrieve-site-content/SKILL.md", {
        accept: "text/markdown",
      }),
      next,
    );

    expect(response.headers.get("Content-Type")).toMatch(/^text\/html\b/);
    expect(await response.text()).toContain("Hello");
  });

  it("skips negotiation for prerendered routes", async () => {
    const response = await onRequest(
      buildContext("/about", { accept: "text/markdown", isPrerendered: true }),
      next,
    );

    expect(response.headers.get("Content-Type")).toMatch(/^text\/html\b/);
  });

  it("rejects a non-GET request to a resource with an RFC 9457 problem", async () => {
    const response = await onRequest(
      buildContext("/llms.txt", { method: "POST", accept: "application/json" }),
      next,
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("Content-Type")).toMatch(/^application\/problem\+json\b/);
    expect(response.headers.get("Allow")).toBe("GET, HEAD");

    const problem = (await response.json()) as { code: string };
    expect(problem.code).toBe("METHOD_NOT_ALLOWED");
  });

  it("wraps an error response as a problem document for JSON clients", async () => {
    const notFound: MiddlewareNext = async () => htmlResponse(404);
    const response = await onRequest(
      buildContext("/__probe", { accept: "application/json" }),
      notFound,
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toMatch(/^application\/problem\+json\b/);

    const problem = (await response.json()) as { code: string; instance: string };
    expect(problem.code).toBe("RESOURCE_NOT_FOUND");
    expect(problem.instance).toBe("/__probe");
  });

  it("wraps an error response as a problem document for a wildcard Accept", async () => {
    const notFound: MiddlewareNext = async () => htmlResponse(404);
    const response = await onRequest(buildContext("/__probe", { accept: "*/*" }), notFound);

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toMatch(/^application\/problem\+json\b/);

    const problem = (await response.json()) as { code: string };
    expect(problem.code).toBe("RESOURCE_NOT_FOUND");
  });

  it("still serves HTML to a wildcard client on a success response", async () => {
    const response = await onRequest(buildContext("/", { accept: "*/*" }), next);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/^text\/html\b/);
    expect(await response.text()).toContain("Hello");
  });

  it("leaves an API endpoint's response untouched", async () => {
    const response = await onRequest(buildContext("/ask", { accept: "text/event-stream" }), next);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/^text\/html\b/);
    expect(response.headers.get("Link")).toBeNull();
  });

  it("returns the endpoint's 429 without the site headers", async () => {
    enforce.mockResolvedValue({
      limited: new Response(null, { status: 429, headers: { "Retry-After": "12" } }),
      headers: new Headers(),
    });

    const response = await onRequest(buildContext("/ask"), next);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("12");
    expect(response.headers.get("Link")).toBeNull();
  });

  it("meters the ask tool on /mcp", async () => {
    const response = await onRequest(
      buildContext("/mcp", { headers: { "Mcp-Method": "tools/call", "Mcp-Name": "ask" } }),
      next,
    );

    expect(enforce).toHaveBeenCalledOnce();
    expect(response.headers.get("Link")).toBeNull();
  });

  it("does not meter the free /mcp methods", async () => {
    await onRequest(buildContext("/mcp", { headers: { "Mcp-Method": "tools/list" } }), next);
    await onRequest(buildContext("/mcp", { headers: { "Mcp-Method": "server/discover" } }), next);
    await onRequest(
      buildContext("/mcp", { headers: { "Mcp-Method": "resources/read", "Mcp-Name": "home" } }),
      next,
    );

    expect(enforce).not.toHaveBeenCalled();
  });

  it("returns /mcp's 429 with the ask bucket headers and no body", async () => {
    enforce.mockResolvedValue({
      limited: new Response(null, {
        status: 429,
        headers: { "Retry-After": "12", "RateLimit-Limit": "20" },
      }),
      headers: new Headers(),
    });

    const response = await onRequest(
      buildContext("/mcp", { headers: { "Mcp-Method": "tools/call", "Mcp-Name": "ask" } }),
      next,
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("12");
    expect(response.headers.get("RateLimit-Limit")).toBe("20");
    expect(await response.text()).toBe("");
  });

  it("meters the ask tool when Mcp-Name uses the Base64 sentinel", async () => {
    const response = await onRequest(
      buildContext("/mcp", {
        headers: { "Mcp-Method": "tools/call", "Mcp-Name": "=?base64?YXNr?=" },
      }),
      next,
    );

    expect(enforce).toHaveBeenCalledOnce();
    expect(response.headers.get("Link")).toBeNull();
  });

  it("does not meter a different tool sent through the sentinel", async () => {
    await onRequest(
      buildContext("/mcp", {
        headers: { "Mcp-Method": "tools/call", "Mcp-Name": "=?base64?b3RoZXI=?=" },
      }),
      next,
    );

    expect(enforce).not.toHaveBeenCalled();
  });

  it("meters a legacy ask tools/call without Mcp headers", async () => {
    const response = await onRequest(
      buildContext("/mcp", {
        body: {
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: { name: "ask", arguments: { query: { text: "Who is Matt?" } } },
        },
      }),
      next,
    );

    expect(enforce).toHaveBeenCalledOnce();
    expect(response.headers.get("Link")).toBeNull();
  });

  it("does not meter a legacy initialize handshake", async () => {
    await onRequest(
      buildContext("/mcp", {
        body: {
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2025-06-18",
            capabilities: {},
            clientInfo: { name: "legacy", version: "0.0" },
          },
        },
      }),
      next,
    );

    expect(enforce).not.toHaveBeenCalled();
  });

  it("does not meter a legacy tools/call for another tool", async () => {
    await onRequest(
      buildContext("/mcp", {
        body: {
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: { name: "other", arguments: {} },
        },
      }),
      next,
    );

    expect(enforce).not.toHaveBeenCalled();
  });

  it("still rejects an unrepresentable Accept for a non-API path", async () => {
    const response = await onRequest(buildContext("/about", { accept: "text/event-stream" }), next);

    expect(response.status).toBe(406);
    expect(response.headers.get("Content-Type")).toMatch(/^application\/problem\+json\b/);
  });
});

describe("wide event emission", () => {
  function parseEvents(log: { mock: { calls: unknown[][] } }): Record<string, unknown>[] {
    return log.mock.calls.map(([line]) => JSON.parse(String(line)) as Record<string, unknown>);
  }

  it("emits exactly one event for an API path", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const response = await onRequest(buildContext("/ask", { method: "POST" }), next);

    expect(response.status).toBe(200);

    const events = parseEvents(log);
    expect(events).toHaveLength(1);
    expect(events[0]?.path).toBe("/ask");
    expect(events[0]?.status_code).toBe(200);

    log.mockRestore();
  });

  it("does not emit for a successful non-API response", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await onRequest(buildContext("/"), next);

    expect(log).not.toHaveBeenCalled();

    log.mockRestore();
  });

  it("emits an event for a non-API 404", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const notFound: MiddlewareNext = async () => htmlResponse(404);

    const response = await onRequest(
      buildContext("/__probe", { accept: "application/json" }),
      notFound,
    );

    expect(response.status).toBe(404);

    const events = parseEvents(log);
    expect(events).toHaveLength(1);
    expect(events[0]?.status_code).toBe(404);
    expect(events[0]?.outcome).toBeUndefined();

    log.mockRestore();
  });

  it("logs the deferred response when its body ends", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const deferred: MiddlewareNext = async () => {
      deferEmission();
      return new Response("data: {}\n\n", {
        headers: { "Content-Type": "text/event-stream" },
      });
    };

    const response = await onRequest(buildContext("/ask", { method: "POST" }), deferred);

    expect(log).not.toHaveBeenCalled();

    await response.text();

    expect(log).toHaveBeenCalledOnce();

    const line = JSON.parse(String((log.mock.calls[0] as unknown[])[0])) as Record<string, unknown>;

    expect(line.status_code).toBe(200);

    log.mockRestore();
  });
});
