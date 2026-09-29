import type { AskAnswer, AskResult } from "@features/ask/ask";

export type NLWebAskResult =
  | { "@type": "SearchSummary"; text: string }
  | { "@type": "WebPage"; name: string; url: string };

export type NLWebAskFailureCode =
  | "NO_RESULTS"
  | "UNSUPPORTED_FORMAT"
  | "UNSUPPORTED_MODE"
  | "INTERNAL_ERROR";

export type NLWebAskAnswerResponse = {
  _meta: {
    response_type: string;
    response_format: "conversational_search";
    version: "0.55";
  };
  results: NLWebAskResult[];
};

export type NLWebAskFailureResponse = {
  _meta: { response_type: string; version: "0.55" };
  error: {
    code: NLWebAskFailureCode;
    message: string;
  };
};

export type NLWebAskStreamEvent =
  | {
      event: "start";
      data: {
        _meta: {
          response_type: string;
          response_format?: "conversational_search";
          version: "0.55";
          streaming: true;
        };
      };
    }
  | {
      event: "result";
      data: {
        index: number;
        item: NLWebAskResult;
      };
    }
  | {
      event: "error";
      data: {
        _meta: {
          response_type: string;
          version: "0.55";
          streaming?: true;
        };
        error: {
          code: NLWebAskFailureCode;
          message: string;
        };
      };
    }
  | {
      event: "complete";
      data: {
        _meta: {
          response_type: string;
          response_format?: "conversational_search";
          version: "0.55";
          streaming: true;
        };
      };
    };

export const answerMeta = {
  response_type: "answer",
  response_format: "conversational_search",
  version: "0.55",
  streaming: true,
} satisfies Extract<NLWebAskStreamEvent, { event: "start" }>["data"]["_meta"];

export const failureMeta = {
  response_type: "failure",
  version: "0.55",
  streaming: true,
} satisfies Extract<NLWebAskStreamEvent, { event: "start" }>["data"]["_meta"];

export function startEvent(
  meta: Extract<NLWebAskStreamEvent, { event: "start" }>["data"]["_meta"],
) {
  return { event: "start", data: { _meta: meta } } satisfies NLWebAskStreamEvent;
}

export function resultEvent(
  index: number,
  item: Extract<NLWebAskStreamEvent, { event: "result" }>["data"]["item"],
) {
  return { event: "result", data: { index, item } } satisfies NLWebAskStreamEvent;
}

export function errorEvent(data: Extract<NLWebAskStreamEvent, { event: "error" }>["data"]) {
  return { event: "error", data } satisfies NLWebAskStreamEvent;
}

export function completeEvent(
  meta: Extract<NLWebAskStreamEvent, { event: "complete" }>["data"]["_meta"],
) {
  return { event: "complete", data: { _meta: meta } } satisfies NLWebAskStreamEvent;
}

const failureMessages: Record<NLWebAskFailureCode, string> = {
  NO_RESULTS: "The published content does not provide enough information to answer this question.",
  UNSUPPORTED_FORMAT: "This endpoint only returns conversational_search results.",
  UNSUPPORTED_MODE: "This endpoint supports the list and summarize modes.",
  INTERNAL_ERROR: "Unable to complete the request.",
};

export function failureResponse(code: NLWebAskFailureCode): NLWebAskFailureResponse {
  return {
    _meta: {
      response_type: "failure",
      version: "0.55",
    },
    error: {
      code,
      message: failureMessages[code],
    },
  };
}

export function askResultItem(result: AskResult): NLWebAskResult {
  return "page" in result
    ? { "@type": "WebPage", name: result.page.title, url: result.page.url }
    : { "@type": "SearchSummary", text: result.summary };
}

export function answerResponse(answer: AskAnswer): NLWebAskAnswerResponse {
  const results = answer.sources.map((page) => askResultItem({ page }));

  if (answer.summary !== undefined) {
    results.unshift(askResultItem({ summary: answer.summary }));
  }

  return {
    _meta: {
      response_type: "answer",
      response_format: "conversational_search",
      version: "0.55",
    },
    results,
  };
}
