import { problemResponse } from "@features/discovery/problems";
import { describe, expect, it } from "vite-plus/test";

function htmlNotFound(): Response {
  return new Response("<!doctype html><html><body><h1>Page not found</h1></body></html>", {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

describe("problemResponse", () => {
  it("renders a linked markdown problem for markdown clients", async () => {
    const response = problemResponse(htmlNotFound(), "text/markdown", "/__probe");

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toMatch(/^text\/markdown\b/);
    expect(response.headers.get("Vary")).toContain("Accept");

    const body = await response.text();
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain("Resource not found");
    expect(body).toContain("https://m4t.tf/llms.txt");
    expect(body).toContain("https://m4t.tf/developers");
  });

  it("lets an explicit markdown preference win over resource paths", async () => {
    const response = problemResponse(htmlNotFound(), "text/markdown", "/.well-known/missing");

    expect(response.headers.get("Content-Type")).toMatch(/^text\/markdown\b/);
  });

  it("renders an RFC 9457 problem document for JSON clients", async () => {
    const response = problemResponse(htmlNotFound(), "application/json", "/__probe");

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toMatch(/^application\/problem\+json\b/);

    const problem = (await response.json()) as { code: string; instance: string };
    expect(problem.code).toBe("RESOURCE_NOT_FOUND");
    expect(problem.instance).toBe("/__probe");
  });

  it("passes the HTML error page through to browsers", async () => {
    const response = problemResponse(
      htmlNotFound(),
      "text/html,application/xhtml+xml,*/*;q=0.8",
      "/__probe",
    );

    expect(response.headers.get("Content-Type")).toMatch(/^text\/html\b/);
    expect(await response.text()).toContain("Page not found");
  });

  it("passes the wildcard Accept header through to the HTML error page", async () => {
    const response = problemResponse(htmlNotFound(), "*/*", "/__probe");

    expect(response.headers.get("Content-Type")).toMatch(/^text\/html\b/);
  });
});
