import { GET, POST } from "@pages/api/hits";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const hits = vi.hoisted(() => ({
  incrementHits: vi.fn(),
  readHits: vi.fn(),
}));

const uniques = vi.hoisted(() => ({
  countUniques: vi.fn(),
  recordUnique: vi.fn(),
  uniqueHash: vi.fn(),
  utcDay: vi.fn(),
}));

const presence = vi.hoisted(() => ({
  countOnline: vi.fn(),
}));

vi.mock("@features/hits/hits-store", () => hits);
vi.mock("@features/hits/uniques-store", () => uniques);
vi.mock("@features/presence/presence-store", () => presence);

const today = "2026-11-14";

function postRequest(): Request {
  return new Request("https://m4t.tf/api/hits", { method: "POST" });
}

describe("hits endpoint", () => {
  beforeEach(() => {
    hits.incrementHits.mockReset();
    hits.readHits.mockReset();
    uniques.countUniques.mockReset();
    uniques.recordUnique.mockReset();
    uniques.uniqueHash.mockReset();
    uniques.utcDay.mockReset();
    presence.countOnline.mockReset();
    uniques.utcDay.mockReturnValue(today);
    uniques.countUniques.mockResolvedValue(0);
    uniques.recordUnique.mockResolvedValue(undefined);
    presence.countOnline.mockResolvedValue(0);
  });

  it("returns today's hits, uniques and online count", async () => {
    hits.readHits.mockResolvedValue(41);
    uniques.countUniques.mockResolvedValue(7);
    presence.countOnline.mockResolvedValue(3);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ hits: 41, uniques: 7, online: 3 });
    expect(uniques.countUniques).toHaveBeenCalledWith(today);
  });

  it("increments hits and records the day's unique", async () => {
    hits.incrementHits.mockResolvedValue(42);
    uniques.uniqueHash.mockReturnValue("abc123");

    const response = await POST({ request: postRequest() });

    expect(await response.json()).toEqual({ hits: 42 });
    expect(uniques.recordUnique).toHaveBeenCalledWith("abc123");
  });

  it("skips uniques when no hash can be derived", async () => {
    hits.incrementHits.mockResolvedValue(42);
    uniques.uniqueHash.mockReturnValue(null);

    const response = await POST({ request: postRequest() });

    expect(await response.json()).toEqual({ hits: 42 });
    expect(uniques.recordUnique).not.toHaveBeenCalled();
  });

  it("keeps the response when the unique write fails", async () => {
    hits.incrementHits.mockResolvedValue(42);
    uniques.uniqueHash.mockReturnValue("abc123");
    uniques.recordUnique.mockRejectedValue(new Error("offline"));

    const response = await POST({ request: postRequest() });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hits: 42 });
  });

  it("falls back to zero uniques when the count fails", async () => {
    hits.readHits.mockResolvedValue(41);
    uniques.countUniques.mockRejectedValue(new Error("offline"));

    const response = await GET();

    expect(await response.json()).toEqual({ hits: 41, uniques: 0, online: 0 });
  });

  it("falls back to zero online when the presence count fails", async () => {
    hits.readHits.mockResolvedValue(41);
    presence.countOnline.mockRejectedValue(new Error("offline"));

    const response = await GET();

    expect(await response.json()).toEqual({ hits: 41, uniques: 0, online: 0 });
  });
});
