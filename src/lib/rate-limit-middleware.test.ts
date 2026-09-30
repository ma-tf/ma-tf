import { advanceWindow, clientKey } from "@lib/rate-limit-middleware";
import { askRateLimit } from "@lib/rate-limits";
import { describe, expect, it } from "vite-plus/test";

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
