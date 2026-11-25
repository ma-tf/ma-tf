export type Surface = HTMLCanvasElement | OffscreenCanvas;

export type Canvas2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export type CreateSurface = (width: number, height: number) => Surface;

function isOffscreen(surface: Surface): surface is OffscreenCanvas {
  return "convertToBlob" in surface;
}

export function context2d(surface: Surface, readback = false): Canvas2D | null {
  const options: CanvasRenderingContext2DSettings = { willReadFrequently: readback };
  if (isOffscreen(surface)) return surface.getContext("2d", options);
  return surface.getContext("2d", options);
}

const GL_OPTIONS: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: true,
  preserveDrawingBuffer: true,
};

export function contextGl(surface: Surface): WebGL2RenderingContext | null {
  if (isOffscreen(surface)) return surface.getContext("webgl2", GL_OPTIONS);
  return surface.getContext("webgl2", GL_OPTIONS);
}

export const offscreenSurface: CreateSurface = (width, height) =>
  new OffscreenCanvas(width, height);

export const documentSurface: CreateSurface = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export function surfaceToBlob(surface: Surface): Promise<Blob | null> {
  if (isOffscreen(surface)) return surface.convertToBlob({ type: "image/png" });
  return new Promise((resolve) => surface.toBlob(resolve, "image/png"));
}

export async function loadBitmap(url: string): Promise<ImageBitmap | undefined> {
  try {
    const response = await fetch(url, { mode: "cors", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return undefined;
    return await createImageBitmap(await response.blob());
  } catch {
    return undefined;
  }
}

export function decodeFile(file: Blob): Promise<ImageBitmap> {
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

export function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
}
