import {
  HOME_LOAD_MS,
  HOME_TITLE_COUNT,
  HOME_TITLE_FLICKER_MS,
  HOME_TITLE_START_MS,
  HOME_TITLE_STEP_MS,
  homeLoadDelay,
  startAfterHomeLoad,
} from "@lib/home-load";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

function mockReduced(matches: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) => ({ matches, media: query }) as unknown as MediaQueryList,
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete document.documentElement.dataset.motion;
});

describe("home load", () => {
  it("ends when the last title has finished flickering", () => {
    const lastStart = HOME_TITLE_START_MS + (HOME_TITLE_COUNT - 1) * HOME_TITLE_STEP_MS;
    expect(HOME_LOAD_MS).toBe(lastStart + HOME_TITLE_FLICKER_MS);
  });

  it("waits for the whole sequence by default", () => {
    mockReduced(false);
    vi.useFakeTimers();
    const start = vi.fn();
    startAfterHomeLoad(start);
    vi.advanceTimersByTime(HOME_LOAD_MS - 1);
    expect(start).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(start).toHaveBeenCalledOnce();
  });

  it("starts immediately under reduced motion", () => {
    mockReduced(true);
    const start = vi.fn();
    startAfterHomeLoad(start);
    expect(start).toHaveBeenCalledOnce();
  });

  it("starts immediately on a revisit or skip", () => {
    mockReduced(false);
    document.documentElement.dataset.motion = "revisit";
    expect(homeLoadDelay()).toBe(0);
  });
});
