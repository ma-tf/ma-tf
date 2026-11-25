import type { CrtReply, CrtRequest } from "@features/crt/protocol";

import { isCrtReply } from "@features/crt/protocol";
import { createRenderer } from "@features/crt/renderer";
import { decodeFile, documentSurface, loadBitmap } from "@features/crt/surface";
import { GRAIN_SRC } from "@features/crt/triads";

type Listener = (reply: CrtReply) => void;

export type Transport = {
  send: (request: CrtRequest) => void;
  attach: (canvas: HTMLCanvasElement) => void;
  listen: (listener: Listener) => void;
  dispose: () => void;
};

function supportsWorkerRendering(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    "transferControlToOffscreen" in HTMLCanvasElement.prototype
  );
}

function workerTransport(): Transport {
  const worker = new Worker(new URL("@features/crt/crt.worker.ts", import.meta.url), {
    type: "module",
  });
  return {
    send: (request) => worker.postMessage(request),
    attach: (canvas) => {
      const offscreen = canvas.transferControlToOffscreen();
      worker.postMessage({ type: "attach", canvas: offscreen } satisfies CrtRequest, [offscreen]);
    },
    listen: (listener) => {
      worker.addEventListener("message", (event: MessageEvent<unknown>) => {
        if (isCrtReply(event.data)) listener(event.data);
      });
    },
    dispose: () => worker.terminate(),
  };
}

function localTransport(): Transport {
  let listener: Listener | undefined;
  const handle = createRenderer({
    post: (reply) => listener?.(reply),
    createSurface: documentSurface,
    decode: decodeFile,
    grain: () => loadBitmap(GRAIN_SRC),
  });
  return {
    send: (request) => void handle(request),
    attach: (canvas) => void handle({ type: "attach", canvas }),
    listen: (next) => {
      listener = next;
    },
    dispose: () => {
      listener = undefined;
    },
  };
}

export function createTransport(): Transport {
  return supportsWorkerRendering() ? workerTransport() : localTransport();
}
