// @vitest-environment happy-dom
import { startHomePreview } from "@lib/home-preview";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

function renderPage() {
  document.body.innerHTML = [
    '<div data-prev-band><div data-prev-reveal><div data-prev-screen><div data-prev-image="emerald"></div><div data-prev-image="blue"></div></div></div></div>',
    '<span data-title data-wash="emerald"><a href="/blog">Blog</a></span>',
    '<span data-title data-wash="blue"><a href="/vignettes">Vignettes</a></span>',
    '<span data-title data-wash="plum"><a href="/projects">Projects</a></span>',
  ].join("");
}

function screen() {
  const element = document.querySelector<HTMLElement>("[data-prev-screen]");
  if (!element) throw new Error("missing preview screen");
  return element;
}

function reveal() {
  const element = document.querySelector<HTMLElement>("[data-prev-reveal]");
  if (!element) throw new Error("missing preview reveal");
  return element;
}

function title(wash: string) {
  const element = document.querySelector<HTMLElement>(`[data-title][data-wash="${wash}"]`);
  if (!element) throw new Error(`missing ${wash} title`);
  return element;
}

function previewOpened() {
  return screen().hasAttribute("data-prev-opened");
}

function endReveal(propertyName = "grid-template-rows") {
  const event = new Event("transitionend");
  Object.defineProperty(event, "propertyName", { value: propertyName });
  reveal().dispatchEvent(event);
}

describe("startHomePreview", () => {
  beforeEach(renderPage);

  afterEach(() => {
    vi.useRealTimers();
  });

  it("flashes the loading state when the title changes", () => {
    vi.useFakeTimers();
    startHomePreview();

    title("emerald").dispatchEvent(new Event("pointerenter"));
    expect(screen().dataset.loading).toBe("");
    vi.runAllTimers();
    expect(screen().dataset.loading).toBeUndefined();

    title("plum").dispatchEvent(new Event("pointerenter"));
    expect(screen().dataset.loading).toBe("");
  });

  it("holds the loading state through the full loading beat", () => {
    vi.useFakeTimers();
    startHomePreview();

    title("emerald").dispatchEvent(new Event("pointerenter"));
    vi.advanceTimersByTime(1300);

    expect(screen().dataset.loading).toBe("");

    vi.runAllTimers();
    expect(screen().dataset.loading).toBeUndefined();
  });

  it("does not flash again for the same title", () => {
    vi.useFakeTimers();
    startHomePreview();
    const emerald = title("emerald");

    emerald.dispatchEvent(new Event("pointerenter"));
    vi.runAllTimers();
    expect(screen().dataset.loading).toBeUndefined();

    emerald.dispatchEvent(new Event("focusin"));
    expect(screen().dataset.loading).toBeUndefined();
  });

  it("flashes again after leaving and re-entering the same title", () => {
    vi.useFakeTimers();
    startHomePreview();
    const emerald = title("emerald");

    emerald.dispatchEvent(new Event("pointerenter"));
    vi.runAllTimers();
    emerald.dispatchEvent(new Event("pointerleave"));
    emerald.dispatchEvent(new Event("pointerenter"));

    expect(screen().dataset.loading).toBe("");
  });

  it("marks the preview open only once the reveal settles", () => {
    vi.useFakeTimers();
    startHomePreview();

    title("emerald").dispatchEvent(new Event("pointerenter"));
    expect(previewOpened()).toBe(false);

    endReveal();
    expect(previewOpened()).toBe(true);
  });

  it("marks the open state from a reveal that was already running", () => {
    vi.useFakeTimers();
    startHomePreview();

    endReveal();

    expect(previewOpened()).toBe(true);
  });

  it("ignores transitions from other properties", () => {
    vi.useFakeTimers();
    startHomePreview();

    title("emerald").dispatchEvent(new Event("pointerenter"));
    endReveal("aspect-ratio");

    expect(previewOpened()).toBe(false);
  });

  it("holds the aspect ratio until the loading beat when switching titles", () => {
    vi.useFakeTimers();
    startHomePreview();

    title("emerald").dispatchEvent(new Event("pointerenter"));
    endReveal();
    title("blue").dispatchEvent(new Event("pointerenter"));

    expect(previewOpened()).toBe(true);
  });

  it("clears the open mark only once the close settles", () => {
    vi.useFakeTimers();
    startHomePreview();

    title("emerald").dispatchEvent(new Event("pointerenter"));
    endReveal();
    title("emerald").dispatchEvent(new MouseEvent("pointerleave"));

    expect(previewOpened()).toBe(true);

    endReveal();
    expect(previewOpened()).toBe(false);
  });

  it("clears the open mark when a title without an image closes the preview", () => {
    vi.useFakeTimers();
    startHomePreview();

    title("emerald").dispatchEvent(new Event("pointerenter"));
    endReveal();
    expect(previewOpened()).toBe(true);

    title("plum").dispatchEvent(new Event("pointerenter"));
    endReveal();
    expect(previewOpened()).toBe(false);
  });

  it("reopens without the delayed ratio after closing", () => {
    vi.useFakeTimers();
    startHomePreview();

    title("emerald").dispatchEvent(new Event("pointerenter"));
    endReveal();
    title("emerald").dispatchEvent(new MouseEvent("pointerleave"));
    endReveal();
    title("blue").dispatchEvent(new Event("pointerenter"));

    expect(previewOpened()).toBe(false);
  });

  it("does nothing without a preview screen", () => {
    document.body.innerHTML = "";
    expect(() => startHomePreview()).not.toThrow();
  });
});
