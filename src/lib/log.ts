import type { WideEvent } from "@lib/wide-event";

const emitted = new WeakSet<WideEvent>();

function shouldEmit(_event: WideEvent): boolean {
  return true;
}

export function log(event: WideEvent): void {
  if (emitted.has(event)) return;
  if (!shouldEmit(event)) return;

  emitted.add(event);
  console.log(JSON.stringify(event));
}
