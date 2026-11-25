import type { TriadGrid } from "@features/crt/layout";
import type { Homography, Placement } from "@features/crt/project";

import { tone } from "@features/crt/layout";
import { applyHomography } from "@features/crt/project";

export const PIXEL_RADIUS = 1 / Math.sqrt(Math.PI);

export type Rgb = [number, number, number];

export type SampleAt = (column: number, row: number) => Rgb;

export function discCoverage(radius: number, distance: number): number {
  const pixel = PIXEL_RADIUS;
  if (radius <= 0 || distance >= radius + pixel) return 0;
  if (distance <= Math.abs(radius - pixel)) return Math.PI * Math.min(radius, pixel) ** 2;
  const near = Math.acos((distance ** 2 + radius ** 2 - pixel ** 2) / (2 * distance * radius));
  const far = Math.acos((distance ** 2 + pixel ** 2 - radius ** 2) / (2 * distance * pixel));
  const kite =
    (-distance + radius + pixel) *
    (distance + radius - pixel) *
    (distance - radius + pixel) *
    (distance + radius + pixel);
  return radius ** 2 * near + pixel ** 2 * far - 0.5 * Math.sqrt(Math.max(0, kite));
}

export function triadReach(cell: number): number {
  return cell * 0.72 + 0.6;
}

export function rowSpan(y: number, cell: number, reach: number): [number, number] {
  const origin = cell * 0.57 + cell / 2;
  return [Math.ceil((y - reach - origin) / cell), Math.floor((y + reach - origin) / cell)];
}

export function columnSpan(x: number, row: number, cell: number, reach: number): [number, number] {
  const origin = cell * 0.82 + cell / 2 + (row % 2 === 0 ? cell / 2 : 0);
  return [Math.ceil((x - reach - origin) / cell), Math.floor((x + reach - origin) / cell)];
}

export function sampleCell(value: number, pitch: number, size: number): number {
  return Math.min(size - 1, Math.max(0, Math.floor(value / pitch + 0.5)));
}

export function quantise(value: number): number {
  return Math.floor(value + 0.5);
}

function toLocal(layout: TriadGrid, x: number, y: number, h: Homography, out: Placement) {
  applyHomography(h, x - layout.width / 2, y - layout.height / 2, out);
  out.x += layout.width / 2;
  out.y += layout.height / 2;
}

type Shading = {
  layout: TriadGrid;
  forward: Homography;
  sample: SampleAt;
  pixelX: number;
  pixelY: number;
};

function channelAt(shading: Shading, x: number, y: number, channel: 0 | 1 | 2): number {
  const { layout } = shading;
  const column = sampleCell(x, layout.pitch, layout.sampleColumns);
  const row = sampleCell(y, layout.pitch, layout.sampleRows);
  return shading.sample(column, row)[channel];
}

function discAt(shading: Shading, x: number, y: number, radius: number): number {
  const placed = { x: 0, y: 0, scale: 1 };
  toLocal(shading.layout, x, y, shading.forward, placed);
  const distance = Math.hypot(shading.pixelX - placed.x, shading.pixelY - placed.y);
  return discCoverage(radius * placed.scale, distance);
}

function addTriad(shading: Shading, row: number, column: number, sum: Rgb) {
  const { cell } = shading.layout;
  const x = cell * 0.82 + column * cell + cell / 2 + (row % 2 === 0 ? cell / 2 : 0);
  const y = cell * 0.57 + row * cell + cell / 2;
  const spread = cell * 0.29;
  const red = channelAt(shading, x - spread, y - spread, 0);
  const green = channelAt(shading, x + spread, y - spread, 1);
  const blue = channelAt(shading, x, y + spread, 2);
  const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  const toned = [tone(red, luma), tone(green, luma), tone(blue, luma)].map(quantise);
  const whole = 0.5 * discAt(shading, x, y, cell * 0.5);
  sum[0] += (toned[0] ?? 0) * (whole + discAt(shading, x - spread, y - spread, cell * 0.28));
  sum[1] += (toned[1] ?? 0) * (whole + discAt(shading, x + spread, y - spread, cell * 0.28));
  sum[2] += (toned[2] ?? 0) * (whole + discAt(shading, x, y + spread, cell * 0.28));
}

export type ShadeInput = {
  layout: TriadGrid;
  forward: Homography;
  inverse: Homography;
  sample: SampleAt;
};

export function shadeTriads(input: ShadeInput, pixelX: number, pixelY: number): Rgb {
  const { layout } = input;
  const flat = { x: 0, y: 0, scale: 1 };
  toLocal(layout, pixelX, pixelY, input.inverse, flat);
  const reach = triadReach(layout.cell);
  const shading = { ...input, pixelX, pixelY };
  const sum: Rgb = [0, 0, 0];
  const [rowStart, rowEnd] = rowSpan(flat.y, layout.cell, reach);
  for (let row = Math.max(0, rowStart); row <= Math.min(layout.rows - 1, rowEnd); row += 1) {
    const [columnStart, columnEnd] = columnSpan(flat.x, row, layout.cell, reach);
    for (
      let column = Math.max(0, columnStart);
      column <= Math.min(layout.columns - 1, columnEnd);
      column += 1
    ) {
      addTriad(shading, row, column, sum);
    }
  }
  return sum.map((value) => Math.min(255, value)) as Rgb;
}
