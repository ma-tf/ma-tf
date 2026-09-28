import type { NLWebAskStreamEvent } from "@features/ask/response";

import { ask, streamAsk } from "@features/ask/ask";
import { NLWebAskRequestSchema } from "@features/ask/request";
import { ReadableStream as NodeReadableStream } from "node:stream/web";
import * as v from "valibot";

async function* encodeSse(events: AsyncIterable<NLWebAskStreamEvent>) {
  const encoder = new TextEncoder();

  for await (const { event, data } of events) {
    yield encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}

function sseResponse(events: AsyncIterable<NLWebAskStreamEvent>): Response {
  const body = NodeReadableStream.from(encodeSse(events)) as BodyInit;

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

export async function handleAsk(request: Request): Promise<Response> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const result = v.safeParse(NLWebAskRequestSchema, raw);
  if (!result.success) return new Response(null, { status: 400 });

  if (result.output.prefer?.streaming === true) {
    return sseResponse(streamAsk(result.output, request.signal));
  }

  return Response.json(await ask(result.output, request.signal));
}
