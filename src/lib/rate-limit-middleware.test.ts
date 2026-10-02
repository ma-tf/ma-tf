import { advanceWindow, clientIp, clientKey, store } from "@lib/rate-limit-middleware";
import { askRateLimit } from "@lib/rate-limits";
import { getDeployStore, getStore } from "@netlify/blobs";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("@netlify/blobs", () => ({
  getStore: vi.fn(),
  getDeployStore: vi.fn(),
}));

const getStoreMock = vi.mocked(getStore);
const getDeployStoreMock = vi.mocked(getDeployStore);

const windowMs = askRateLimit.windowSeconds * 1000;
const start = 1_000_000;

describe("advanceWindow", () => {
  it("allows the first request and starts a window", () => {
    expect(advanceWindow(null, start, askRateLimit)).toEqual({
      allowed: true,
      entry: { count: 1, windowStart: start },
      retryAfter: 0,
    });
  });

  it("increments requests inside the window", () => {
    expect(advanceWindow({ count: 3, windowStart: start }, start + 1000, askRateLimit)).toEqual({
      allowed: true,
      entry: { count: 4, windowStart: start },
      retryAfter: 0,
    });
  });

  it("allows the last request in the window and refuses the next", () => {
    const allowed = advanceWindow(
      { count: askRateLimit.quota - 1, windowStart: start },
      start + 1000,
      askRateLimit,
    );

    expect(allowed.allowed).toBe(true);
    expect(allowed.entry.count).toBe(askRateLimit.quota);

    const refused = advanceWindow(allowed.entry, start + 1000, askRateLimit);

    expect(refused.allowed).toBe(false);
    expect(refused.retryAfter).toBe(Math.ceil((windowMs - 1000) / 1000));
  });

  it("starts a new window once the old one expires", () => {
    expect(
      advanceWindow(
        { count: askRateLimit.quota, windowStart: start },
        start + windowMs,
        askRateLimit,
      ),
    ).toEqual({
      allowed: true,
      entry: { count: 1, windowStart: start + windowMs },
      retryAfter: 0,
    });
  });
});

describe("clientKey", () => {
  it("is stable for one client and different across clients", () => {
    expect(clientKey("203.0.113.7", "salt")).toBe(clientKey("203.0.113.7", "salt"));
    expect(clientKey("203.0.113.7", "salt")).not.toBe(clientKey("203.0.113.8", "salt"));
  });
});

describe("clientIp", () => {
  it("prefers the visitor address Cloudflare forwards", () => {
    const request = new Request("https://m4t.tf/ask", {
      headers: {
        "cf-connecting-ip": "203.0.113.7",
        "x-nf-client-connection-ip": "198.51.100.9",
        "x-forwarded-for": "203.0.113.8",
      },
    });

    expect(clientIp(request)).toBe("203.0.113.7");
  });

  it("falls back to the Netlify connection address", () => {
    const request = new Request("https://m4t.tf/ask", {
      headers: {
        "x-nf-client-connection-ip": "198.51.100.9",
        "x-forwarded-for": "203.0.113.8",
      },
    });

    expect(clientIp(request)).toBe("198.51.100.9");
  });

  it("falls back to the first forwarded address", () => {
    const request = new Request("https://m4t.tf/ask", {
      headers: { "x-forwarded-for": " 203.0.113.8 , 10.0.0.1" },
    });

    expect(clientIp(request)).toBe("203.0.113.8");
  });

  it("returns undefined when no address header is present", () => {
    expect(clientIp(new Request("https://m4t.tf/ask"))).toBeUndefined();
  });
});

describe("store", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    getStoreMock.mockClear();
    getDeployStoreMock.mockClear();
  });

  it("uses the global store for a deployed function", () => {
    vi.stubEnv("DEPLOY_ID", "deploy-123");

    store(askRateLimit);

    expect(getStoreMock).toHaveBeenCalledWith({
      name: `rate-limit-${askRateLimit.name}`,
      consistency: "strong",
    });
    expect(getDeployStoreMock).not.toHaveBeenCalled();
  });

  it("uses the deploy store outside a deploy", () => {
    vi.stubEnv("DEPLOY_ID", "");

    store(askRateLimit);

    expect(getDeployStoreMock).toHaveBeenCalledWith({
      name: `rate-limit-${askRateLimit.name}`,
      consistency: "strong",
    });
    expect(getStoreMock).not.toHaveBeenCalled();
  });
});
