// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const starts = vi.fn();
const stops = vi.fn();
const resume = vi.fn(() => Promise.resolve());
let state: AudioContextState = "running";
let now = 0;

const played: unknown[] = [];

class FakeOfflineAudioContext {
  decodeAudioData(data: ArrayBuffer) {
    return Promise.resolve({ id: data.byteLength } as unknown as AudioBuffer);
  }
}

class FakeAudioContext {
  currentTime = 0;
  destination = {};
  resume = resume;
  get state() {
    return state;
  }
  createGain() {
    return {
      gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      connect: () => {},
    };
  }
  createBufferSource() {
    const source = {
      buffer: null as { id: number } | null,
      connect: () => {},
      onended: null as (() => void) | null,
      start: () => {
        starts();
        played.push(source.buffer?.id);
      },
      stop: () => stops(source.buffer?.id),
    };
    return source;
  }
}

function setActivation(hasBeenActive: boolean) {
  Object.defineProperty(navigator, "userActivation", {
    value: { hasBeenActive },
    configurable: true,
  });
}

function wait(ms = 1000) {
  now += ms;
}

async function setup(markup: string) {
  const sfx = await import("@lib/sfx");
  const root = document.createElement("div");
  root.innerHTML = markup;
  document.body.append(root);
  sfx.startSfx(root);
  await new Promise((resolve) => setTimeout(resolve));
  const find = (id: string) => {
    const element = root.querySelector<HTMLElement>(`#${id}`);
    if (!element) throw new Error(`#${id} missing`);
    return element;
  };
  return { ...sfx, root, find };
}

function over(target: HTMLElement, from: Element | null = null, pointerType = "mouse", x = 0) {
  const event = new PointerEvent("pointerover", { bubbles: true, pointerType, clientX: x });
  Object.defineProperty(event, "relatedTarget", { value: from });
  target.dispatchEvent(event);
}

function focus(target: HTMLElement, visible: boolean) {
  Object.defineProperty(target, "matches", {
    value: (selector: string) => selector === ":focus-visible" && visible,
    configurable: true,
  });
  target.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
}

beforeEach(() => {
  vi.resetModules();
  starts.mockClear();
  stops.mockClear();
  played.length = 0;
  resume.mockClear();
  state = "running";
  now = 0;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.stubGlobal("AudioContext", FakeAudioContext);
  window.AudioContext = FakeAudioContext as unknown as typeof AudioContext;
  window.OfflineAudioContext = FakeOfflineAudioContext as unknown as typeof OfflineAudioContext;
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) =>
      Promise.resolve(
        new Response(
          new ArrayBuffer(url === "/menu3up.ogg" ? 2 : url === "/menu3down.ogg" ? 3 : 1),
        ),
      ),
    ),
  );
  setActivation(true);
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("playSfx", () => {
  it("starts the sound once", async () => {
    const { playSfx } = await setup("");

    playSfx();

    expect(starts).toHaveBeenCalledTimes(1);
  });

  it("stays silent while muted and plays again once unmuted", async () => {
    const { playSfx, setSfxMuted } = await setup("");

    setSfxMuted(true);
    playSfx();

    expect(starts).not.toHaveBeenCalled();

    setSfxMuted(false);
    playSfx();

    expect(starts).toHaveBeenCalledTimes(1);
  });

  it("stays silent before user activation", async () => {
    setActivation(false);
    const { playSfx } = await setup("");

    playSfx();

    expect(starts).not.toHaveBeenCalled();
  });

  it("drops the sound rather than queueing it on a suspended context", async () => {
    state = "suspended";
    const { playSfx } = await setup("");

    playSfx();
    await Promise.resolve();

    expect(resume).toHaveBeenCalledTimes(1);
    expect(starts).not.toHaveBeenCalled();
  });

  it("fades out the sound still playing when the next one starts", async () => {
    const { find } = await setup(
      '<div id="host" data-sfx="hover leave" data-sfx-enter="up" data-sfx-leave="down"></div>',
    );

    over(find("host"));

    expect(stops).not.toHaveBeenCalled();

    out(find("host"), document.body);

    expect(played).toEqual([2, 3]);
    expect(stops).toHaveBeenCalledTimes(1);
    expect(stops).toHaveBeenCalledWith(2);
  });

  it("collapses triggers inside the minimum interval", async () => {
    const { playSfx } = await setup("");

    playSfx();
    wait(20);
    playSfx();
    wait(100);
    playSfx();

    expect(starts).toHaveBeenCalledTimes(2);
  });

  it("stays silent when the sound file cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(null, { status: 404 }))),
    );
    const { playSfx } = await setup("");

    playSfx();

    expect(starts).not.toHaveBeenCalled();
  });

  it("does nothing without Web Audio", async () => {
    window.AudioContext = undefined as unknown as typeof AudioContext;
    const { playSfx } = await setup("");

    expect(() => playSfx()).not.toThrow();
    expect(starts).not.toHaveBeenCalled();
  });
});

describe("startSfx hover", () => {
  const markup = '<div id="host" data-sfx="hover"><span id="child">a</span></div>';

  it("plays once per entry and ignores moves between descendants", async () => {
    const { find } = await setup(markup);

    over(find("child"));
    wait();
    over(find("host"), find("child"));

    expect(starts).toHaveBeenCalledTimes(1);
  });

  it("ignores a re-hit of the same host under a stationary pointer", async () => {
    const { find } = await setup(markup);

    over(find("host"), null, "mouse", 10);
    wait();
    over(find("child"), document.documentElement, "mouse", 10);

    expect(starts).toHaveBeenCalledTimes(1);

    wait();
    over(find("host"), null, "mouse", 11);

    expect(starts).toHaveBeenCalledTimes(2);
  });

  it("ignores touch pointers", async () => {
    const { find } = await setup(markup);

    over(find("host"), null, "touch");

    expect(starts).not.toHaveBeenCalled();
  });

  it("does not bind a root twice", async () => {
    const { find, root, startSfx } = await setup(markup);
    startSfx(root);

    over(find("host"));

    expect(starts).toHaveBeenCalledTimes(1);
  });
});

describe("startSfx focus and click", () => {
  it("plays on focus only for focus-visible targets with the focus token", async () => {
    const { find } = await setup(
      '<button id="both" data-sfx="hover focus"></button><button id="hover" data-sfx="hover"></button>',
    );

    focus(find("both"), false);
    focus(find("hover"), true);

    expect(starts).not.toHaveBeenCalled();

    focus(find("both"), true);

    expect(starts).toHaveBeenCalledTimes(1);
  });

  it("plays on a click inside a click host only", async () => {
    const { find } = await setup(
      '<button data-sfx="click"><span id="inside">a</span></button><button id="other" data-sfx="hover"></button>',
    );

    find("other").click();
    find("inside").click();

    expect(starts).toHaveBeenCalledTimes(1);
  });
});

function out(target: HTMLElement, to: Element | null = null, pointerType = "mouse") {
  const event = new PointerEvent("pointerout", { bubbles: true, pointerType });
  Object.defineProperty(event, "relatedTarget", { value: to });
  target.dispatchEvent(event);
}

function blur(target: HTMLElement, to: Element | null = null) {
  const event = new FocusEvent("focusout", { bubbles: true });
  Object.defineProperty(event, "relatedTarget", { value: to });
  target.dispatchEvent(event);
}

describe("startSfx named sounds and leave", () => {
  const markup =
    '<div id="host" data-sfx="hover focus leave" data-sfx-enter="up" data-sfx-leave="down"><span id="child">a</span></div><div id="plain" data-sfx="hover"></div>';

  it("plays the up sound on hover and the down sound on leaving", async () => {
    const { find } = await setup(markup);

    over(find("host"));
    wait();
    out(find("child"), find("host"));
    out(find("host"), document.body);

    expect(played).toEqual([2, 3]);
  });

  it("plays the leave sound only after a matching enter", async () => {
    const { find } = await setup(markup);

    out(find("host"), document.body);
    blur(find("host"), document.body);

    expect(played).toEqual([]);
  });

  it("pairs keyboard focus with blur", async () => {
    const { find } = await setup(markup);

    focus(find("host"), true);
    wait();
    blur(find("child"), find("host"));
    blur(find("host"), document.body);

    expect(played).toEqual([2, 3]);
  });

  it("keeps an unmarked hover on the default sound and ignores touch leaves", async () => {
    const { find } = await setup(markup);

    over(find("plain"));
    over(find("host"), null, "touch");
    out(find("host"), document.body, "touch");

    expect(played).toEqual([1]);
  });

  it("plays a leave and an enter within the interval on adjacent hosts", async () => {
    const { find } = await setup(markup);

    over(find("host"));
    out(find("host"), find("plain"));
    over(find("plain"), find("host"));

    expect(played).toEqual([2, 3, 1]);
  });
});

describe("startSfx settle delay", () => {
  const markup =
    '<div id="host" data-sfx="hover leave" data-sfx-enter="up" data-sfx-settle></div><div id="plain" data-sfx="hover"></div>';

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.style.removeProperty("--open-delay");
  });

  it("defers the enter sound by the open delay and plays it while still hovered", async () => {
    const { find } = await setup(markup);
    vi.useFakeTimers();
    document.documentElement.style.setProperty("--open-delay", "150ms");

    over(find("host"));

    expect(played).toEqual([]);

    vi.advanceTimersByTime(150);

    expect(played).toEqual([2]);
  });

  it("drops a deferred sound when the pointer has already left", async () => {
    const { find } = await setup(markup);
    vi.useFakeTimers();
    document.documentElement.style.setProperty("--open-delay", "150ms");

    over(find("host"));
    out(find("host"), document.body);
    vi.advanceTimersByTime(150);

    expect(played).not.toContain(2);
  });

  it("plays at once without a delay, and never defers an unmarked host", async () => {
    const { find } = await setup(markup);

    over(find("host"));
    wait();
    document.documentElement.style.setProperty("--open-delay", "150ms");
    over(find("plain"));

    expect(played).toEqual([2, 1]);
  });
});
