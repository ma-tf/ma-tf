const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const HOME_TITLE_COUNT = 6;
export const HOME_TITLE_START_MS = 400;
export const HOME_TITLE_STEP_MS = 150;
export const HOME_TITLE_FLICKER_MS = 1000;

export const HOME_LOAD_MS =
  HOME_TITLE_START_MS + (HOME_TITLE_COUNT - 1) * HOME_TITLE_STEP_MS + HOME_TITLE_FLICKER_MS;

export function homeLoadDelay() {
  if (
    window.matchMedia(REDUCED_MOTION_QUERY).matches ||
    Boolean(document.documentElement.dataset.motion)
  ) {
    return 0;
  }
  return HOME_LOAD_MS;
}

export function startAfterHomeLoad(start: () => void) {
  const delay = homeLoadDelay();
  if (delay === 0) {
    start();
    return;
  }
  window.setTimeout(start, delay);
}
