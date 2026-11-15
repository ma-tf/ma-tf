import { countOnline, recordPresence } from "@features/presence/presence-store";
import { beginRequest, runWith } from "@lib/wide-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const blobs = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  list: vi.fn(),
  setJSON: vi.fn(),
}));

const stores = vi.hoisted(() => ({
  getDeployStore: vi.fn(),
  getStore: vi.fn(),
}));

vi.mock("@netlify/blobs", () => ({
  getDeployStore: stores.getDeployStore,
  getStore: stores.getStore,
}));

const options = { name: "presence", consistency: "strong" };
const now = 1_000_000;

function scoped() {
  return beginRequest(new Request("https://m4t.tf/api/hits"), {
    path: "/api/hits",
    method: "GET",
  });
}

describe("presence store", () => {
  beforeEach(() => {
    vi.stubEnv("DEPLOY_ID", "");
    stores.getDeployStore.mockReset();
    stores.getStore.mockReset();
    stores.getDeployStore.mockReturnValue(blobs);
    stores.getStore.mockReturnValue(blobs);
    for (const mock of Object.values(blobs)) {
      mock.mockReset();
    }
    blobs.setJSON.mockResolvedValue(undefined);
    blobs.delete.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("records the hash with the current time", async () => {
    await recordPresence("abc123");

    expect(blobs.setJSON).toHaveBeenCalledWith("presence:abc123", {
      lastSeen: expect.any(Number),
    });
    expect(stores.getDeployStore).toHaveBeenCalledWith(options);
  });

  it("counts entries inside the window and deletes the rest", async () => {
    blobs.list.mockResolvedValue({
      blobs: [{ key: "presence:fresh" }, { key: "presence:stale" }, { key: "presence:missing" }],
      directories: [],
    });
    blobs.get.mockImplementation(async (key: string) => {
      if (key === "presence:fresh") return { lastSeen: now - 30_000 };
      if (key === "presence:stale") return { lastSeen: now - 120_000 };

      return null;
    });

    await expect(countOnline(now)).resolves.toBe(1);

    expect(blobs.list).toHaveBeenCalledWith({ prefix: "presence:" });
    expect(blobs.delete).toHaveBeenCalledWith("presence:stale");
    expect(blobs.delete).toHaveBeenCalledWith("presence:missing");
  });

  it("returns zero and records the degradation when the store cannot be listed", async () => {
    blobs.list.mockRejectedValue(new Error("offline"));
    const event = scoped();

    await expect(runWith(event, () => countOnline(now))).resolves.toBe(0);
    expect(event.degraded).toEqual({ presence: { reason: "count_failed", message: "offline" } });
  });

  it("swallows a failed write and records the degradation", async () => {
    blobs.setJSON.mockRejectedValue(new Error("offline"));
    const event = scoped();

    await expect(runWith(event, () => recordPresence("abc123"))).resolves.toBeUndefined();
    expect(event.degraded).toEqual({ presence: { reason: "write_failed", message: "offline" } });
  });
});
