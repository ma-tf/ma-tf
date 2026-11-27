// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

function out(target: Element, to: Element | null = null) {
  const event = new Event("pointerout", { bubbles: true });
  Object.defineProperty(event, "relatedTarget", { value: to });
  target.dispatchEvent(event);
}

function run(target: Element, propertyName = "translate", active = true) {
  const title = target.closest("[data-title]");
  if (title) Object.defineProperty(title, "matches", { value: () => active, configurable: true });
  const event = new Event("transitionrun", { bubbles: true });
  Object.defineProperty(event, "propertyName", { value: propertyName });
  target.dispatchEvent(event);
}

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  document.body.innerHTML =
    '<span id="a" data-title><i id="inner"></i></span><span id="b" data-title></span><p id="other"></p>';
  const { startHomeSwitch } = await import("@lib/home-switch");
  startHomeSwitch();
});

afterEach(() => {
  vi.useRealTimers();
  delete document.documentElement.dataset.switching;
});

describe("startHomeSwitch", () => {
  const html = () => document.documentElement;
  const el = (id: string) => document.getElementById(id) as HTMLElement;

  it("stays off until a title has started opening", () => {
    expect(html().dataset.switching).toBeUndefined();
  });

  it("is on while a title is open, before any other title can start opening", () => {
    run(el("inner"));

    expect(html().dataset.switching).toBe("");

    vi.advanceTimersByTime(1000);

    expect(html().dataset.switching).toBe("");
  });

  it("holds for the settle window after the open title closes, then clears", () => {
    run(el("inner"));
    out(el("a"), el("b"));
    vi.advanceTimersByTime(149);

    expect(html().dataset.switching).toBe("");

    vi.advanceTimersByTime(1);

    expect(html().dataset.switching).toBeUndefined();
  });

  it("stays on when the next title opens inside the settle window", () => {
    run(el("inner"));
    out(el("a"), el("b"));
    run(el("b"));
    vi.advanceTimersByTime(150);

    expect(html().dataset.switching).toBe("");

    out(el("b"), null);
    vi.advanceTimersByTime(150);

    expect(html().dataset.switching).toBeUndefined();
  });

  it("ignores closing transitions, other properties and moves within a title", () => {
    run(el("inner"), "translate", false);
    run(el("inner"), "opacity");
    out(el("inner"), el("a"));

    expect(html().dataset.switching).toBeUndefined();
  });
});
