import type { NLWebAskStreamEvent } from "@features/ask/response";

import { ask, streamAsk } from "@features/ask/ask";
import { failureStream, runStream } from "@features/ask/nlweb-stream";
import {
  isSupportedResponseFormat,
  NLWebAskRequestSchema,
  requestedSummarize,
} from "@features/ask/request";
import { answerResponse, failureResponses } from "@features/ask/response";
import { acceptsMediaType } from "@lib/accept";
import { readJson } from "@lib/json";
import { ReadableStream as NodeReadableStream } from "node:stream/web";

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
  const parsed = await readJson(NLWebAskRequestSchema, request);
  if (!parsed) return new Response(null, { status: 400, headers: { Vary: "Accept" } });

  const streaming = wantsStream(request.headers.get("Accept"), parsed.prefer?.streaming === true);
  const supported = isSupportedResponseFormat(parsed.prefer?.response_format);
  const summarize = requestedSummarize(parsed.prefer?.mode);

  const respondJson = async (): Promise<Response> => {
    if (!supported) {
      return Response.json(failureResponses.UNSUPPORTED_FORMAT, {
        headers: { Vary: "Accept" },
      });
    }

    if (summarize === undefined) {
      return Response.json(failureResponses.UNSUPPORTED_MODE, { headers: { Vary: "Accept" } });
    }

    const answer = await ask(parsed.query.text, summarize, request.signal);

    return Response.json(answer ? answerResponse(answer) : failureResponses.NO_RESULTS, {
      headers: { Vary: "Accept" },
    });
  };

  const respondSse = (): Response => {
    if (!supported) return sseResponse(failureStream("UNSUPPORTED_FORMAT"));
    if (summarize === undefined) return sseResponse(failureStream("UNSUPPORTED_MODE"));

    return sseResponse(
      runStream(summarize, streamAsk(parsed.query.text, summarize, request.signal)),
    );
  };

  return streaming ? respondSse() : await respondJson();
}
