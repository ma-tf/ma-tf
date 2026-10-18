const SHELL_SELECTOR = "[data-blog-scroll]";
const PANE_SELECTOR = "[data-blog-scroll-target]";
const DESKTOP_QUERY = "(min-width: 768px)";
const LINE_HEIGHT = 16;
const DOM_DELTA_LINE = 1;
const DOM_DELTA_PAGE = 2;

function wheelDelta(event: WheelEvent, pageHeight: number): number {
  if (event.deltaMode === DOM_DELTA_LINE) return event.deltaY * LINE_HEIGHT;
  if (event.deltaMode === DOM_DELTA_PAGE) return event.deltaY * pageHeight;
  return event.deltaY;
}

export function startBlogScroll() {
  const shell = document.querySelector<HTMLElement>(SHELL_SELECTOR);
  const pane = document.querySelector<HTMLElement>(PANE_SELECTOR);
  if (!shell || !pane) return;

  const desktop = window.matchMedia(DESKTOP_QUERY);

  const onWheel = (event: WheelEvent) => {
    if (!desktop.matches || event.ctrlKey || event.deltaY === 0) return;
    if (pane.contains(event.target as Node)) return;
    if (pane.scrollHeight <= pane.clientHeight) return;

    const before = pane.scrollTop;
    pane.scrollTop += wheelDelta(event, pane.clientHeight);
    if (pane.scrollTop !== before) event.preventDefault();
  };

  shell.addEventListener("wheel", onWheel, { passive: false });
}
