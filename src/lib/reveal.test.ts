import { startReveal } from "@lib/reveal";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

function fakeElement() {
  const classes = new Set<string>();
  return {
    classList: {
      add: (name: string) => {
        classes.add(name);
      },
      contains: (name: string) => classes.has(name),
    },
  };
}

type Fake = ReturnType<typeof fakeElement>;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("startReveal without IntersectionObserver", () => {
  it("reveals every match at once", () => {
    const first = fakeElement();
    const second = fakeElement();
    vi.stubGlobal("document", { querySelectorAll: () => [first, second] });
    vi.stubGlobal("window", {});

    startReveal();

    expect(first.classList.contains("is-revealed")).toBe(true);
    expect(second.classList.contains("is-revealed")).toBe(true);
  });
});

describe("startReveal with IntersectionObserver", () => {
  function setup() {
    const first = fakeElement();
    const second = fakeElement();
    let callback: ((entries: Array<{ isIntersecting: boolean; target: Fake }>) => void) | undefined;
    let options: IntersectionObserverInit | undefined;
    const observed: Array<Fake> = [];
    const unobserved: Array<Fake> = [];
    class FakeObserver {
      constructor(
        next: (entries: Array<{ isIntersecting: boolean; target: Fake }>) => void,
        init?: IntersectionObserverInit,
      ) {
        callback = next;
        options = init;
      }
      observe(target: Fake) {
        observed.push(target);
      }
      unobserve(target: Fake) {
        unobserved.push(target);
      }
    }
    vi.stubGlobal("document", { querySelectorAll: () => [first, second] });
    vi.stubGlobal("window", { IntersectionObserver: FakeObserver });
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    return {
      first,
      second,
      observed,
      unobserved,
      fire: (entries: Array<{ isIntersecting: boolean; target: Fake }>) => callback?.(entries),
      options: () => options,
    };
  }

  it("observes with the reveal margin and threshold", () => {
    const harness = setup();

    startReveal();

    expect(harness.options()).toEqual({ rootMargin: "0px 0px -25% 0px", threshold: 0.15 });
    expect(harness.observed).toEqual([harness.first, harness.second]);
  });

  it("reveals once on first intersection and ignores the rest", () => {
    const harness = setup();

    startReveal();
    harness.fire([{ isIntersecting: false, target: harness.second }]);

    expect(harness.second.classList.contains("is-revealed")).toBe(false);

    harness.fire([{ isIntersecting: true, target: harness.first }]);

    expect(harness.first.classList.contains("is-revealed")).toBe(true);
    expect(harness.unobserved).toEqual([harness.first]);
  });
});
