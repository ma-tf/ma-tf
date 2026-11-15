const COUNTED_KEY = "hits-counted";
const HEARTBEAT_MS = 30_000;

function post(path: string): void {
  void fetch(path, { method: "POST", keepalive: true }).catch(() => {});
}

export function startHitsTracking(): void {
  if (navigator.webdriver) return;

  if (sessionStorage.getItem(COUNTED_KEY) === null) {
    sessionStorage.setItem(COUNTED_KEY, "true");
    post("/api/hits");
  }

  let timer: number | undefined;

  function stop(): void {
    if (timer === undefined) return;

    window.clearInterval(timer);
    timer = undefined;
  }

  function start(): void {
    stop();
    post("/api/presence");
    timer = window.setInterval(() => post("/api/presence"), HEARTBEAT_MS);
  }

  if (document.visibilityState === "visible") start();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      start();
    } else {
      stop();
    }
  });
}
