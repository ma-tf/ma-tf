// @vitest-environment happy-dom
import type { ReactNode } from "react";

import { CrtScreen, CrtUpload } from "@features/crt/crt";
import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

let container: HTMLDivElement;
let root: Root;

function setFiles(target: object, key: "files" | "dataTransfer", files: File[]) {
  Object.defineProperty(target, key, {
    configurable: true,
    value: key === "files" ? files : { files },
  });
}

function render(node: ReactNode) {
  act(() => {
    root.render(node);
  });
}

function mount(onFile: (file: File) => void) {
  render(<CrtUpload onFile={onFile} />);
}

function screen(saving: boolean) {
  render(
    <CrtScreen canvasRef={createRef()} saving={saving} onSave={() => {}} onClear={() => {}} />,
  );
  return Array.from(container.querySelectorAll("button"), (button) => button.textContent);
}

function choose(file: File) {
  const input = container.querySelector("input[type=file]");
  if (!input) throw new Error("expected a file input");
  setFiles(input, "files", [file]);
  act(() => {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function drop(file: File) {
  const zone = container.querySelector("[data-slot=empty]");
  if (!zone) throw new Error("expected the drop zone");
  const event = new Event("drop", { bubbles: true, cancelable: true });
  setFiles(event, "dataTransfer", [file]);
  act(() => {
    zone.dispatchEvent(event);
  });
}

const image = new File(["png"], "photo.png", { type: "image/png" });
const text = new File(["text"], "notes.txt", { type: "text/plain" });

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("CrtUpload", () => {
  it("shows the upload prompt", () => {
    mount(() => {});

    expect(container.textContent).toContain("Drop an image, or choose one");
    expect(container.querySelector("input")?.getAttribute("accept")).toBe("image/*");
  });

  it("accepts a chosen image and ignores other files", () => {
    const onFile = vi.fn();
    mount(onFile);

    choose(text);
    choose(image);

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile).toHaveBeenCalledWith(image);
  });

  it("accepts a dropped image and ignores other files", () => {
    const onFile = vi.fn();
    mount(onFile);

    drop(text);
    drop(image);

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile).toHaveBeenCalledWith(image);
  });
});

describe("CrtScreen", () => {
  it("draws into a single canvas", () => {
    screen(false);

    expect(container.querySelectorAll("canvas")).toHaveLength(1);
  });

  it("offers Save PNG and Clear", () => {
    expect(screen(false)).toEqual(["Save PNG", "Clear"]);
  });

  it("labels the save button while saving", () => {
    expect(screen(true)).toEqual(["Saving…", "Clear"]);
  });
});
