import type { CrtReply } from "@features/crt/protocol";
import type { RenderInput } from "@features/crt/render";
import type { Surface } from "@features/crt/surface";

import { createRenderer } from "@features/crt/renderer";
import { describe, expect, it, vi } from "vite-plus/test";

const size = { width: 30, height: 20, unit: 1 };
const surface = () => ({ width: 0, height: 0 }) as Surface;

function bitmap(width: number, height: number) {
  return { width, height, close: vi.fn() } as unknown as ImageBitmap;
}

function deferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function setup(render = vi.fn(async (_target: Surface, _input: RenderInput) => true)) {
  const replies: CrtReply[] = [];
  const blob = new Blob(["png"]);
  const handle = createRenderer({
    post: (reply) => replies.push(reply),
    createSurface: surface,
    decode: async (file) => bitmap(file.size, 2),
    grain: async () => undefined,
    render,
    toBlob: async () => blob,
  });
  return { handle, replies, render, blob };
}

const file = (bytes: number) => new Blob(["x".repeat(bytes)]);

describe("createRenderer", () => {
  it("decodes a file and reports its size", async () => {
    const { handle, replies } = setup();

    await handle({ type: "load", job: 1, file: file(4) });

    expect(replies).toEqual([{ type: "loaded", job: 1, width: 4, height: 2 }]);
  });

  it("renders the attached canvas and reports the job", async () => {
    const { handle, replies, render } = setup();
    const canvas = surface();
    await handle({ type: "attach", canvas });
    await handle({ type: "load", job: 1, file: file(4) });

    await handle({ type: "render", job: 2, size });

    expect(render).toHaveBeenCalledWith(canvas, expect.objectContaining({ density: "source" }));
    expect(replies.at(-1)).toEqual({ type: "rendered", job: 2 });
  });

  it("drops a render that a newer job overtakes", async () => {
    const gate = deferred();
    const render = vi.fn(async (_target: Surface, input: RenderInput) => {
      await gate.promise;
      return !input.isStale();
    });
    const { handle, replies } = setup(render);
    await handle({ type: "attach", canvas: surface() });
    await handle({ type: "load", job: 1, file: file(4) });

    const first = handle({ type: "render", job: 2, size });
    const second = handle({ type: "render", job: 3, size });
    gate.resolve();
    await Promise.all([first, second]);

    expect(replies.filter((reply) => reply.type === "rendered")).toEqual([
      { type: "rendered", job: 3 },
    ]);
  });

  it("drops a decode that a newer file overtakes and closes it", async () => {
    const closed: number[] = [];
    const gate = deferred();
    const replies: CrtReply[] = [];
    const handle = createRenderer({
      post: (reply) => replies.push(reply),
      createSurface: surface,
      decode: async (blob) => {
        if (blob.size === 1) await gate.promise;
        const next = { width: blob.size, height: 1, close: () => closed.push(blob.size) };
        return next as unknown as ImageBitmap;
      },
      grain: async () => undefined,
    });

    const slow = handle({ type: "load", job: 1, file: file(1) });
    await handle({ type: "load", job: 2, file: file(2) });
    gate.resolve();
    await slow;

    expect(replies).toEqual([{ type: "loaded", job: 2, width: 2, height: 1 }]);
    expect(closed).toEqual([1]);
  });

  it("drops renders and exports after a clear", async () => {
    const gate = deferred();
    const render = vi.fn(async () => {
      await gate.promise;
      return true;
    });
    const { handle, replies } = setup(render);
    await handle({ type: "attach", canvas: surface() });
    await handle({ type: "load", job: 1, file: file(4) });

    const screen = handle({ type: "render", job: 2, size });
    const saved = handle({ type: "export", job: 3, size });
    await handle({ type: "clear", job: 4 });
    gate.resolve();
    await Promise.all([screen, saved]);

    expect(replies).toEqual([{ type: "loaded", job: 1, width: 4, height: 2 }]);
  });

  it("exports into its own surface and posts the blob", async () => {
    const { handle, replies, render, blob } = setup();
    const canvas = surface();
    await handle({ type: "attach", canvas });
    await handle({ type: "load", job: 1, file: file(4) });

    await handle({ type: "export", job: 2, size: { width: 60, height: 40, unit: 2 } });

    expect(render.mock.calls[0]?.[0]).not.toBe(canvas);
    expect(replies.at(-1)).toEqual({ type: "exported", job: 2, blob });
  });

  it("reports a failure against the job's kind", async () => {
    const { handle, replies } = setup(
      vi.fn(async () => {
        throw new Error("no canvas");
      }),
    );
    await handle({ type: "attach", canvas: surface() });
    await handle({ type: "load", job: 1, file: file(4) });

    await handle({ type: "export", job: 2, size });

    expect(replies.at(-1)).toEqual({
      type: "failed",
      job: 2,
      kind: "export",
      message: "no canvas",
    });
  });
});
