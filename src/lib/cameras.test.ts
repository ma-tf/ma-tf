import { startCameras } from "@lib/cameras";
import { describe, expect, it } from "vite-plus/test";

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

  it("ignores clicks when the button has no image", () => {
    const button = fakeButton(null);
    const root = { querySelectorAll: () => [button] };
    startCameras(root as unknown as ParentNode);

    expect(() => button.click()).not.toThrow();
  });
});
