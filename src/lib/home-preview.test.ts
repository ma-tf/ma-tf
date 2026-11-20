// @vitest-environment happy-dom
import { startHomePreview } from "@lib/home-preview";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

function renderPage() {
  document.body.innerHTML = [
    "<div data-prev-screen></div>",
    '<span data-title data-wash="emerald"><a href="/blog">Blog</a></span>',
    '<span data-title data-wash="plum"><a href="/projects">Projects</a></span>',
  ].join("");
}

function screen() {
  const element = document.querySelector<HTMLElement>("[data-prev-screen]");
  if (!element) throw new Error("missing preview screen");
  return element;
}

function title(wash: string) {
  const element = document.querySelector<HTMLElement>(`[data-title][data-wash="${wash}"]`);
  if (!element) throw new Error(`missing ${wash} title`);
  return element;
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

  it("does nothing without a preview screen", () => {
    document.body.innerHTML = "";
    expect(() => startHomePreview()).not.toThrow();
  });
});
