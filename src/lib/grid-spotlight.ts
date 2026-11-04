const FINE_QUERY = "(pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SELECTOR = "[data-grid-spotlight]";

export function startGridSpotlight() {
  const container = document.querySelector<HTMLElement>(SELECTOR);
  if (!container) return;
  if (!window.matchMedia(FINE_QUERY).matches) return;
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

  let raf = 0;

  const show = (x: number, y: number) => {
    raf = 0;
    container.style.setProperty("--grid-x", `${x}px`);
    container.style.setProperty("--grid-y", `${y}px`);
    container.style.setProperty("--grid-o", "1");
  };

  const hide = () => {
    raf = 0;
    container.style.setProperty("--grid-o", "0");
  };

  const onMove = (event: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => show(x, y));
  };

  const onLeave = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(hide);
  };

  container.addEventListener("mousemove", onMove, { passive: true });
  container.addEventListener("mouseleave", onLeave, { passive: true });
}
