import { incrementHits, readHits } from "@features/hits/hits-store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const blobs = vi.hoisted(() => ({
  get: vi.fn(),
  setJSON: vi.fn(),
}));

vi.mock("@netlify/blobs", () => ({
  getStore: vi.fn(() => blobs),
  getDeployStore: vi.fn(() => blobs),
}));

const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("hits store", () => {
  beforeEach(() => {
    vi.stubEnv("DEPLOY_ID", "");
    blobs.get.mockReset();
    blobs.setJSON.mockReset();
    blobs.setJSON.mockResolvedValue(undefined);
    warn.mockClear();
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

  it("falls back to zero when the store cannot be read", async () => {
    blobs.get.mockRejectedValue(new Error("offline"));

    await expect(readHits()).resolves.toBe(0);
    expect(warn).toHaveBeenCalled();
  });

  it("falls back to the last known count when the write fails", async () => {
    blobs.get.mockResolvedValue({ count: 7 });
    blobs.setJSON.mockRejectedValue(new Error("offline"));

    await expect(incrementHits()).resolves.toBe(7);
    expect(warn).toHaveBeenCalled();
  });
});
