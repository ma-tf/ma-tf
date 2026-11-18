const CYCLE_MS = 4000;
const START_DELAY_MS = 2200;
const FORM_END = 900;
const HANG_END = 1600;
const NECK_END = 1950;
const IMPACT = 2400;
const SPLASH_END = 2950;
const STATIC_FRAME_MS = 1250;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_QUERY = "(max-width: 767px)";
const CANVAS_SELECTOR = "[data-still-life-drip-canvas]";

const IMAGE_WIDTH = 2000;
const IMAGE_HEIGHT = 1500;

const CROP = { x: 40, y: 560, width: 320, height: 440 } as const;
const ANCHOR = { x: 175, y: 650 } as const;
const FLOOR_Y = 890;

export type DripContentBox = { scale: number; originX: number; originY: number };

export function resolveContentBox(boxWidth: number, boxHeight: number, cover: boolean) {
  const fit = boxWidth / IMAGE_WIDTH;
  const fill = boxHeight / IMAGE_HEIGHT;
  const scale = cover ? Math.max(fit, fill) : Math.min(fit, fill);
  return { scale, originX: 0, originY: (boxHeight - IMAGE_HEIGHT * scale) / 2 };
}

export type DripGeometry = {
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  floorY: number;
  dropR: number;
  srcY: number;
  srcR: number;
};

export type DripSpeck = { x: number; y: number; r: number; alpha: number };

export type DripFieldState = {
  active: boolean;
  dropY: number;
  dropR: number;
  stretch: number;
  neck: number;
  ripple: number;
  specks: DripSpeck[];
  alpha: number;
};

export function resolveGeometry(canvas: {
  clientWidth: number;
  clientHeight: number;
}): DripGeometry {
  const width = canvas.clientWidth || 1;
  const height = canvas.clientHeight || 1;
  const sx = width / CROP.width;
  const sy = height / CROP.height;
  const dropR = 3;
  return {
    width,
    height,
    anchorX: (ANCHOR.x - CROP.x) * sx,
    anchorY: (ANCHOR.y - CROP.y) * sy,
    floorY: (FLOOR_Y - CROP.y) * sy,
    dropR,
    srcY: (ANCHOR.y - CROP.y) * sy - dropR * 0.25,
    srcR: dropR * 0.38,
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOutQuad = (p: number) => 1 - (1 - p) * (1 - p);
const easeInQuad = (p: number) => p * p;

const SPECKS = [
  { spread: -0.92, rise: 0.55 },
  { spread: -0.42, rise: 0.35 },
  { spread: 0.7, rise: 0.45 },
] as const;

export function dripFieldAt(t: number, g: DripGeometry): DripFieldState {
  const hangY = g.anchorY + g.dropR * 0.82;

  if (t < 0 || t >= SPLASH_END) {
    return {
      active: false,
      dropY: hangY,
      dropR: 0,
      stretch: 1,
      neck: 0,
      ripple: 0,
      specks: [],
      alpha: 0,
    };
  }

  if (t < FORM_END) {
    const dropR = g.dropR * easeOutQuad(t / FORM_END);
    return {
      active: true,
      dropY: g.anchorY + dropR * 0.82,
      dropR,
      stretch: 1,
      neck: 1,
      ripple: 0,
      specks: [],
      alpha: clamp01(t / 260),
    };
  }

  if (t < HANG_END) {
    const shimmer = Math.sin(((t - FORM_END) / 700) * Math.PI * 2) * g.dropR * 0.04;
    return {
      active: true,
      dropY: hangY + shimmer,
      dropR: g.dropR,
      stretch: 1,
      neck: 1,
      ripple: 0,
      specks: [],
      alpha: 1,
    };
  }

  if (t < NECK_END) {
    const sag = easeInQuad((t - HANG_END) / (NECK_END - HANG_END));
    return {
      active: true,
      dropY: hangY + sag * g.dropR * 0.35,
      dropR: g.dropR,
      stretch: 1 + sag * 0.1,
      neck: 1 - sag,
      ripple: 0,
      specks: [],
      alpha: 1,
    };
  }

  if (t < IMPACT) {
    const fall = easeInQuad((t - NECK_END) / (IMPACT - NECK_END));
    const target = g.floorY - g.dropR * 0.62;
    const from = hangY + g.dropR * 0.35;
    return {
      active: true,
      dropY: from + (target - from) * fall,
      dropR: g.dropR,
      stretch: 1.1 + fall * 0.08,
      neck: 0,
      ripple: 0,
      specks: [],
      alpha: 1,
    };
  }

  const q = (t - IMPACT) / (SPLASH_END - IMPACT);
  const sink = clamp01(q * 1.4);
  const speckProgress = clamp01(q * 1.15);
  const specks: DripSpeck[] = SPECKS.map(({ spread, rise }) => ({
    x: g.anchorX + spread * g.dropR * speckProgress,
    y: g.floorY - g.dropR * 0.15 - rise * g.dropR * 4 * speckProgress * (1 - speckProgress),
    r: g.dropR * 0.14,
    alpha: clamp01(speckProgress * 6) * (1 - speckProgress),
  }));

  return {
    active: true,
    dropY: g.floorY - g.dropR * 0.62 + sink * g.dropR * 0.3,
    dropR: g.dropR * (1 - 0.45 * clamp01(q * 2.2)),
    stretch: Math.max(0.68, 1.18 - 0.5 * clamp01(q * 3)),
    neck: 0,
    ripple: clamp01(q * 1.3),
    specks,
    alpha: 1 - clamp01(q * 2.4),
  };
}

const VERTEX_SOURCE = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `
precision mediump float;
uniform vec2 u_res;
uniform vec2 u_size;
uniform float u_dpr;
uniform float u_dark;
uniform sampler2D u_tex_light;
uniform sampler2D u_tex_dark;
uniform float u_drop_x;
uniform float u_drop_y;
uniform float u_drop_r;
uniform float u_src_y;
uniform float u_src_r;
uniform float u_stretch;
uniform float u_neck;
uniform float u_alpha;
uniform float u_ripple;
uniform float u_floor_y;
uniform vec4 u_speck0;
uniform vec4 u_speck1;
uniform vec4 u_speck2;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdDrop(vec2 p) {
  vec2 q = p - vec2(u_drop_x, u_drop_y);
  q = vec2(q.x * u_stretch, q.y / u_stretch);
  return length(q) - u_drop_r;
}

float sdSpeck(vec2 p, vec4 s) {
  return length(p - s.xy) - s.z;
}

float ringField(vec2 p) {
  vec2 rq = p - vec2(u_drop_x, u_floor_y - 1.0);
  rq.y /= 0.30;
  return abs(length(rq) - (u_drop_r * (0.9 + u_ripple * 2.8))) - u_drop_r * 0.22 * (1.0 - u_ripple * 0.45);
}

void main() {
  vec2 p = gl_FragCoord.xy / u_dpr;
  p.y = u_size.y - p.y;
  vec2 uv = p / u_size;

  float src = length(vec2(p.x - u_drop_x, p.y - u_src_y)) - u_src_r;
  float blob = smin(src, sdDrop(p), max(u_neck * u_drop_r * 1.1, 0.35));
  float blobMask = 1.0 - smoothstep(-0.75, 0.75, blob);

  float ring = u_ripple > 0.001 ? ringField(p) : 1e5;
  float others = ring;
  float otherAlpha = u_ripple > 0.001 ? (1.0 - smoothstep(-0.9, 0.9, ring)) * (1.0 - u_ripple) : 0.0;
  float sd0 = sdSpeck(p, u_speck0);
  float sd1 = sdSpeck(p, u_speck1);
  float sd2 = sdSpeck(p, u_speck2);
  others = min(min(others, sd0), min(sd1, sd2));
  otherAlpha = max(otherAlpha, (1.0 - smoothstep(-0.6, 0.6, sd0)) * u_speck0.w);
  otherAlpha = max(otherAlpha, (1.0 - smoothstep(-0.6, 0.6, sd1)) * u_speck1.w);
  otherAlpha = max(otherAlpha, (1.0 - smoothstep(-0.6, 0.6, sd2)) * u_speck2.w);

  float a = clamp(blobMask * u_alpha + otherAlpha, 0.0, 1.0);
  if (a <= 0.004) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec3 steel = u_dark > 0.5 ? vec3(0.48, 0.59, 0.75) : vec3(0.36, 0.48, 0.65);
  vec3 col;
  if (blobMask > 0.001) {
    vec2 n = normalize(p - vec2(u_drop_x, u_drop_y) + vec2(1e-4));
    float edge = clamp(length(p - vec2(u_drop_x, u_drop_y)) / max(u_drop_r, 1.0), 0.0, 1.0);
    vec2 lens = n * (edge * edge) * u_drop_r * 0.42;
    vec2 ruv = clamp(uv + lens / u_size, 0.0, 1.0);
    vec3 refr = u_dark > 0.5
      ? texture2D(u_tex_dark, ruv).rgb
      : texture2D(u_tex_light, ruv).rgb;
    vec3 tinted = mix(refr, steel, 0.42);
    vec2 lightDir = normalize(vec2(-0.45, -0.85));
    float spec = pow(max(dot(n, lightDir), 0.0), 22.0) * 0.38;
    col = tinted + spec;
  } else {
    col = steel * 1.12;
  }

  gl_FragColor = vec4(col * a, a);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function loadTexture(gl: WebGLRenderingContext, url: string) {
  return new Promise<WebGLTexture | null>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const texture = gl.createTexture();
      if (!texture) {
        resolve(null);
        return;
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      resolve(texture);
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

let started = false;

/**
 * Renders the still-life hero drip: a metaball water drop that swells under
 * the drawn mushroom cap, necks, falls to the objects' floor line and
 * splashes, refracting the still-life art through itself. One 8.5s cycle on
 * a canvas inside the still-life parallax positioner, transparent at rest so
 * the drifting art shows through. Continuous decorative motion: exempt from
 * the 150ms budget of ADR 011, not gated by `data-motion`, declined under
 * `prefers-reduced-motion` to a single static frame of the hanging drop. No
 * WebGL means no drip.
 */
export function startStillLifeDripShader() {
  if (started) return;
  started = true;

  const canvas = document.querySelector<HTMLCanvasElement>(CANVAS_SELECTOR);
  if (!canvas) return;

  const gl = canvas.getContext("webgl", { alpha: true, preserveDrawingBuffer: true });
  if (!gl) return;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  if (!program) return;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  if (!buffer) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const u = {
    res: gl.getUniformLocation(program, "u_res"),
    size: gl.getUniformLocation(program, "u_size"),
    dpr: gl.getUniformLocation(program, "u_dpr"),
    dark: gl.getUniformLocation(program, "u_dark"),
    dropX: gl.getUniformLocation(program, "u_drop_x"),
    dropY: gl.getUniformLocation(program, "u_drop_y"),
    dropR: gl.getUniformLocation(program, "u_drop_r"),
    srcY: gl.getUniformLocation(program, "u_src_y"),
    srcR: gl.getUniformLocation(program, "u_src_r"),
    stretch: gl.getUniformLocation(program, "u_stretch"),
    neck: gl.getUniformLocation(program, "u_neck"),
    alpha: gl.getUniformLocation(program, "u_alpha"),
    ripple: gl.getUniformLocation(program, "u_ripple"),
    floorY: gl.getUniformLocation(program, "u_floor_y"),
    specks: [
      gl.getUniformLocation(program, "u_speck0"),
      gl.getUniformLocation(program, "u_speck1"),
      gl.getUniformLocation(program, "u_speck2"),
    ],
  };

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let geometry = resolveGeometry(canvas);

  const positionCanvas = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const box = resolveContentBox(parent.clientWidth, parent.clientHeight, mobile.matches);
    canvas.style.left = `${box.originX + CROP.x * box.scale}px`;
    canvas.style.top = `${box.originY + CROP.y * box.scale}px`;
    canvas.style.width = `${CROP.width * box.scale}px`;
    canvas.style.height = `${CROP.height * box.scale}px`;
  };

  const syncSize = () => {
    positionCanvas();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    geometry = resolveGeometry(canvas);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.res, w, h);
    gl.uniform2f(u.size, geometry.width, geometry.height);
    gl.uniform1f(u.dpr, dpr);
  };

  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const mobile = window.matchMedia(MOBILE_QUERY);
  let dark = document.documentElement.classList.contains("dark");
  const darkObserver = new MutationObserver(() => {
    dark = document.documentElement.classList.contains("dark");
  });
  darkObserver.observe(document.documentElement, {
    attributeFilter: ["class"],
    attributes: true,
  });

  let raf = 0;
  let t0 = 0;

  const drawFrame = (state: DripFieldState) => {
    gl.uniform1f(u.dark, dark ? 1 : 0);
    gl.uniform1f(u.dropX, geometry.anchorX);
    gl.uniform1f(u.dropY, state.dropY);
    gl.uniform1f(u.dropR, Math.max(state.dropR, 0.001));
    gl.uniform1f(u.srcY, geometry.srcY);
    gl.uniform1f(u.srcR, geometry.srcR);
    gl.uniform1f(u.stretch, state.stretch);
    gl.uniform1f(u.neck, state.neck);
    gl.uniform1f(u.alpha, state.alpha);
    gl.uniform1f(u.ripple, state.ripple);
    gl.uniform1f(u.floorY, geometry.floorY);
    for (let i = 0; i < 3; i += 1) {
      const speck = state.specks[i];
      const location = u.specks[i];
      if (location) {
        gl.uniform4f(location, speck?.x ?? 0, speck?.y ?? 0, speck?.r ?? 0, speck?.alpha ?? 0);
      }
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const drawStatic = () => {
    syncSize();
    drawFrame(dripFieldAt(STATIC_FRAME_MS, geometry));
  };

  const tick = () => {
    raf = 0;
    if (reducedMotion.matches) {
      drawStatic();
      return;
    }
    const t = performance.now() - t0;
    if (t >= START_DELAY_MS) {
      const state = dripFieldAt((t - START_DELAY_MS) % CYCLE_MS, geometry);
      if (state.active) drawFrame(state);
    }
    raf = requestAnimationFrame(tick);
  };

  const begin = () => {
    syncSize();
    if (reducedMotion.matches) {
      drawStatic();
      return;
    }
    t0 = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const onResize = () => {
    if (reducedMotion.matches) {
      drawStatic();
      return;
    }
    syncSize();
  };

  const onContextLost = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    darkObserver.disconnect();
    window.removeEventListener("resize", onResize);
  };

  canvas.addEventListener("webglcontextlost", onContextLost);
  window.addEventListener("resize", onResize);

  Promise.all([
    loadTexture(gl, "/still-life-drip-light.webp"),
    loadTexture(gl, "/still-life-drip-dark.webp"),
  ])
    .then(([light, darkTexture]) => {
      if (!light || !darkTexture) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, light);
      gl.uniform1i(gl.getUniformLocation(program, "u_tex_light"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, darkTexture);
      gl.uniform1i(gl.getUniformLocation(program, "u_tex_dark"), 1);
      begin();
    })
    .catch(() => {});
}
