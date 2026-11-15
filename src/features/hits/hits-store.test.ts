import { incrementHits, readHits } from "@features/hits/hits-store";
import { beginRequest, runWith } from "@lib/wide-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const blobs = vi.hoisted(() => ({
  get: vi.fn(),
  setJSON: vi.fn(),
}));

vi.mock("@netlify/blobs", () => ({
  getStore: vi.fn(() => blobs),
  getDeployStore: vi.fn(() => blobs),
}));

function scoped() {
  return beginRequest(new Request("https://m4t.tf/api/hits"), {
    path: "/api/hits",
    method: "POST",
  });
}

describe("hits store", () => {
  beforeEach(() => {
    vi.stubEnv("DEPLOY_ID", "");
    blobs.get.mockReset();
    blobs.setJSON.mockReset();
    blobs.setJSON.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns zero for a missing key", async () => {
    blobs.get.mockResolvedValue(null);

    await expect(readHits()).resolves.toBe(0);
  });

  it("writes and returns the incremented count", async () => {
    blobs.get.mockResolvedValue({ count: 41 });

    await expect(incrementHits()).resolves.toBe(42);

    expect(blobs.get).toHaveBeenCalledWith("total", { type: "json" });
    expect(blobs.setJSON).toHaveBeenCalledWith("total", { count: 42 });
  });

  it("falls back to zero and records the degradation when the store cannot be read", async () => {
    blobs.get.mockRejectedValue(new Error("offline"));
    const event = scoped();

    await expect(runWith(event, () => readHits())).resolves.toBe(0);
    expect(event.degraded).toEqual({ hits: { reason: "read_failed", message: "offline" } });
  });

  it("falls back to the last known count and records the degradation when the write fails", async () => {
    blobs.get.mockResolvedValue({ count: 7 });
    blobs.setJSON.mockRejectedValue(new Error("offline"));
    const event = scoped();

    await expect(runWith(event, () => incrementHits())).resolves.toBe(7);
    expect(event.degraded).toEqual({ hits: { reason: "increment_failed", message: "offline" } });
  });
});
