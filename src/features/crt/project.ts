export type Matrix = readonly number[];

export type Placement = { x: number; y: number; scale: number };

export type Projector = (x: number, y: number, out: Placement) => void;

type Tilt = { perspective: number; rotateX: number; rotateY: number; scale: number };

const IDENTITY: Matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function at(matrix: Matrix, row: number, column: number): number {
  return matrix[row * 4 + column] ?? 0;
}

function multiply(left: Matrix, right: Matrix): Matrix {
  return IDENTITY.map((_, index) => {
    const row = Math.floor(index / 4);
    const column = index % 4;
    let sum = 0;
    for (let step = 0; step < 4; step += 1) sum += at(left, row, step) * at(right, step, column);
    return sum;
  });
}

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function perspective(distance: number): Matrix {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1 / distance, 1];
}

function rotateX(degrees: number): Matrix {
  const cos = Math.cos(radians(degrees));
  const sin = Math.sin(radians(degrees));
  return [1, 0, 0, 0, 0, cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1];
}

function rotateY(degrees: number): Matrix {
  const cos = Math.cos(radians(degrees));
  const sin = Math.sin(radians(degrees));
  return [cos, 0, sin, 0, 0, 1, 0, 0, -sin, 0, cos, 0, 0, 0, 0, 1];
}

function scale(factor: number): Matrix {
  return [factor, 0, 0, 0, 0, factor, 0, 0, 0, 0, factor, 0, 0, 0, 0, 1];
}

export function tiltMatrix(tilt: Tilt): Matrix {
  return [
    perspective(tilt.perspective),
    rotateX(tilt.rotateX),
    rotateY(tilt.rotateY),
    scale(tilt.scale),
  ].reduce(multiply, IDENTITY);
}

function crtMatrix(width: number): Matrix {
  return tiltMatrix({ perspective: width * 1.5, rotateX: 1.5, rotateY: -4, scale: 1.06 });
}

export function projector(matrix: Matrix, width: number, height: number): Projector {
  const centreX = width / 2;
  const centreY = height / 2;
  return (x, y, out) => {
    const localX = x - centreX;
    const localY = y - centreY;
    const w = at(matrix, 3, 0) * localX + at(matrix, 3, 1) * localY + at(matrix, 3, 3) || 1;
    out.x =
      (at(matrix, 0, 0) * localX + at(matrix, 0, 1) * localY + at(matrix, 0, 3)) / w + centreX;
    out.y =
      (at(matrix, 1, 0) * localX + at(matrix, 1, 1) * localY + at(matrix, 1, 3)) / w + centreY;
    out.scale = 1 / w;
  };
}

export function crtProjector(width: number, height: number): Projector {
  return projector(crtMatrix(width), width, height);
}
