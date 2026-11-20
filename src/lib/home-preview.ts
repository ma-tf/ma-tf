const SCREEN_SELECTOR = "[data-prev-screen]";
const REVEAL_SELECTOR = "[data-prev-reveal]";
const TITLE_SELECTOR = "[data-title][data-wash]";
const IMAGE_SELECTOR = "[data-prev-image]";
const LOADING_MS = 800;
const startedScreens = new WeakSet<Element>();

export function startHomePreview() {
  const screen = document.querySelector<HTMLElement>(SCREEN_SELECTOR);
  const reveal = document.querySelector<HTMLElement>(REVEAL_SELECTOR);
  if (!screen || !reveal || startedScreens.has(screen)) return;
  startedScreens.add(screen);

  const imageWashes = new Set(
    [...screen.querySelectorAll<HTMLElement>(IMAGE_SELECTOR)].map(
      (layer) => layer.dataset.prevImage,
    ),
  );

  let topic: string | null = null;
  let closing = false;
  let loadingTimer: number | undefined;

  const flashLoading = () => {
    delete screen.dataset.loading;
    void screen.offsetWidth;
    screen.dataset.loading = "";
    if (loadingTimer !== undefined) window.clearTimeout(loadingTimer);
    loadingTimer = window.setTimeout(() => {
      loadingTimer = undefined;
      delete screen.dataset.loading;
    }, LOADING_MS);
  };

  const settle = (event: TransitionEvent) => {
    if (event.target !== reveal || event.propertyName !== "grid-template-rows") return;
    if (closing) delete screen.dataset.prevOpened;
    else screen.dataset.prevOpened = "";
  };

  const enter = (event: Event) => {
    const title = event.currentTarget as HTMLElement;
    const next = title.dataset.wash ?? null;
    if (!next || next === topic) return;
    closing = !imageWashes.has(next);
    topic = next;
    flashLoading();
  };

  const leave = (event: Event) => {
    const title = event.currentTarget as HTMLElement;
    // fallow-ignore-next-line code-duplication -- five-line guard, not worth a shared module
    const next =
      event instanceof FocusEvent || event instanceof MouseEvent ? event.relatedTarget : null;
    if (next instanceof Node && title.contains(next)) return;
    closing = true;
    topic = null;
  };

  reveal.addEventListener("transitionend", settle);

  for (const title of document.querySelectorAll<HTMLElement>(TITLE_SELECTOR)) {
    title.addEventListener("pointerenter", enter);
    title.addEventListener("pointerleave", leave);
    title.addEventListener("focusin", enter);
    title.addEventListener("focusout", leave);
  }
}
