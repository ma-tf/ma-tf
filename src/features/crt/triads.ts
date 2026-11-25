import type { TriadGl } from "@features/crt/gl";
import type { TriadGrid } from "@features/crt/layout";
import type { Placement, Projector } from "@features/crt/project";
import type { Canvas2D, CreateSurface, Surface } from "@features/crt/surface";

import { glowPass } from "@features/crt/glow";
import { sampleIndex, tone, triadCentre, triadGrid } from "@features/crt/layout";
import { crtProjector } from "@features/crt/project";
import { context2d, nextTask } from "@features/crt/surface";
import { CDN_BASE } from "@lib/cdn";

export const GRAIN_SRC = `${CDN_BASE}/graphics/grain.avif`;

type Pixels = ArrayLike<number>;

type Channels = { red: number; green: number; blue: number };

type Painter = {
  context: Canvas2D;
  placement: Placement;
  project: Projector;
};

function triadChannels(input: Pixels, x: number, y: number, grid: TriadGrid): Channels {
  const spread = grid.cell * 0.29;
  const red = input[sampleIndex(x - spread, y - spread, grid)] ?? 0;
  const green = input[sampleIndex(x + spread, y - spread, grid) + 1] ?? 0;
  const blue = input[sampleIndex(x, y + spread, grid) + 2] ?? 0;
  const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return { red: tone(red, luma), green: tone(green, luma), blue: tone(blue, luma) };
}

export function grainRect(columns: number, rows: number, grain: { width: number; height: number }) {
  const factor = Math.max(1, columns / grain.width, rows / grain.height);
  const width = grain.width * factor;
  const height = grain.height * factor;
  return { x: (columns - width) / 2, y: (rows - height) / 2, width, height };
}

function emitDot(painter: Painter, x: number, y: number, radius: number, colour: string) {
  const { context, placement, project } = painter;
  project(x, y, placement);
  context.fillStyle = colour;
  context.beginPath();
  context.arc(placement.x, placement.y, radius * placement.scale, 0, Math.PI * 2);
  context.fill();
}

function emitTriad(painter: Painter, x: number, y: number, cell: number, channels: Channels) {
  const spread = cell * 0.29;
  const radius = cell * 0.28;
  const { red, green, blue } = channels;
  painter.context.globalAlpha = 0.5;
  emitDot(painter, x, y, cell * 0.5, `rgb(${red} ${green} ${blue})`);
  painter.context.globalAlpha = 1;
  emitDot(painter, x - spread, y - spread, radius, `rgb(${red} 0 0)`);
  emitDot(painter, x + spread, y - spread, radius, `rgb(0 ${green} 0)`);
  emitDot(painter, x, y + spread, radius, `rgb(0 0 ${blue})`);
}

function drawSamples(
  source: CanvasImageSource,
  grain: ImageBitmap | undefined,
  grid: TriadGrid,
  createSurface: CreateSurface,
): Surface | null {
  const scratch = createSurface(grid.sampleColumns, grid.sampleRows);
  const context = context2d(scratch, true);
  if (!context) return null;
  context.drawImage(source, 0, 0, grid.sampleColumns, grid.sampleRows);
  if (grain) {
    const rect = grainRect(grid.sampleColumns, grid.sampleRows, grain);
    context.globalCompositeOperation = "screen";
    context.drawImage(grain, rect.x, rect.y, rect.width, rect.height);
    context.globalCompositeOperation = "source-over";
  }
  return scratch;
}

function samplePixels(samples: Surface, grid: TriadGrid): Pixels {
  const context = context2d(samples, true);
  return context ? context.getImageData(0, 0, grid.sampleColumns, grid.sampleRows).data : [];
}

export type TriadOptions = {
  source: CanvasImageSource;
  grain: ImageBitmap | undefined;
  width: number;
  height: number;
  pixelScale: number;
  cellSize: number;
  createSurface: CreateSurface;
  isStale: () => boolean;
  gl?: TriadGl | null | undefined;
};

const SLICE_MS = 40;

function paintRow(painter: Painter, input: Pixels, grid: TriadGrid, row: number) {
  for (let column = 0; column < grid.columns; column += 1) {
    const centre = triadCentre(row, column, grid.cell);
    emitTriad(
      painter,
      centre.x,
      centre.y,
      grid.cell,
      triadChannels(input, centre.x, centre.y, grid),
    );
  }
}

function paintSlice(painter: Painter, input: Pixels, grid: TriadGrid, start: number) {
  const sliceStart = performance.now();
  for (let row = start; row < grid.rows; row += 1) {
    paintRow(painter, input, grid, row);
    if (performance.now() - sliceStart >= SLICE_MS) return { next: row + 1, sliced: true };
  }
  return { next: grid.rows, sliced: false };
}

async function paintRows(
  painter: Painter,
  input: Pixels,
  grid: TriadGrid,
  isStale: () => boolean,
  start = 0,
): Promise<boolean> {
  const slice = paintSlice(painter, input, grid, start);
  if (!slice.sliced) return true;
  await nextTask();
  if (isStale()) return false;
  return paintRows(painter, input, grid, isStale, slice.next);
}

async function paintCanvas(
  target: Surface,
  input: Pixels,
  grid: TriadGrid,
  options: TriadOptions,
): Promise<Surface | null> {
  target.width = grid.width;
  target.height = grid.height;
  const context = context2d(target);
  if (!context) return null;
  context.fillStyle = "#000";
  context.fillRect(0, 0, grid.width, grid.height);
  context.globalCompositeOperation = "lighter";
  const painter = {
    context,
    placement: { x: 0, y: 0, scale: 1 },
    project: crtProjector(grid.width, grid.height),
  };
  const painted = await paintRows(painter, input, grid, options.isStale);
  context.globalCompositeOperation = "source-over";
  if (!painted) return null;
  await nextTask();
  if (options.isStale()) return null;
  glowPass(target, options.pixelScale, options.createSurface);
  return target;
}

export async function paintTriads(target: Surface, options: TriadOptions): Promise<Surface | null> {
  const grid = triadGrid(options.width, options.height, options.pixelScale, options.cellSize);
  const samples = drawSamples(options.source, options.grain, grid, options.createSurface);
  if (!samples) return null;
  await nextTask();
  if (options.isStale()) return null;
  const lit = options.gl?.render(samples, grid, 3 * options.pixelScale);
  if (lit) return options.isStale() ? null : lit;
  return paintCanvas(target, samplePixels(samples, grid), grid, options);
}
