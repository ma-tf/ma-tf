import { applyCacheHeaders } from "@features/discovery/cache";
import { describe, expect, it } from "vite-plus/test";

function request(method = "GET"): Request {
  return new Request("https://m4t.tf/", { method });
}

function document(status = 200): Response {
  return new Response("<h1>Hello</h1>", {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

describe("applyCacheHeaders", () => {
  it("caches a GET document at the CDN and revalidates it in the browser", async () => {
    const response = applyCacheHeaders(document(), request());

    expect(response.headers.get("Cache-Control")).toBe("public, max-age=0, must-revalidate");
    expect(response.headers.get("Netlify-CDN-Cache-Control")).toContain("durable");
    expect(response.headers.get("Vary")).toContain("Accept");
    expect(await response.text()).toContain("Hello");
  });

  it("adds Accept to an existing Vary header without duplicating it", () => {
    const existing = new Response("ok", { headers: { Vary: "Accept-Encoding" } });

    const response = applyCacheHeaders(existing, request());

    expect(response.headers.get("Vary")).toBe("Accept-Encoding, Accept");
  });

  it("does not cache a non-GET request", () => {
    const response = applyCacheHeaders(document(), request("POST"));

    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Netlify-CDN-Cache-Control")).toBeNull();
  });

  it("does not cache an error response", () => {
    const response = applyCacheHeaders(document(404), request());

    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Netlify-CDN-Cache-Control")).toBeNull();
  });

  it("preserves unrelated headers", () => {
    const withLink = new Response("ok", { headers: { Link: "</llms.txt>" } });

    const response = applyCacheHeaders(withLink, request());

    expect(response.headers.get("Link")).toBe("</llms.txt>");
  });
});
