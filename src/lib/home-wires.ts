export type WirePoint = {
  x: number;
  y: number;
};

const ORIGIN_X = 60;
const ORIGIN_SPREAD = 3;
const ORIGIN_PAIR_GAP = 10;
const TRACK_FRAMES = 20;

const round = (value: number) => Math.round(value * 10) / 10;

export function wirePaths(index: number, first: WirePoint, second: WirePoint): [string, string] {
  const anchorA = ORIGIN_X + index * ORIGIN_SPREAD;
  const anchorB = ORIGIN_X + ORIGIN_PAIR_GAP + index * ORIGIN_SPREAD;
  const swoopA = Math.min(56, first.y * 0.12);
  const swoopB = Math.min(56, second.y * 0.12);
  const spanA = first.x - anchorA;
  const spanB = second.x - anchorB;
  return [
    `M ${round(anchorA)},0 C ${round(anchorA - swoopA * 0.3)},${round(first.y * 0.4)} ${round(first.x - spanA * 0.55 - swoopA * 0.7)},${round(first.y * 0.62)} ${round(first.x)},${round(first.y)}`,
    `M ${round(anchorB)},0 C ${round(anchorB - swoopB * 0.2)},${round(second.y * 0.5)} ${round(second.x - spanB * 0.45 - swoopB * 0.5)},${round(second.y * 0.68)} ${round(second.x)},${round(second.y)}`,
  ];
}

const SVG_SELECTOR = "svg[data-home-wires]";
const NAV_SELECTOR = 'nav[aria-label="Sections"]';
const SHELL_SELECTOR = "[data-grid-spotlight]";
const MARKER_SELECTOR = "span[data-wire-landing]";
const PATH_SELECTOR = "path[data-home-wire]";
const TITLE_SELECTOR = "[data-title]";

export function startHomeWires() {
  const svg = document.querySelector<SVGSVGElement>(SVG_SELECTOR);
  if (!svg) return;
  const markers = Array.from(document.querySelectorAll<HTMLSpanElement>(MARKER_SELECTOR));
  if (markers.length === 0) return;
  const paths = Array.from(svg.querySelectorAll<SVGPathElement>(PATH_SELECTOR));

  const paint = () => {
    for (let index = 0; index + 1 < markers.length; index += 2) {
      const a = markers[index]?.getBoundingClientRect();
      const b = markers[index + 1]?.getBoundingClientRect();
      if (!a || !b) continue;
      const [first, second] = wirePaths(
        index / 2,
        { x: a.left, y: a.top },
        { x: b.left, y: b.top },
      );
      paths[index]?.setAttribute("d", first);
      paths[index + 1]?.setAttribute("d", second);
    }
  };

  let tracking = false;

  const track = () => {
    if (tracking) return;
    tracking = true;
    let frames = 0;
    const tick = () => {
      paint();
      frames += 1;
      if (frames >= TRACK_FRAMES) {
        tracking = false;
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const onCrossing = (event: Event) => {
    if (event.target instanceof Element && event.target.closest(TITLE_SELECTOR)) {
      track();
    }
  };

  paint();
  window.addEventListener("resize", paint, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(paint);
    for (const element of document.querySelectorAll(`${SHELL_SELECTOR}, ${NAV_SELECTOR}`)) {
      observer.observe(element);
    }
  }
  document.addEventListener("pointerover", onCrossing);
  document.addEventListener("pointerout", onCrossing);
}
