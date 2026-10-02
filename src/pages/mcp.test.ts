import type { APIContext } from "astro";

import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { POST } from "@/src/pages/mcp";

const handleMcp = vi.hoisted(() => vi.fn(async () => new Response(null, { status: 200 })));

vi.mock("@lib/feature-flags", () => ({ askEnabled: true }));
vi.mock("@features/mcp/handle-mcp", () => ({ handleMcp }));

function context(init: { url?: string; host?: string; origin?: string } = {}): APIContext {
  const url = new URL(init.url ?? "https://m4t.tf/mcp");
  const request = new Request(url, {
    method: "POST",
    headers: {
      ...(init.host ? { host: init.host } : {}),
      ...(init.origin ? { origin: init.origin } : {}),
    },
  });

  return { request } as unknown as APIContext;
}

beforeEach(() => {
  handleMcp.mockClear();
});

describe("POST /mcp", () => {
  it("serves a request from the canonical host", async () => {
    const response = await POST(context({ host: "m4t.tf" }));

    expect(response.status).toBe(200);
    expect(handleMcp).toHaveBeenCalledOnce();
  });

  it("allows localhost during development", async () => {
    const response = await POST(
      context({ url: "http://localhost:4321/mcp", host: "localhost:4321" }),
    );

    expect(response.status).toBe(200);
  });

  it("rejects a foreign host with 403", async () => {
    const response = await POST(context({ host: "evil.example" }));

    expect(response.status).toBe(403);
    expect(handleMcp).not.toHaveBeenCalled();
  });

  it("rejects a foreign origin with 403", async () => {
    const response = await POST(context({ host: "m4t.tf", origin: "https://evil.example" }));

    expect(response.status).toBe(403);
    expect(handleMcp).not.toHaveBeenCalled();
  });

  it("allows the canonical origin", async () => {
    const response = await POST(context({ host: "m4t.tf", origin: "https://m4t.tf" }));

    expect(response.status).toBe(200);
  });
});
