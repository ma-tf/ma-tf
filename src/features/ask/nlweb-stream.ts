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

type SettledStep = { ok: true; value: AskStep } | { ok: false };

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
  const settled: Promise<SettledStep>[] = work.map((task) =>
    task.then(
      (value) => ({ ok: true as const, value }),
      () => ({ ok: false as const }),
    ),
  );

  return (async function* (): AsyncGenerator<NLWebAskStreamEvent> {
    yield startEvent(answerMeta);

    const ok = yield* emitBody(settled, summarize ? 1 : 0);

    yield completeEvent(ok ? answerMeta : failureMeta);
  })();
}

async function* emitBody(
  settled: readonly Promise<SettledStep>[],
  start: number,
): AsyncGenerator<NLWebAskStreamEvent, boolean> {
  let pageIndex = start;

  for (const task of settled) {
    const outcome = await task;

    if (!outcome.ok) {
      yield failureError("INTERNAL_ERROR");
      return false;
    }

    if ("error" in outcome.value) {
      yield failureError(outcome.value.error);
      return false;
    }

    pageIndex = yield* emitResults(outcome.value.results, pageIndex);
  }

  return true;
}

function* emitResults(
  results: readonly AskResult[],
  start: number,
): Generator<NLWebAskStreamEvent, number> {
  let pageIndex = start;

  for (const result of results) {
    yield resultEvent("page" in result ? pageIndex : 0, askResultItem(result));
    if ("page" in result) pageIndex += 1;
  }

  return pageIndex;
}
