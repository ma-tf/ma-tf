export type WirePoint = {
  x: number;
  y: number;
};

type Spring = {
  x: number;
  v: number;
};

type Tracker = {
  x: number;
  y: number;
  speed: number;
};

type PairMotion = {
  sway: [Spring, Spring];
  sag: [Spring, Spring];
  track: [Tracker, Tracker];
};

type WireShape = {
  bowNear: number;
  spanPull: number;
  bowFar: number;
  dropNear: number;
  dropFar: number;
};

const ORIGIN_X = 60;
const MOBILE_ORIGIN_X = 20;
const MOBILE_QUERY = "(max-width: 767px)";
const ORIGIN_SPREAD = 3;
const ORIGIN_PAIR_GAP = 10;
const BASE_STIFFNESS = 30;
const STIFFNESS_CYCLE = 3;
const STIFFNESS_STEP = 0.1;
const DAMPING_RATIO = 0.3;
const SECOND_WIRE_DRIVE_RATIO = 0.6;
const IDLE_PX = 7;
const IDLE_HZ = 0.1875;
const PAIR_PHASE_STEP = 0.9;
const SAG_STIFFNESS = 25;
const SAG_DAMPING_RATIO = 0.8;
const SAG_GAIN = 0.06;
const MAX_SAG = 56;
const SWOOP_MAX = 56;
const SWOOP_PER_Y = 0.12;
const SAG_MID_SHARE = 0.5;
const VELOCITY_SMOOTHING = 0.3;
const FRAME_CLAMP_S = 0.05;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const WIRE_SHAPES: [WireShape, WireShape] = [
  { bowNear: 0.3, spanPull: 0.55, bowFar: 0.7, dropNear: 0.4, dropFar: 0.62 },
  { bowNear: 0.2, spanPull: 0.45, bowFar: 0.5, dropNear: 0.5, dropFar: 0.68 },
];

const SVG_SELECTOR = "svg[data-home-wires]";
const FRONT_SVG_SELECTOR = "svg[data-home-wires-front]";
const SHELL_SELECTOR = "[data-grid-spotlight]";
const NAV_SELECTOR = 'nav[aria-label="Sections"]';
const MARKER_SELECTOR = "span[data-wire-landing]";
const REVEAL_SELECTOR = "[data-prev-reveal]";
const PATH_SELECTOR = "path[data-home-wire]";
const FRONT_PATH_SELECTOR = "path[data-home-wire-front]";
const TITLE_SELECTOR = "[data-title]";

const round = (value: number) => Math.round(value * 10) / 10;

export function stepSpring(
  spring: Spring,
  dt: number,
  stiffness: number,
  dampingRatio: number,
  drive: number,
) {
  const damping = 2 * dampingRatio * Math.sqrt(stiffness);
  spring.v += (-stiffness * spring.x - damping * spring.v + drive) * dt;
  spring.x += spring.v * dt;
}

export function idleDrive(timeS: number, pairIndex: number, stiffness: number) {
  return (
    Math.sin(timeS * 2 * Math.PI * IDLE_HZ + pairIndex * PAIR_PHASE_STEP) * IDLE_PX * stiffness
  );
}

export function stepSag(spring: Spring, dt: number, target: number) {
  const damping = 2 * SAG_DAMPING_RATIO * Math.sqrt(SAG_STIFFNESS);
  spring.v += (SAG_STIFFNESS * (target - spring.x) - damping * spring.v) * dt;
  spring.x += spring.v * dt;
}

export function sagTarget(speedPxPerS: number) {
  return Math.min(MAX_SAG, speedPxPerS * SAG_GAIN);
}

export function trackSpeed(tracker: Tracker, position: WirePoint, dt: number) {
  if (dt <= 0) return sagTarget(tracker.speed);
  const speed = Math.hypot(position.x - tracker.x, position.y - tracker.y) / dt;
  tracker.x = position.x;
  tracker.y = position.y;
  tracker.speed += VELOCITY_SMOOTHING * (speed - tracker.speed);
  return sagTarget(tracker.speed);
}

export function pairStiffness(pairIndex: number) {
  return BASE_STIFFNESS * (1 + (pairIndex % STIFFNESS_CYCLE) * STIFFNESS_STEP);
}

function singleWirePath(
  anchorX: number,
  anchorY: number,
  landing: WirePoint,
  shape: WireShape,
  sway: number,
  sag: number,
) {
  const swoop = Math.min(SWOOP_MAX, landing.y * SWOOP_PER_Y);
  const span = landing.x - anchorX;
  const c1x = anchorX - swoop * shape.bowNear + sway;
  const c2x = landing.x - span * shape.spanPull - swoop * shape.bowFar + sway;
  return `M ${round(anchorX)},${round(anchorY)} C ${round(c1x)},${round(landing.y * shape.dropNear + sag * SAG_MID_SHARE)} ${round(c2x)},${round(landing.y * shape.dropFar + sag)} ${round(landing.x)},${round(landing.y)}`;
}

export function wirePaths(
  index: number,
  landingA: WirePoint,
  landingB: WirePoint,
  offsets: [number, number] = [0, 0],
  sagA = 0,
  sagB = sagA,
  originX = ORIGIN_X,
  anchors?: [WirePoint, WirePoint],
): [string, string] {
  const anchorA = anchors?.[0] ?? { x: originX + index * ORIGIN_SPREAD, y: 0 };
  const anchorB = anchors?.[1] ?? { x: originX + ORIGIN_PAIR_GAP + index * ORIGIN_SPREAD, y: 0 };
  return [
    singleWirePath(anchorA.x, anchorA.y, landingA, WIRE_SHAPES[0], offsets[0], sagA),
    singleWirePath(anchorB.x, anchorB.y, landingB, WIRE_SHAPES[1], offsets[1], sagB),
  ];
}

export function startHomeWires(): void {
  const svg = document.querySelector<SVGSVGElement>(SVG_SELECTOR);
  if (!svg) return;
  const markers = Array.from(document.querySelectorAll<HTMLSpanElement>(MARKER_SELECTOR));
  if (markers.length === 0) return;
  const paths = Array.from(svg.querySelectorAll<SVGPathElement>(PATH_SELECTOR));
  const frontSvg = document.querySelector<SVGSVGElement>(FRONT_SVG_SELECTOR);
  const frontPaths = Array.from(document.querySelectorAll<SVGPathElement>(FRONT_PATH_SELECTOR));
  const pairCount = Math.floor(markers.length / 2);
  const linkedPairs = Array.from(
    { length: pairCount },
    (_, pair) => markers[pair * 2]?.hasAttribute("data-wire-linked") ?? false,
  );
  const reveal = document.querySelector<HTMLElement>(REVEAL_SELECTOR);
  const bandHeight = () => reveal?.getBoundingClientRect().height ?? 0;
  const originFor = () => (window.matchMedia(MOBILE_QUERY).matches ? MOBILE_ORIGIN_X : ORIGIN_X);
  const frontSlot = (pair: number) =>
    markers.slice(0, pair * 2).filter((marker) => marker.hasAttribute("data-wire-linked")).length *
    2;
  const frontOrigin = (): WirePoint => {
    const rect = frontSvg?.getBoundingClientRect();
    return { x: rect?.left ?? 0, y: rect?.top ?? 0 };
  };
  const local = (point: WirePoint, origin: WirePoint): WirePoint => ({
    x: point.x - origin.x,
    y: point.y - origin.y,
  });

  const readPairEnds = (pair: number): [WirePoint, WirePoint] | null => {
    const rectA = markers[pair * 2]?.getBoundingClientRect();
    const rectB = markers[pair * 2 + 1]?.getBoundingClientRect();
    if (!rectA || !rectB) return null;
    const visible = (rect: DOMRect) => !(rect.left === 0 && rect.top === 0 && rect.width === 0);
    if (!visible(rectA) || !visible(rectB)) return null;
    return [
      { x: rectA.left, y: rectA.top },
      { x: rectB.left, y: rectB.top },
    ];
  };

  const readPairAnchors = (pair: number): [WirePoint, WirePoint] | undefined => {
    const value = markers[pair * 2]?.getAttribute("data-wire-origin");
    if (value === null || value === undefined) return undefined;
    const [first, second] = value.split(",").map(Number);
    if (first === undefined || !Number.isFinite(first)) return undefined;
    return [
      { x: window.innerWidth - first, y: 0 },
      { x: window.innerWidth - (second ?? first - ORIGIN_PAIR_GAP), y: 0 },
    ];
  };

  const paintPair = (
    pair: number,
    first: WirePoint,
    second: WirePoint,
    offsets: [number, number],
    sagA: number,
    sagB: number,
  ) => {
    const linked = markers[pair * 2]?.hasAttribute("data-wire-linked") ?? false;
    if (linked) {
      const origin = frontOrigin();
      const [firstD, secondD] = wirePaths(
        pair,
        local(second, origin),
        local({ x: second.x - ORIGIN_PAIR_GAP, y: second.y }, origin),
        offsets,
        sagA,
        sagB,
        originFor(),
        [
          local({ x: first.x, y: first.y }, origin),
          local({ x: first.x - ORIGIN_PAIR_GAP, y: first.y }, origin),
        ],
      );
      const slot = frontSlot(pair);
      frontPaths[slot]?.setAttribute("d", firstD);
      frontPaths[slot + 1]?.setAttribute("d", secondD);
      return;
    }
    const [firstD, secondD] = wirePaths(
      pair,
      first,
      second,
      offsets,
      sagA,
      sagB,
      originFor(),
      readPairAnchors(pair),
    );
    paths[pair * 2]?.setAttribute("d", firstD);
    paths[pair * 2 + 1]?.setAttribute("d", secondD);
  };

  const clearPair = (pair: number) => {
    paths[pair * 2]?.setAttribute("d", "");
    paths[pair * 2 + 1]?.setAttribute("d", "");
    if (markers[pair * 2]?.hasAttribute("data-wire-linked")) {
      const slot = frontSlot(pair);
      frontPaths[slot]?.setAttribute("d", "");
      frontPaths[slot + 1]?.setAttribute("d", "");
    }
  };

  const paintRest = () => {
    for (let pair = 0; pair < pairCount; pair++) {
      const ends = readPairEnds(pair);
      if (!ends || (linkedPairs[pair] && bandHeight() < 1)) {
        clearPair(pair);
        continue;
      }
      paintPair(pair, ends[0], ends[1], [0, 0], 0, 0);
    }
  };

  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
    const repaint = () => paintRest();
    repaint();
    window.addEventListener("resize", repaint, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(repaint);
      for (const element of document.querySelectorAll(`${SHELL_SELECTOR}, ${NAV_SELECTOR}`)) {
        observer.observe(element);
      }
    }
    const onCrossing = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(TITLE_SELECTOR)) {
        repaint();
      }
    };
    document.addEventListener("pointerover", onCrossing);
    document.addEventListener("pointerout", onCrossing);
    return;
  }

  const motions: PairMotion[] = Array.from({ length: pairCount }, () => ({
    sway: [
      { x: 0, v: 0 },
      { x: 0, v: 0 },
    ],
    sag: [
      { x: 0, v: 0 },
      { x: 0, v: 0 },
    ],
    track: [
      { x: 0, y: 0, speed: 0 },
      { x: 0, y: 0, speed: 0 },
    ],
  }));
  let last = performance.now();
  let primed = false;
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, FRAME_CLAMP_S);
    last = now;
    const timeS = now / 1000;
    for (let pair = 0; pair < pairCount; pair++) {
      const ends = readPairEnds(pair);
      const motion = motions[pair];
      if (!motion) continue;
      if (!ends) {
        clearPair(pair);
        continue;
      }
      if (!primed) {
        motion.track[0].x = ends[0].x;
        motion.track[0].y = ends[0].y;
        motion.track[1].x = ends[1].x;
        motion.track[1].y = ends[1].y;
      } else {
        stepSag(motion.sag[0], dt, trackSpeed(motion.track[0], ends[0], dt));
        stepSag(motion.sag[1], dt, trackSpeed(motion.track[1], ends[1], dt));
      }
      const stiffness = pairStiffness(pair);
      const drive = idleDrive(timeS, pair, stiffness);
      stepSpring(motion.sway[0], dt, stiffness, DAMPING_RATIO, drive);
      stepSpring(motion.sway[1], dt, stiffness, DAMPING_RATIO, drive * SECOND_WIRE_DRIVE_RATIO);
      if (linkedPairs[pair] && bandHeight() < 1) {
        clearPair(pair);
        continue;
      }
      paintPair(
        pair,
        ends[0],
        ends[1],
        [motion.sway[0].x, motion.sway[1].x],
        motion.sag[0].x,
        motion.sag[1].x,
      );
    }
    primed = true;
    requestAnimationFrame(frame);
  };
  paintRest();
  requestAnimationFrame(frame);
}
