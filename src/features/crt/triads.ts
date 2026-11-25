import type { Placement, Projector } from "@features/crt/project";

import { crtProjector } from "@features/crt/project";
import { CDN_BASE } from "@lib/cdn";

export const GRAIN_SRC = `${CDN_BASE}/graphics/grain.avif`;

export type TriadGrid = {
  cell: number;
  pitch: number;
  columns: number;
  rows: number;
  sampleColumns: number;
  sampleRows: number;
  width: number;
  height: number;
};

type Pixels = ArrayLike<number>;

type Channels = { red: number; green: number; blue: number };

type Painter = {
  context: CanvasRenderingContext2D;
  placement: Placement;
  project: Projector;
};

const clamp = (value: number) => Math.max(0, Math.min(255, value));

export function tone(value: number, luma: number): number {
  const saturated = clamp(luma + (value - luma) * 1.02);
  const toned = Math.min(255, saturated * 1.05 + (saturated / 255) ** 4 * 70);
  const gain = toned < 128 ? 1.35 : 1.2;
  return clamp(128 + (toned - 128) * gain);
}

export function sampleIndex(x: number, y: number, grid: TriadGrid): number {
  const column = Math.min(grid.sampleColumns - 1, Math.max(0, Math.round(x / grid.pitch)));
  const row = Math.min(grid.sampleRows - 1, Math.max(0, Math.round(y / grid.pitch)));
  return (row * grid.sampleColumns + column) * 4;
}

export function triadGrid(width: number, height: number, pixelScale: number): TriadGrid {
  const cell = 6 * pixelScale;
  const pitch = cell / 3;
  const canvasWidth = Math.round(width * pixelScale);
  const canvasHeight = Math.round(height * pixelScale);
  return {
    cell,
    pitch,
    columns: Math.ceil((canvasWidth - cell * 1.64) / cell),
    rows: Math.ceil((canvasHeight - cell * 1.14) / cell),
    sampleColumns: Math.ceil(canvasWidth / pitch),
    sampleRows: Math.ceil(canvasHeight / pitch),
    width: canvasWidth,
    height: canvasHeight,
  };
}

export function triadCentre(row: number, column: number, cell: number): { x: number; y: number } {
  const stagger = row % 2 === 0 ? cell / 2 : 0;
  return {
    x: cell * 0.82 + column * cell + cell / 2 + stagger,
    y: cell * 0.57 + row * cell + cell / 2,
  };
}

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

function sampleSource(
  source: CanvasImageSource,
  grain: HTMLImageElement | undefined,
  grid: TriadGrid,
): Pixels {
  const scratch = document.createElement("canvas");
  scratch.width = grid.sampleColumns;
  scratch.height = grid.sampleRows;
  const context = scratch.getContext("2d", { willReadFrequently: true });
  if (!context) return [];
  context.drawImage(source, 0, 0, grid.sampleColumns, grid.sampleRows);
  if (grain?.complete && grain.naturalWidth) {
    const rect = grainRect(grid.sampleColumns, grid.sampleRows, {
      width: grain.naturalWidth,
      height: grain.naturalHeight,
    });
    context.globalCompositeOperation = "screen";
    context.drawImage(grain, rect.x, rect.y, rect.width, rect.height);
    context.globalCompositeOperation = "source-over";
  }
  return context.getImageData(0, 0, grid.sampleColumns, grid.sampleRows).data;
}

export function glowPass(target: HTMLCanvasElement, pixelScale: number) {
  const context = target.getContext("2d");
  const glow = document.createElement("canvas");
  glow.width = target.width;
  glow.height = target.height;
  const glowContext = glow.getContext("2d");
  if (!context || !glowContext) return;
  glowContext.filter = `contrast(1.9) blur(${3 * pixelScale}px)`;
  glowContext.drawImage(target, 0, 0);
  context.globalCompositeOperation = "screen";
  context.globalAlpha = 0.9;
  context.drawImage(glow, 0, 0);
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
}

export type TriadOptions = {
  source: CanvasImageSource;
  grain: HTMLImageElement | undefined;
  width: number;
  height: number;
  pixelScale: number;
};

export function paintTriads(target: HTMLCanvasElement, options: TriadOptions) {
  const grid = triadGrid(options.width, options.height, options.pixelScale);
  const input = sampleSource(options.source, options.grain, grid);
  target.width = grid.width;
  target.height = grid.height;
  const context = target.getContext("2d");
  if (!context) return;
  context.fillStyle = "#000";
  context.fillRect(0, 0, grid.width, grid.height);
  context.globalCompositeOperation = "lighter";
  const painter = {
    context,
    placement: { x: 0, y: 0, scale: 1 },
    project: crtProjector(grid.width, grid.height),
  };
  for (let row = 0; row < grid.rows; row += 1) {
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
  context.globalCompositeOperation = "source-over";
  glowPass(target, options.pixelScale);
}
