import type { CreateSurface, Surface } from "@features/crt/surface";

import { applyEffects } from "@features/crt/effects";
import { context2d } from "@features/crt/surface";
import { paintTriads, SOURCE_CELL } from "@features/crt/triads";

const COMPOSITION_SCALE = 3;
const EXPORT_MAX_SIDE = 6000;
const FIXED_COLUMNS = 400;
const MIN_CELL_PIXELS = 4;
const MAX_FLAT_WIDTH = 4096;

export type Density = "source" | "fixed";

export const DEFAULT_DENSITY: Density = "source";

export type RenderInput = {
  source: ImageBitmap;
  grain: ImageBitmap | undefined;
  width: number;
  height: number;
  unit: number;
  density: Density;
  createSurface: CreateSurface;
  isStale: () => boolean;
};

export function cellSize(compositionWidth: number, density: Density): number {
  return density === "fixed"
    ? Math.max(SOURCE_CELL, compositionWidth / FIXED_COLUMNS)
    : SOURCE_CELL;
}

export function flatWidth(outputWidth: number, compositionWidth: number, cell: number): number {
  const resolved = Math.min((compositionWidth * MIN_CELL_PIXELS) / cell, MAX_FLAT_WIDTH);
  return Math.max(outputWidth, Math.round(resolved));
}

export async function renderCrt(target: Surface, input: RenderInput): Promise<boolean> {
  const width = input.source.width * COMPOSITION_SCALE;
  const height = input.source.height * COMPOSITION_SCALE;
  const cell = cellSize(width, input.density);
  const flat = input.createSurface(1, 1);
  const painted = await paintTriads(flat, {
    source: input.source,
    grain: input.grain,
    width,
    height,
    pixelScale: flatWidth(input.width, width, cell) / width,
    cellSize: cell,
    createSurface: input.createSurface,
    isStale: input.isStale,
  });
  if (!painted || input.isStale()) return false;
  target.width = input.width;
  target.height = input.height;
  const context = context2d(target);
  if (!context) return false;
  context.imageSmoothingQuality = "high";
  context.drawImage(flat, 0, 0, input.width, input.height);
  applyEffects(context, input, input.unit);
  return true;
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
