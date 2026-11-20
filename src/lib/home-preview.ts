const SCREEN_SELECTOR = "[data-prev-screen]";
const TITLE_SELECTOR = "[data-title][data-wash]";
const LOADING_MS = 500;
const startedScreens = new WeakSet<Element>();

export function startHomePreview() {
  const screen = document.querySelector<HTMLElement>(SCREEN_SELECTOR);
  if (!screen || startedScreens.has(screen)) return;
  startedScreens.add(screen);

  let topic: string | null = null;
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

  const enter = (event: Event) => {
    const title = event.currentTarget as HTMLElement;
    const next = title.dataset.wash ?? null;
    if (!next || next === topic) return;
    topic = next;
    flashLoading();
  };

  const leave = (event: Event) => {
    const title = event.currentTarget as HTMLElement;
    const next =
      event instanceof FocusEvent || event instanceof MouseEvent ? event.relatedTarget : null;
    if (next instanceof Node && title.contains(next)) return;
    topic = null;
  };

  for (const title of document.querySelectorAll<HTMLElement>(TITLE_SELECTOR)) {
    title.addEventListener("pointerenter", enter);
    title.addEventListener("pointerleave", leave);
    title.addEventListener("focusin", enter);
    title.addEventListener("focusout", leave);
  }
}
