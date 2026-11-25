import type { Canvas2D, CreateSurface, Surface } from "@features/crt/surface";

import { context2d } from "@features/crt/surface";

const GLOW_CONTRAST = 1.9;
const GLOW_ALPHA = 0.9;

export function supportsFilter(context: Canvas2D): boolean {
  if (!("filter" in context)) return false;
  const previous = context.filter;
  context.filter = "blur(1px)";
  const supported = context.filter === "blur(1px)";
  context.filter = previous;
  return supported;
}

export function contrastPixels(data: Uint8ClampedArray, amount: number) {
  for (let index = 0; index < data.length; index += 4) {
    for (let channel = index; channel < index + 3; channel += 1) {
      data[channel] = ((data[channel] ?? 0) - 128) * amount + 128;
    }
  }
}

function filteredGlow(glow: Canvas2D, source: Surface, blur: number) {
  glow.filter = `contrast(${GLOW_CONTRAST}) blur(${blur}px)`;
  glow.drawImage(source, 0, 0);
  glow.filter = "none";
}

export function softGlowSize(width: number, height: number, blur: number) {
  const factor = Math.max(1, blur * 2);
  return {
    width: Math.max(1, Math.round(width / factor)),
    height: Math.max(1, Math.round(height / factor)),
  };
}

function scaledGlow(glow: Canvas2D, source: Surface, blur: number, createSurface: CreateSurface) {
  const size = softGlowSize(source.width, source.height, blur);
  const small = createSurface(size.width, size.height);
  const smallContext = context2d(small, true);
  if (!smallContext) return;
  smallContext.imageSmoothingQuality = "high";
  smallContext.drawImage(source, 0, 0, size.width, size.height);
  const pixels = smallContext.getImageData(0, 0, size.width, size.height);
  contrastPixels(pixels.data, GLOW_CONTRAST);
  smallContext.putImageData(pixels, 0, 0);
  glow.imageSmoothingQuality = "high";
  glow.drawImage(small, 0, 0, source.width, source.height);
}

export function glowPass(target: Surface, pixelScale: number, createSurface: CreateSurface) {
  const context = context2d(target);
  const glow = createSurface(target.width, target.height);
  const glowContext = context2d(glow);
  if (!context || !glowContext) return;
  const blur = 3 * pixelScale;
  if (supportsFilter(glowContext)) filteredGlow(glowContext, target, blur);
  else scaledGlow(glowContext, target, blur, createSurface);
  context.globalCompositeOperation = "screen";
  context.globalAlpha = GLOW_ALPHA;
  context.drawImage(glow, 0, 0);
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
}
