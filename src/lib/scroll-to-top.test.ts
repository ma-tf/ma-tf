// @vitest-environment happy-dom
import { startScrollToTop } from "@lib/scroll-to-top";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const originalMatchMedia = window.matchMedia.bind(window);

function setReducedMotion(matches: boolean) {
  window.matchMedia = (query: string) => ({ matches, media: query }) as MediaQueryList;
}

function setPageHeight(content: number, viewport: number) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: content,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, "clientHeight", {
    value: viewport,
    configurable: true,
  });
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
  Reflect.deleteProperty(document.documentElement, "scrollHeight");
  Reflect.deleteProperty(document.documentElement, "clientHeight");
});

describe("startScrollToTop", () => {
  it("does nothing when the button is absent", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    expect(() => startScrollToTop()).not.toThrow();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("hides the button when the page fits the viewport", () => {
    setPageHeight(800, 800);
    const button = renderButton();

    startScrollToTop();

    expect(button.hidden).toBe(true);
  });

  it("shows the button when the page overflows the viewport", () => {
    setPageHeight(2000, 800);
    const button = renderButton();

    startScrollToTop();

    expect(button.hidden).toBe(false);
  });

  it("updates visibility when the page grows", () => {
    setPageHeight(800, 800);
    const button = renderButton();
    startScrollToTop();

    setPageHeight(2000, 800);
    window.dispatchEvent(new Event("resize"));

    expect(button.hidden).toBe(false);
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
