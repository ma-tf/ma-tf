// @vitest-environment happy-dom
import { startBlogScroll } from "@lib/blog-scroll";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

const originalMatchMedia = window.matchMedia.bind(window);
const MAX_SCROLL = 600;

function setDesktop(matches: boolean) {
  window.matchMedia = (query: string) => ({ matches, media: query }) as MediaQueryList;
}

function setScrollMetrics(element: HTMLElement, scrollHeight: number, clientHeight: number) {
  Object.defineProperty(element, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(element, "clientHeight", { configurable: true, value: clientHeight });
}

function createPage({ overflow = true } = {}) {
  const shell = document.createElement("div");
  shell.setAttribute("data-blog-scroll", "");
  const pane = document.createElement("div");
  pane.setAttribute("data-blog-scroll-target", "");
  shell.append(pane);

  let scrollTop = 0;
  setScrollMetrics(pane, overflow ? 1000 : 400, 400);
  Object.defineProperty(pane, "scrollTop", {
    configurable: true,
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = Math.max(0, Math.min(value, MAX_SCROLL));
    },
  });

  document.body.append(shell);
  return { shell, pane };
}

function wheel(target: EventTarget, init: WheelEventInit = {}) {
  const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 100, ...init });
  target.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  document.body.innerHTML = "";
  setDesktop(true);
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe("startBlogScroll", () => {
  it("does nothing when the shell or pane is absent", () => {
    expect(() => startBlogScroll()).not.toThrow();
  });

  it("scrolls the pane from a wheel over the shell", () => {
    const { shell, pane } = createPage();

    startBlogScroll();
    const event = wheel(shell);

    expect(pane.scrollTop).toBe(100);
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves a wheel inside the pane to the browser", () => {
    const { pane } = createPage();
    const link = document.createElement("a");
    pane.append(link);

    startBlogScroll();
    const event = wheel(link);

    expect(pane.scrollTop).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("does nothing below the desktop breakpoint", () => {
    setDesktop(false);
    const { shell, pane } = createPage();

    startBlogScroll();
    const event = wheel(shell);

    expect(pane.scrollTop).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("does nothing when the pane does not overflow", () => {
    const { shell, pane } = createPage({ overflow: false });

    startBlogScroll();
    const event = wheel(shell);

    expect(pane.scrollTop).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("does nothing for a horizontal-only wheel", () => {
    const { shell, pane } = createPage();

    startBlogScroll();
    const event = wheel(shell, { deltaY: 0, deltaX: 100 });

    expect(pane.scrollTop).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("does nothing for a pinch gesture", () => {
    const { shell, pane } = createPage();

    startBlogScroll();
    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 100 });
    Object.defineProperty(event, "ctrlKey", { value: true });
    shell.dispatchEvent(event);

    expect(pane.scrollTop).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("scales line deltas to pixels", () => {
    const { shell, pane } = createPage();

    startBlogScroll();
    wheel(shell, { deltaMode: 1, deltaY: 3 });

    expect(pane.scrollTop).toBe(48);
  });

  it("scales page deltas to the pane height", () => {
    const { shell, pane } = createPage();

    startBlogScroll();
    wheel(shell, { deltaMode: 2, deltaY: 1 });

    expect(pane.scrollTop).toBe(400);
  });

  it("lets the wheel through once the pane is at its end", () => {
    const { shell, pane } = createPage();

    startBlogScroll();
    wheel(shell, { deltaY: MAX_SCROLL });
    const event = wheel(shell);

    expect(pane.scrollTop).toBe(MAX_SCROLL);
    expect(event.defaultPrevented).toBe(false);
  });
});
