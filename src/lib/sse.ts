import { ReadableStream as NodeReadableStream } from "node:stream/web";

export function sseResponse<T extends { event: string; data: unknown }>(
  events: AsyncIterable<T>,
): Response {
  const encoder = new TextEncoder();

  async function* frames() {
    for await (const { event, data } of events) {
      yield encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  }

  return new Response(NodeReadableStream.from(frames()) as BodyInit, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Vary: "Accept",
    },
  });
}
