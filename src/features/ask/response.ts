import type { PublishedPage } from "@features/ask/published-page";

export type NLWebAskAnswerResponse = {
  _meta: {
    response_type: string;
    response_format: "conversational_search";
    version: "0.55";
  };
  results: [
    { "@type": "SearchSummary"; text: string },
    ...{ "@type": "WebPage"; name: string; url: string }[],
  ];
};

export type NLWebAskFailureResponse = {
  _meta: { response_type: string; version: "0.55" };
  error: {
    code: "NO_RESULTS";
    message: string;
  };
};

export type NLWebAskResponse = NLWebAskAnswerResponse | NLWebAskFailureResponse;

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
        item:
          | { "@type": "SearchSummary"; text: string }
          | { "@type": "WebPage"; name: string; url: string };
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
          code: "NO_RESULTS" | "INTERNAL_ERROR";
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

export function noResultsResponse(): NLWebAskFailureResponse {
  return {
    _meta: {
      response_type: "failure",
      version: "0.55",
    },
    error: {
      code: "NO_RESULTS",
      message: "The published content does not provide enough information to answer this question.",
    },
  };
}

export function answerResponse(answer: string, sources: PublishedPage[]): NLWebAskAnswerResponse {
  return {
    _meta: {
      response_type: "answer",
      response_format: "conversational_search",
      version: "0.55",
    },
    results: [
      {
        "@type": "SearchSummary",
        text: answer,
      },
      ...sources.map((source) => ({
        "@type": "WebPage" as const,
        name: source.title,
        url: source.url,
      })),
    ],
  };
}
