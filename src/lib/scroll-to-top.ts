const SELECTOR = "[data-scroll-to-top]";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function pageScrolls(): boolean {
  const root = document.documentElement;
  return root.scrollHeight > root.clientHeight + 1;
}

export function startScrollToTop() {
  const button = document.querySelector<HTMLElement>(SELECTOR);
  if (!button) return;

  const syncVisibility = () => {
    button.hidden = !pageScrolls();
  };

  syncVisibility();
  window.addEventListener("resize", syncVisibility);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(syncVisibility).observe(document.body);
  }

  button.addEventListener("click", () => {
    const behavior: ScrollBehavior = window.matchMedia(REDUCED_MOTION_QUERY).matches
      ? "auto"
      : "smooth";
    window.scrollTo({ top: 0, behavior });
  });
}
