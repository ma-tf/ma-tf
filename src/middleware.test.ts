import type { APIContext, MiddlewareNext } from "astro";

import { describe, expect, it } from "vite-plus/test";

import { onRequest } from "@/src/middleware";

const html = "<!doctype html><html><body><h1>Hello</h1></body></html>";

type ContextInit = {
  accept?: string;
  method?: string;
  isPrerendered?: boolean;
};

function buildContext(pathname: string, init: ContextInit = {}): APIContext {
  const url = new URL(pathname, "https://m4t.tf");
  const request = new Request(url, {
    method: init.method ?? "GET",
    headers: init.accept ? { Accept: init.accept } : {},
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
  it("applies the discovery and rate-limit headers to every response", async () => {
    const response = await onRequest(buildContext("/"), next);

    expect(response.headers.get("Link")).toContain('rel="service-doc"');
    expect(response.headers.get("Link")).toContain("/llms.txt");
    expect(response.headers.get("RateLimit-Policy")).toBe('"m4t";q=600;w=60');
    expect(response.headers.get("RateLimit-Limit")).toBe("600");
    expect(response.headers.get("RateLimit-Reset")).toBe("60");
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
});
