const COUNTED_KEY = "hits-counted";

export function startHitsTracking(): void {
  if (sessionStorage.getItem(COUNTED_KEY) !== null) return;

  sessionStorage.setItem(COUNTED_KEY, "true");

  void fetch("/api/hits", { method: "POST", keepalive: true }).catch(() => {});
}
