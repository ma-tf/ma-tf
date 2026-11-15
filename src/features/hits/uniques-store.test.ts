import { countUniques, recordUnique, uniqueHash, utcDay } from "@features/hits/uniques-store";
import { beginRequest, runWith } from "@lib/wide-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const blobs = vi.hoisted(() => ({
  list: vi.fn(),
  set: vi.fn(),
}));

const stores = vi.hoisted(() => ({
  getDeployStore: vi.fn(),
  getStore: vi.fn(),
}));

vi.mock("@netlify/blobs", () => ({
  getDeployStore: stores.getDeployStore,
  getStore: stores.getStore,
}));

const options = { name: "uniques", consistency: "strong" };

function scoped() {
  return beginRequest(new Request("https://m4t.tf/api/hits"), {
    path: "/api/hits",
    method: "POST",
  });
}

describe("uniques store", () => {
  beforeEach(() => {
    vi.stubEnv("DEPLOY_ID", "");
    vi.stubEnv("RATE_LIMIT_SALT", "pepper");
    stores.getDeployStore.mockReset();
    stores.getStore.mockReset();
    stores.getDeployStore.mockReturnValue(blobs);
    stores.getStore.mockReturnValue(blobs);
    blobs.list.mockReset();
    blobs.set.mockReset();
    blobs.set.mockResolvedValue({ modified: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("records the hash under the current UTC day", async () => {
    await recordUnique("abc123");

    expect(blobs.set).toHaveBeenCalledWith(`unique:${utcDay()}:abc123`, "1", {
      onlyIfNew: true,
    });
    expect(stores.getDeployStore).toHaveBeenCalledWith(options);
  });

  it("writes the marker only when the key is absent", async () => {
    blobs.set.mockResolvedValue({ modified: false });

    await recordUnique("abc123");

    expect(blobs.set).toHaveBeenCalledWith(`unique:${utcDay()}:abc123`, "1", {
      onlyIfNew: true,
    });
  });

  it("counts the keys under the day's prefix", async () => {
    blobs.list.mockResolvedValue({
      blobs: [{ key: "unique:2026-11-14:a" }, { key: "unique:2026-11-14:b" }],
      directories: [],
    });

    await expect(countUniques("2026-11-14")).resolves.toBe(2);

    expect(blobs.list).toHaveBeenCalledWith({ prefix: "unique:2026-11-14:" });
  });

  it("returns zero and records the degradation when the store cannot be listed", async () => {
    blobs.list.mockRejectedValue(new Error("offline"));
    const event = scoped();

    await expect(runWith(event, () => countUniques("2026-11-14"))).resolves.toBe(0);
    expect(event.degraded).toEqual({ uniques: { reason: "count_failed", message: "offline" } });
  });

  it("swallows a failed write and records the degradation", async () => {
    blobs.set.mockRejectedValue(new Error("offline"));
    const event = scoped();

    await expect(runWith(event, () => recordUnique("abc123"))).resolves.toBeUndefined();
    expect(event.degraded).toEqual({ uniques: { reason: "write_failed", message: "offline" } });
  });

  it("hashes the forwarded address with the salt", () => {
    const request = new Request("https://m4t.tf/", {
      headers: { "cf-connecting-ip": "203.0.113.7" },
    });

    expect(uniqueHash(request)).toMatch(/^[\da-f]{64}$/);
  });

  it("skips and records the degradation without a client address", () => {
    const event = scoped();

    runWith(event, () => {
      expect(uniqueHash(new Request("https://m4t.tf/"))).toBeNull();
    });

    expect(event.degraded).toEqual({ uniques: { reason: "no_client_ip" } });
  });

  it("skips and records the degradation without a salt", () => {
    vi.stubEnv("RATE_LIMIT_SALT", "");
    const event = scoped();
    const request = new Request("https://m4t.tf/", {
      headers: { "cf-connecting-ip": "203.0.113.7" },
    });

    runWith(event, () => {
      expect(uniqueHash(request)).toBeNull();
    });

    expect(event.degraded).toEqual({ uniques: { reason: "no_salt" } });
  });
});
