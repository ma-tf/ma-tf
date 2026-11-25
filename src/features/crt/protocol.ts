import type { JobKind } from "@features/crt/jobs";
import type { Surface } from "@features/crt/surface";

export type RenderSize = { width: number; height: number; unit: number };

export type CrtRequest =
  | { type: "attach"; canvas: Surface }
  | { type: "load"; job: number; file: Blob }
  | { type: "render"; job: number; size: RenderSize }
  | { type: "export"; job: number; size: RenderSize }
  | { type: "clear"; job: number };

export type CrtReply =
  | { type: "loaded"; job: number; width: number; height: number }
  | { type: "rendered"; job: number }
  | { type: "exported"; job: number; blob: Blob }
  | { type: "failed"; job: number; kind: JobKind; message: string };

const REPLY_TYPES = new Set(["loaded", "rendered", "exported", "failed"]);

export function isCrtReply(data: unknown): data is CrtReply {
  if (typeof data !== "object" || data === null) return false;
  const { type, job } = data as { type?: unknown; job?: unknown };
  return typeof type === "string" && REPLY_TYPES.has(type) && typeof job === "number";
}

export function replyKind(reply: CrtReply): JobKind {
  if (reply.type === "failed") return reply.kind;
  return reply.type === "exported" ? "export" : "screen";
}

export type ReplyOutcome = {
  source?: { width: number; height: number };
  rendering?: false;
  saving?: false;
  blob?: Blob;
};

export function replyOutcome(reply: CrtReply): ReplyOutcome {
  switch (reply.type) {
    case "loaded":
      return { source: { width: reply.width, height: reply.height } };
    case "rendered":
      return { rendering: false };
    case "exported":
      return { saving: false, blob: reply.blob };
    case "failed":
      return reply.kind === "screen" ? { rendering: false } : { saving: false };
  }
}
