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

export const SOURCE_CELL = 6;

export function triadGrid(
  width: number,
  height: number,
  pixelScale: number,
  cellSize = SOURCE_CELL,
): TriadGrid {
  const cell = cellSize * pixelScale;
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
