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
import { deferEmission, enrich } from "@lib/wide-event";

export async function handleAsk(request: Request): Promise<Response> {
  const parsed = await readJson(NLWebAskRequestSchema, request);

  if (!parsed) {
    enrich({ outcome: "invalid_request" });
    return new Response(null, { status: 400, headers: { Vary: "Accept" } });
  }

  const streaming = wantsStream(request.headers.get("Accept"), parsed.prefer?.streaming === true);
  const supported = isSupportedResponseFormat(parsed.prefer);
  const summarize = requestedSummarize(parsed.prefer);

  enrich({
    ask: {
      summarize,
      stream: streaming,
      question_length: parsed.query.text.length,
    },
  });

  const respondJson = async (): Promise<Response> => {
    if (!supported) {
      enrich({ outcome: "unsupported_format" });
      return Response.json(failureResponses.UNSUPPORTED_FORMAT, {
        headers: { Vary: "Accept" },
      });
    }

    if (summarize === undefined) {
      enrich({ outcome: "unsupported_mode" });
      return Response.json(failureResponses.UNSUPPORTED_MODE, { headers: { Vary: "Accept" } });
    }

    const answer = await ask(parsed.query.text, summarize, request.signal);

    enrich({ outcome: answer ? "success" : "no_results" });

    return Response.json(answer ? answerResponse(answer) : failureResponses.NO_RESULTS, {
      headers: { Vary: "Accept" },
    });
  };

  const respondSse = (): Response => {
    if (!supported) {
      enrich({ outcome: "unsupported_format" });
      return sseResponse(failureStream("UNSUPPORTED_FORMAT"));
    }

    if (summarize === undefined) {
      enrich({ outcome: "unsupported_mode" });
      return sseResponse(failureStream("UNSUPPORTED_MODE"));
    }

    deferEmission();

    return sseResponse(
      runStream(summarize, streamAsk(parsed.query.text, summarize, request.signal)),
    );
  };

  return streaming ? respondSse() : await respondJson();
}
