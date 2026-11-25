import { applyEffects } from "@features/crt/effects";
import { paintTriads } from "@features/crt/triads";

const COMPOSITION_SCALE = 3;
const EXPORT_MAX_SIDE = 6000;

export type RenderInput = {
  source: HTMLImageElement;
  grain: HTMLImageElement | undefined;
  width: number;
  height: number;
  unit: number;
};

export function renderCrt(target: HTMLCanvasElement, input: RenderInput) {
  target.width = input.width;
  target.height = input.height;
  const context = target.getContext("2d");
  if (!context) return;
  const width = input.source.naturalWidth * COMPOSITION_SCALE;
  const height = input.source.naturalHeight * COMPOSITION_SCALE;
  const renderWidth = Math.max(input.width, Math.min(width, 4096));
  const flat = document.createElement("canvas");
  paintTriads(flat, {
    source: input.source,
    grain: input.grain,
    width,
    height,
    pixelScale: renderWidth / width,
  });
  context.imageSmoothingQuality = "high";
  context.drawImage(flat, 0, 0, input.width, input.height);
  applyEffects(context, input, input.unit);
}

export function exportSize(naturalWidth: number, naturalHeight: number) {
  const scale = Math.min(
    COMPOSITION_SCALE,
    EXPORT_MAX_SIDE / Math.max(naturalWidth, naturalHeight),
  );
  return { width: Math.round(naturalWidth * scale), height: Math.round(naturalHeight * scale) };
}

export function displaySize(
  naturalWidth: number,
  naturalHeight: number,
  available: { width: number; height: number },
) {
  const scale = Math.min(
    1,
    available.width / (naturalWidth * COMPOSITION_SCALE),
    available.height / (naturalHeight * COMPOSITION_SCALE),
  );
  const width = Math.max(1, Math.floor(naturalWidth * COMPOSITION_SCALE * scale));
  return { width, height: Math.max(1, Math.round((width * naturalHeight) / naturalWidth)) };
}
