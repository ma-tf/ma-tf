import type { TriadGrid } from "@features/crt/layout";
import type { Homography } from "@features/crt/project";
import type { CreateSurface, Surface } from "@features/crt/surface";

import {
  BLUR_SHADER,
  COMPOSITE_SHADER,
  TRIAD_SHADER,
  VERTEX_SHADER,
} from "@features/crt/gl-shaders";
import { crtHomography, invertHomography } from "@features/crt/project";
import { contextGl } from "@features/crt/surface";

type Gl = WebGL2RenderingContext;

export type GlLimits = { texture: number; renderbuffer: number; viewport: number };

type Programs = { triad: WebGLProgram; blur: WebGLProgram; composite: WebGLProgram };

type Target = { texture: WebGLTexture; framebuffer: WebGLFramebuffer };

type State = { gl: Gl; surface: Surface; programs: Programs; limits: GlLimits; lost: boolean };

export type TriadGl = {
  render: (samples: Surface, layout: TriadGrid, sigma: number) => Surface | null;
};

const GLOW_CONTRAST = 1.9;
const GLOW_STRENGTH = 0.9;

export function fitsLimits(limits: GlLimits, sizes: readonly number[]): boolean {
  const largest = Math.min(limits.texture, limits.renderbuffer, limits.viewport);
  return sizes.every((size) => size >= 1 && size <= largest);
}

export function blurTaps(sigma: number): number {
  return Math.ceil(3 * sigma);
}

function shader(gl: Gl, type: number, source: string): WebGLShader | null {
  const compiled = gl.createShader(type);
  if (!compiled) return null;
  gl.shaderSource(compiled, source);
  gl.compileShader(compiled);
  return gl.getShaderParameter(compiled, gl.COMPILE_STATUS) ? compiled : null;
}

function program(gl: Gl, fragment: string): WebGLProgram | null {
  const vertexShader = shader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = shader(gl, gl.FRAGMENT_SHADER, fragment);
  const linked = gl.createProgram();
  if (!vertexShader || !fragmentShader || !linked) return null;
  gl.attachShader(linked, vertexShader);
  gl.attachShader(linked, fragmentShader);
  gl.bindAttribLocation(linked, 0, "position");
  gl.linkProgram(linked);
  return gl.getProgramParameter(linked, gl.LINK_STATUS) ? linked : null;
}

function programs(gl: Gl): Programs | null {
  const triad = program(gl, TRIAD_SHADER);
  const blur = program(gl, BLUR_SHADER);
  const composite = program(gl, COMPOSITE_SHADER);
  return triad && blur && composite ? { triad, blur, composite } : null;
}

function readLimits(gl: Gl): GlLimits {
  const viewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array;
  return {
    texture: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
    renderbuffer: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number,
    viewport: Math.min(viewport[0] ?? 0, viewport[1] ?? 0),
  };
}

function bindTriangle(gl: Gl) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

function emptyTexture(gl: Gl): WebGLTexture {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

function sampleTexture(gl: Gl, samples: Surface): WebGLTexture {
  const texture = emptyTexture(gl);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, samples);
  return texture;
}

function renderTarget(gl: Gl, width: number, height: number): Target {
  const texture = emptyTexture(gl);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, width, height);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  return { texture, framebuffer };
}

function bindTexture(gl: Gl, use: WebGLProgram, name: string, unit: number, texture: WebGLTexture) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(gl.getUniformLocation(use, name), unit);
}

function draw(gl: Gl, framebuffer: WebGLFramebuffer | null, width: number, height: number) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.viewport(0, 0, width, height);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function tiltUniforms(gl: Gl, use: WebGLProgram, width: number) {
  const forward: Homography = crtHomography(width);
  gl.uniformMatrix3fv(gl.getUniformLocation(use, "forwardTilt"), true, new Float32Array(forward));
  gl.uniformMatrix3fv(
    gl.getUniformLocation(use, "inverseTilt"),
    true,
    new Float32Array(invertHomography(forward)),
  );
}

function drawTriads(state: State, samples: WebGLTexture, layout: TriadGrid, target: Target) {
  const { gl } = state;
  const use = state.programs.triad;
  gl.useProgram(use);
  bindTexture(gl, use, "samples", 0, samples);
  gl.uniform2f(gl.getUniformLocation(use, "size"), layout.width, layout.height);
  gl.uniform1f(gl.getUniformLocation(use, "cell"), layout.cell);
  gl.uniform1f(gl.getUniformLocation(use, "pitch"), layout.pitch);
  gl.uniform2i(gl.getUniformLocation(use, "grid"), layout.columns, layout.rows);
  gl.uniform2i(gl.getUniformLocation(use, "sampleSize"), layout.sampleColumns, layout.sampleRows);
  tiltUniforms(gl, use, layout.width);
  draw(gl, target.framebuffer, layout.width, layout.height);
}

type BlurPass = { from: WebGLTexture; to: Target; across: boolean; contrast: number };

function drawBlur(state: State, pass: BlurPass, layout: TriadGrid, sigma: number) {
  const { gl } = state;
  const use = state.programs.blur;
  const spread = Math.max(sigma, 0.001);
  gl.useProgram(use);
  bindTexture(gl, use, "image", 0, pass.from);
  gl.uniform2i(gl.getUniformLocation(use, "direction"), pass.across ? 1 : 0, pass.across ? 0 : 1);
  gl.uniform1i(gl.getUniformLocation(use, "taps"), blurTaps(spread));
  gl.uniform1f(gl.getUniformLocation(use, "sigma"), spread);
  gl.uniform1f(gl.getUniformLocation(use, "contrast"), pass.contrast);
  draw(gl, pass.to.framebuffer, layout.width, layout.height);
}

function drawComposite(state: State, triads: Target, glow: Target, layout: TriadGrid) {
  const { gl } = state;
  const use = state.programs.composite;
  gl.useProgram(use);
  bindTexture(gl, use, "base", 0, triads.texture);
  bindTexture(gl, use, "glow", 1, glow.texture);
  gl.uniform1f(gl.getUniformLocation(use, "strength"), GLOW_STRENGTH);
  draw(gl, null, layout.width, layout.height);
}

function release(gl: Gl, textures: WebGLTexture[], targets: Target[]) {
  for (const texture of textures) gl.deleteTexture(texture);
  for (const target of targets) {
    gl.deleteFramebuffer(target.framebuffer);
    gl.deleteTexture(target.texture);
  }
}

function renderGl(state: State, samples: Surface, layout: TriadGrid, sigma: number) {
  const { gl, surface } = state;
  const sizes = [layout.width, layout.height, layout.sampleColumns, layout.sampleRows];
  if (state.lost || gl.isContextLost() || !fitsLimits(state.limits, sizes)) return null;
  surface.width = layout.width;
  surface.height = layout.height;
  const sampled = sampleTexture(gl, samples);
  const targets = [0, 1, 2].map(() => renderTarget(gl, layout.width, layout.height));
  const [triads, across, glow] = targets as [Target, Target, Target];
  drawTriads(state, sampled, layout, triads);
  drawBlur(
    state,
    { from: triads.texture, to: across, across: true, contrast: GLOW_CONTRAST },
    layout,
    sigma,
  );
  drawBlur(state, { from: across.texture, to: glow, across: false, contrast: 0 }, layout, sigma);
  drawComposite(state, triads, glow, layout);
  const healthy = gl.getError() === gl.NO_ERROR && !gl.isContextLost();
  release(gl, [sampled], targets);
  return healthy ? surface : null;
}

export function createTriadGl(createSurface: CreateSurface): TriadGl | null {
  const surface = createSurface(1, 1);
  const gl = contextGl(surface);
  const compiled = gl ? programs(gl) : null;
  if (!gl || !compiled) return null;
  bindTriangle(gl);
  const state: State = { gl, surface, programs: compiled, limits: readLimits(gl), lost: false };
  surface.addEventListener("webglcontextlost", () => {
    state.lost = true;
  });
  return { render: (samples, layout, sigma) => renderGl(state, samples, layout, sigma) };
}
