// @vitest-environment happy-dom
import { startScrollToTop } from "@lib/scroll-to-top";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const originalMatchMedia = window.matchMedia.bind(window);

function setReducedMotion(matches: boolean) {
  window.matchMedia = (query: string) => ({ matches, media: query }) as MediaQueryList;
}

function renderButton() {
  document.body.insertAdjacentHTML(
    "beforeend",
    '<button type="button" data-scroll-to-top></button>',
  );
  const button = document.querySelector<HTMLElement>("[data-scroll-to-top]");
  if (!button) throw new Error("scroll-to-top button missing");
  return button;
}

beforeEach(() => {
  document.body.innerHTML = "";
  setReducedMotion(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
});

describe("startScrollToTop", () => {
  it("does nothing when the button is absent", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    expect(() => startScrollToTop()).not.toThrow();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("scrolls to the top smoothly on click", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const button = renderButton();

    startScrollToTop();
    button.click();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("scrolls instantly when reduced motion is preferred", () => {
    setReducedMotion(true);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const button = renderButton();

    startScrollToTop();
    button.click();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });
});
