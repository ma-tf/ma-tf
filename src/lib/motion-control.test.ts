// @vitest-environment happy-dom
import { startMotionControl } from "@lib/motion-control";
import { TYPEWRITER_END_EVENT, TYPEWRITER_START_EVENT } from "@lib/typewriter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const originalMatchMedia = window.matchMedia.bind(window);

function setReducedMotion(matches: boolean) {
  window.matchMedia = (query: string) => ({ matches, media: query }) as MediaQueryList;
}

function renderControl() {
  document.body.insertAdjacentHTML(
    "beforeend",
    '<button type="button" data-motion-control></button>',
  );
  const control = document.querySelector<HTMLElement>("[data-motion-control]");
  if (!control) throw new Error("motion control missing");
  return control;
}

function addEntrance() {
  const entrance = document.createElement("div");
  entrance.className = "animate-fade-up";
  document.body.append(entrance);
  return entrance;
}

function finishedAnimation() {
  return { playState: "finished", finished: Promise.resolve() } as unknown as Animation;
}

function runningAnimation() {
  return {
    playState: "running",
    finished: new Promise<Animation>(() => {}),
  } as unknown as Animation;
}

function mockReload() {
  const reload = vi.fn();
  Object.defineProperty(window.location, "reload", {
    configurable: true,
    value: reload,
    writable: true,
  });
  return reload;
}

beforeEach(() => {
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("data-motion");
  sessionStorage.clear();
  setReducedMotion(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
  delete (window.location as unknown as Record<string, unknown>).reload;
});

describe("startMotionControl", () => {
  it("hides the control when reduced motion is preferred", () => {
    setReducedMotion(true);
    const control = renderControl();
    addEntrance();

    startMotionControl();

    expect(control.dataset.mode).toBe("hidden");
  });

  it("hides the control when the page has no entrance", () => {
    const control = renderControl();

    startMotionControl();

    expect(control.dataset.mode).toBe("hidden");
  });

  it("starts in reset mode on a repeat visit", () => {
    document.documentElement.dataset.motion = "skipped";
    addEntrance();
    const control = renderControl();

    startMotionControl();

    expect(control.dataset.mode).toBe("reset");
    expect(control.getAttribute("aria-label")).toBe("Reset animations");
  });

  it("skip click marks the visit skipped and flips to reset", () => {
    addEntrance().getAnimations = () => [runningAnimation()];
    const control = renderControl();

    startMotionControl();

    expect(control.dataset.mode).toBe("skip");
    expect(control.getAttribute("aria-label")).toBe("Skip animations");

    control.click();

    expect(document.documentElement.dataset.motion).toBe("skipped");
    expect(control.dataset.mode).toBe("reset");
  });

  it("reset click forgets the current page and reloads", () => {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    sessionStorage.setItem("visited-pages", JSON.stringify([path, "/elsewhere"]));
    document.documentElement.dataset.motion = "skipped";
    addEntrance();
    const control = renderControl();
    const reload = mockReload();

    startMotionControl();

    expect(control.dataset.mode).toBe("reset");

    control.click();

    expect(JSON.parse(sessionStorage.getItem("visited-pages") ?? "[]")).toEqual(["/elsewhere"]);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("flips to reset once entrance animations finish", () => {
    addEntrance().getAnimations = () => [finishedAnimation()];
    const control = renderControl();

    startMotionControl();

    expect(control.dataset.mode).toBe("reset");
  });

  it("typewriter start forces skip mode until it ends", () => {
    addEntrance().getAnimations = () => [finishedAnimation()];
    const control = renderControl();

    startMotionControl();

    expect(control.dataset.mode).toBe("reset");

    window.dispatchEvent(new Event(TYPEWRITER_START_EVENT));

    expect(control.dataset.mode).toBe("skip");
    expect(control.getAttribute("aria-label")).toBe("Skip animations");

    window.dispatchEvent(new Event(TYPEWRITER_END_EVENT));

    expect(control.dataset.mode).toBe("reset");
  });
});
