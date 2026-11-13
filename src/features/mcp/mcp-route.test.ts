import type { APIContext } from "astro";

import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { POST } from "@/src/pages/mcp";

const handleMcp = vi.hoisted(() => vi.fn(async () => new Response(null, { status: 200 })));
const flags = vi.hoisted(() => ({ askEnabled: true }));

vi.mock("@lib/feature-flags", () => flags);
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
  flags.askEnabled = true;
});

describe("POST /mcp", () => {
  it("answers 404 when the ask flag is off", async () => {
    flags.askEnabled = false;

    const response = await POST(context({ host: "m4t.tf" }));

    expect(response.status).toBe(404);
    expect(handleMcp).not.toHaveBeenCalled();
  });

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

  it("delegates the request to handleMcp", async () => {
    const ctx = context({ host: "m4t.tf" });

    await POST(ctx);

    expect(handleMcp).toHaveBeenCalledWith(ctx.request);
  });
});
