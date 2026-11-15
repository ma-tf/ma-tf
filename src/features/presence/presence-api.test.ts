import { POST } from "@pages/api/presence";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const presence = vi.hoisted(() => ({
  recordPresence: vi.fn(),
}));

const hashes = vi.hoisted(() => ({
  visitorHash: vi.fn(),
}));

vi.mock("@features/presence/presence-store", () => presence);
vi.mock("@lib/visitor-hash", () => hashes);

function request(): Request {
  return new Request("https://m4t.tf/api/presence", { method: "POST" });
}

describe("presence endpoint", () => {
  beforeEach(() => {
    presence.recordPresence.mockReset();
    presence.recordPresence.mockResolvedValue(undefined);
    hashes.visitorHash.mockReset();
  });

  it("records the visitor and answers 204 without caching", async () => {
    hashes.visitorHash.mockReturnValue("abc123");

    const response = await POST({ request: request() });

    expect(response.status).toBe(204);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(hashes.visitorHash).toHaveBeenCalledWith(expect.any(Request), "presence");
    expect(presence.recordPresence).toHaveBeenCalledWith("abc123");
  });

  it("answers 204 without recording when no hash can be derived", async () => {
    hashes.visitorHash.mockReturnValue(null);

    const response = await POST({ request: request() });

    expect(response.status).toBe(204);
    expect(presence.recordPresence).not.toHaveBeenCalled();
  });
});
