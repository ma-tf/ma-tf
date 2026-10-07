const REVEAL_SELECTOR = '[class*="animate-reveal"]';
const REVEALED_CLASS = "is-revealed";
const REVEAL_MARGIN = "0px 0px -25% 0px";

export function startReveal() {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
  if (elements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(REVEALED_CLASS);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: REVEAL_MARGIN },
  );

  for (const element of elements) observer.observe(element);
}
