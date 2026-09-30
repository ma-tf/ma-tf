import type { NLWebAskFailureCode, NLWebAskStreamEvent } from "@features/ask/response";

import { ask, streamAsk } from "@features/ask/ask";
import { failureStream, runStream } from "@features/ask/nlweb-stream";
import {
  isSupportedResponseFormat,
  NLWebAskRequestSchema,
  requestedSummarize,
} from "@features/ask/request";
import { answerResponse, failureResponse } from "@features/ask/response";
import { acceptsMediaType } from "@lib/accept";
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
      Vary: "Accept",
    },
  });
}

function wantsStream(accept: string | null, preferStreaming: boolean): boolean {
  if (acceptsMediaType(accept, "text/event-stream", { explicitOnly: true })) return true;

  return preferStreaming && (accept === null || acceptsMediaType(accept, "text/event-stream"));
}

export async function handleAsk(request: Request): Promise<Response> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return new Response(null, { status: 400, headers: { Vary: "Accept" } });
  }

  const result = v.safeParse(NLWebAskRequestSchema, raw);
  if (!result.success) return new Response(null, { status: 400, headers: { Vary: "Accept" } });

  const { query, prefer } = result.output;
  const streaming = wantsStream(request.headers.get("Accept"), prefer?.streaming === true);
  const failure = (code: NLWebAskFailureCode) =>
    streaming
      ? sseResponse(failureStream(code))
      : Response.json(failureResponse(code), { headers: { Vary: "Accept" } });

  if (!isSupportedResponseFormat(prefer?.response_format)) return failure("UNSUPPORTED_FORMAT");

  const summarize = requestedSummarize(prefer?.mode);
  if (summarize === undefined) return failure("UNSUPPORTED_MODE");

  if (streaming) {
    return sseResponse(runStream(summarize, streamAsk(query.text, summarize, request.signal)));
  }

  const answer = await ask(query.text, summarize, request.signal);

  return Response.json(answer ? answerResponse(answer) : failureResponse("NO_RESULTS"), {
    headers: { Vary: "Accept" },
  });
}
