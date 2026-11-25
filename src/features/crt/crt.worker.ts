import type { CrtReply, CrtRequest } from "@features/crt/protocol";

import { createTriadGl } from "@features/crt/gl";
import { createRenderer } from "@features/crt/renderer";
import { decodeFile, loadBitmap, offscreenSurface } from "@features/crt/surface";
import { GRAIN_SRC } from "@features/crt/triads";

type WorkerScope = {
  postMessage: (message: CrtReply) => void;
  addEventListener: (type: "message", listener: (event: MessageEvent<CrtRequest>) => void) => void;
};

const scope = globalThis as unknown as WorkerScope;

const handle = createRenderer({
  post: (reply) => scope.postMessage(reply),
  createSurface: offscreenSurface,
  decode: decodeFile,
  grain: () => loadBitmap(GRAIN_SRC),
  createGl: () => createTriadGl(offscreenSurface),
});

scope.addEventListener("message", (event) => {
  void handle(event.data);
});
