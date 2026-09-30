import { ask, streamAsk } from "@features/ask/ask";
import { failureStream, runStream } from "@features/ask/nlweb-stream";
import {
  isSupportedResponseFormat,
  NLWebAskRequestSchema,
  requestedSummarize,
  wantsStream,
} from "@features/ask/request";
import { answerResponse, failureResponses } from "@features/ask/response";
import { readJson } from "@lib/json";
import { sseResponse } from "@lib/sse";

export async function handleAsk(request: Request): Promise<Response> {
  const parsed = await readJson(NLWebAskRequestSchema, request);
  if (!parsed) return new Response(null, { status: 400, headers: { Vary: "Accept" } });

  const streaming = wantsStream(request.headers.get("Accept"), parsed.prefer?.streaming === true);
  const supported = isSupportedResponseFormat(parsed.prefer);
  const summarize = requestedSummarize(parsed.prefer);

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
