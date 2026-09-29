import type { NLWebAskRequest } from "@features/ask/request";
import type { NLWebAskFailureCode, NLWebAskStreamEvent } from "@features/ask/response";

import { ask, streamAsk } from "@features/ask/ask";
import { failureStream, runStream } from "@features/ask/nlweb-stream";
import { NLWebAskRequestSchema } from "@features/ask/request";
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

function negotiate(
  request: NLWebAskRequest,
  accept: string | null,
): { code: NLWebAskFailureCode; streaming: boolean } | { streaming: boolean; summarize: boolean } {
  const preferStreaming = request.prefer?.streaming === true;
  const streaming =
    acceptsMediaType(accept, "text/event-stream", { explicitOnly: true }) ||
    (preferStreaming && (accept === null || acceptsMediaType(accept, "text/event-stream")));

  const format = request.prefer?.response_format;

  if (
    format?.trim() &&
    !format
      .split(",")
      .map((token) => token.trim().toLowerCase())
      .includes("conversational_search")
  ) {
    return { code: "UNSUPPORTED_FORMAT", streaming };
  }

  const mode = request.prefer?.mode?.trim();
  const known = mode
    ? mode
        .split(",")
        .map((token) => token.trim().toLowerCase())
        .filter((token) => token === "list" || token === "summarize")
    : [];

  if (mode && known.length === 0) return { code: "UNSUPPORTED_MODE", streaming };

  return { streaming, summarize: known.includes("summarize") };
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

  const question = result.output.query.text;
  const decision = negotiate(result.output, request.headers.get("Accept"));

  if ("code" in decision) {
    return decision.streaming
      ? sseResponse(failureStream(decision.code))
      : Response.json(failureResponse(decision.code), { headers: { Vary: "Accept" } });
  }

  const { streaming, summarize } = decision;

  if (streaming) {
    return sseResponse(runStream(summarize, streamAsk(question, summarize, request.signal)));
  }

  const answer = await ask(question, summarize, request.signal);

  return Response.json(answer ? answerResponse(answer) : failureResponse("NO_RESULTS"), {
    headers: { Vary: "Accept" },
  });
}
