import { startCameras } from "@lib/cameras";
import { CDN_BASE } from "@lib/cdn";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

function fakeImage() {
  const classes = new Set<string>();
  return {
    offsetWidth: 128,
    classList: {
      add: (name: string) => {
        classes.add(name);
      },
      remove: (name: string) => {
        classes.delete(name);
      },
      contains: (name: string) => classes.has(name),
    },
  };
}

function fakeButton(image: { offsetWidth: number } | null) {
  let handler: (() => void) | undefined;
  return {
    dataset: {} as Record<string, string>,
    querySelector: () => image,
    addEventListener: (_type: string, next: () => void) => {
      handler = next;
    },
    click: () => handler?.(),
  };
}

type FakeAudio = {
  src: string;
  preload: string;
  currentTime: number;
  playbackRate: number;
  preservesPitch: boolean;
  play: () => Promise<void>;
};

let instances: FakeAudio[] = [];

function onlyInstance(): FakeAudio {
  const [instance] = instances;
  if (!instance) throw new Error("expected one audio element");
  return instance;
}

beforeEach(() => {
  instances = [];
  class StubAudio implements FakeAudio {
    src: string;
    preload = "";
    currentTime = 0;
    playbackRate = 1;
    preservesPitch = true;
    play = vi.fn(() => Promise.resolve());

    constructor(src: string) {
      this.src = src;
      instances.push(this);
    }
  }
  vi.stubGlobal("Audio", StubAudio);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("startCameras", () => {
  it("replays the shake on every click", () => {
    const image = fakeImage();
    const button = fakeButton(image);
    const root = { querySelectorAll: () => [button] };
    startCameras(root as unknown as ParentNode);

    button.click();
    expect(image.classList.contains("animate-bird-shake")).toBe(true);

    image.classList.remove("animate-bird-shake");
    button.click();
    expect(image.classList.contains("animate-bird-shake")).toBe(true);
  });

  it("plays the shutter from the first click", () => {
    const button = fakeButton(fakeImage());
    const root = { querySelectorAll: () => [button] };
    startCameras(root as unknown as ParentNode);

    button.click();

    const audio = onlyInstance();
    expect(audio.src).toBe(`${CDN_BASE}/photography/camera.ogg`);
    expect(audio.preload).toBe("auto");
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it("restarts the shutter when clicked again", () => {
    const button = fakeButton(fakeImage());
    const root = { querySelectorAll: () => [button] };
    startCameras(root as unknown as ParentNode);

    button.click();
    onlyInstance().currentTime = 0.9;
    button.click();

    expect(onlyInstance().currentTime).toBe(0);
    expect(onlyInstance().play).toHaveBeenCalledTimes(2);
  });

  it("plays each camera at its own rate and pitch", () => {
    const tuned = fakeButton(fakeImage());
    tuned.dataset.playbackRate = "0.98";
    const untuned = fakeButton(fakeImage());
    const root = { querySelectorAll: () => [tuned, untuned] };
    startCameras(root as unknown as ParentNode);

    tuned.click();
    expect(onlyInstance().playbackRate).toBe(0.98);
    expect(onlyInstance().preservesPitch).toBe(false);

    untuned.click();
    expect(onlyInstance().playbackRate).toBe(1);
  });

  it("shares one audio element across the cameras", () => {
    const root = { querySelectorAll: () => [fakeButton(fakeImage()), fakeButton(fakeImage())] };
    startCameras(root as unknown as ParentNode);

    expect(instances).toHaveLength(1);
  });

  it("does nothing when the page has no cameras", () => {
    startCameras({ querySelectorAll: () => [] } as unknown as ParentNode);

    expect(instances).toHaveLength(0);
  });

  it("ignores clicks when the button has no image", () => {
    const button = fakeButton(null);
    const root = { querySelectorAll: () => [button] };
    startCameras(root as unknown as ParentNode);

    expect(() => button.click()).not.toThrow();
  });
});
