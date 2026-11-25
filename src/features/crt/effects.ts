export type Box = { width: number; height: number };

type Stop = readonly [offset: number, colour: string];

type Ellipse = { rx: number; ry: number; cx: number; cy: number };

const CLEAR_WHITE = "rgb(255 255 255 / 0)";
const CLEAR_BLACK = "rgb(0 0 0 / 0)";
const CORNER_RADIUS = 4;

export function gradientLine(angle: number, box: Box) {
  const radians = (angle * Math.PI) / 180;
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);
  const half = (Math.abs(box.width * dx) + Math.abs(box.height * dy)) / 2;
  const centreX = box.width / 2;
  const centreY = box.height / 2;
  return {
    x0: centreX - dx * half,
    y0: centreY - dy * half,
    x1: centreX + dx * half,
    y1: centreY + dy * half,
  };
}

function addStops(gradient: CanvasGradient, stops: readonly Stop[]) {
  for (const [offset, colour] of stops) gradient.addColorStop(offset, colour);
}

function fillLinear(
  context: CanvasRenderingContext2D,
  box: Box,
  angle: number,
  stops: readonly Stop[],
) {
  const line = gradientLine(angle, box);
  const gradient = context.createLinearGradient(line.x0, line.y0, line.x1, line.y1);
  addStops(gradient, stops);
  context.fillStyle = gradient;
  context.fillRect(0, 0, box.width, box.height);
}

function fillRadial(
  context: CanvasRenderingContext2D,
  box: Box,
  ellipse: Ellipse,
  stops: readonly Stop[],
) {
  const radiusX = ellipse.rx * box.width;
  const squash = (ellipse.ry * box.height) / radiusX;
  const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radiusX);
  addStops(gradient, stops);
  context.save();
  context.translate(ellipse.cx * box.width, ellipse.cy * box.height);
  context.scale(1, squash);
  context.fillStyle = gradient;
  context.fillRect(
    -ellipse.cx * box.width,
    (-ellipse.cy * box.height) / squash,
    box.width,
    box.height / squash,
  );
  context.restore();
}

function clipCorners(context: CanvasRenderingContext2D, box: Box, radius: number) {
  context.save();
  context.globalCompositeOperation = "destination-in";
  context.fillStyle = "#000";
  context.beginPath();
  context.roundRect(0, 0, box.width, box.height, radius);
  context.fill();
  context.restore();
}

export function applyEffects(context: CanvasRenderingContext2D, box: Box, unit: number) {
  fillLinear(context, box, 112, [
    [0, "rgb(255 255 255 / 0.09)"],
    [0.34, CLEAR_WHITE],
  ]);
  fillRadial(context, box, { rx: 0.6, ry: 0.4, cx: 0.22, cy: 0.08 }, [
    [0, "rgb(255 255 255 / 0.06)"],
    [0.7, CLEAR_WHITE],
  ]);
  fillRadial(context, box, { rx: 1.18, ry: 1.08, cx: 0.5, cy: 0.5 }, [
    [0.52, CLEAR_BLACK],
    [1, "rgb(0 0 0 / 0.5)"],
  ]);
  clipCorners(context, box, CORNER_RADIUS * unit);
}
