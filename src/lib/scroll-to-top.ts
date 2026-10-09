const SELECTOR = "[data-scroll-to-top]";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function startScrollToTop() {
  const button = document.querySelector<HTMLElement>(SELECTOR);
  if (!button) return;

  button.addEventListener("click", () => {
    const behavior: ScrollBehavior = window.matchMedia(REDUCED_MOTION_QUERY).matches
      ? "auto"
      : "smooth";
    window.scrollTo({ top: 0, behavior });
  });
}
