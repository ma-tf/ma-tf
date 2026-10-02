import type { AskResult, AskStep } from "@features/ask/ask";
import type { NLWebAskFailureCode, NLWebAskStreamEvent } from "@features/ask/response";

import {
  answerMeta,
  askResultItem,
  completeEvent,
  errorEvent,
  failureMeta,
  failureResponses,
  resultEvent,
  startEvent,
} from "@features/ask/response";
import { captureError, current, enrich } from "@lib/wide-event";

type SettledStep = { ok: true; value: AskStep } | { ok: false };

type StreamCounts = { completed: number; results: number };

const failureOutcomes: Record<NLWebAskFailureCode, string> = {
  NO_RESULTS: "no_results",
  UNSUPPORTED_FORMAT: "unsupported_format",
  UNSUPPORTED_MODE: "unsupported_mode",
  INTERNAL_ERROR: "internal_error",
};

function failureError(code: NLWebAskFailureCode) {
  return errorEvent({ _meta: failureMeta, error: failureResponses[code].error });
}

export async function* failureStream(
  code: NLWebAskFailureCode,
): AsyncGenerator<NLWebAskStreamEvent> {
  yield startEvent(answerMeta);
  yield failureError(code);
  yield completeEvent(failureMeta);
}

export function runStream(summarize: boolean, work: readonly Promise<AskStep>[]) {
  const event = current();
  const settled: Promise<SettledStep>[] = work.map((task) =>
    task.then(
      (value) => ({ ok: true as const, value }),
      (reason) => {
        captureError(reason, { phase: "stream_step" }, event);
        return { ok: false as const };
      },
    ),
  );

  return (async function* (): AsyncGenerator<NLWebAskStreamEvent> {
    const counts: StreamCounts = { completed: 0, results: 0 };
    let outcome = "aborted";

    try {
      yield startEvent(answerMeta);

      const terminal = yield* emitBody(settled, summarize ? 1 : 0, counts);

      yield completeEvent(terminal === "success" ? answerMeta : failureMeta);

      outcome = terminal;
    } finally {
      enrich({ ask: { stream: counts }, outcome }, event);
    }
  })();
}

async function* emitBody(
  settled: readonly Promise<SettledStep>[],
  start: number,
  counts: StreamCounts,
): AsyncGenerator<NLWebAskStreamEvent, string> {
  let pageIndex = start;

  for (const task of settled) {
    const outcome = await task;

    if (!outcome.ok) {
      yield failureError("INTERNAL_ERROR");
      return "internal_error";
    }

    if ("error" in outcome.value) {
      yield failureError(outcome.value.error);
      return failureOutcomes[outcome.value.error];
    }

    pageIndex = yield* emitResults(outcome.value.results, pageIndex, counts);
    counts.completed += 1;
  }

  return "success";
}

function* emitResults(
  results: readonly AskResult[],
  start: number,
  counts: StreamCounts,
): Generator<NLWebAskStreamEvent, number> {
  let pageIndex = start;

  for (const result of results) {
    yield resultEvent("page" in result ? pageIndex : 0, askResultItem(result));
    counts.results += 1;
    if ("page" in result) pageIndex += 1;
  }

  return pageIndex;
}
