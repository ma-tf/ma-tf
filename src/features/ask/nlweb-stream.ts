import type { AskResult, AskStep } from "@features/ask/ask";
import type { NLWebAskFailureCode, NLWebAskStreamEvent } from "@features/ask/response";

import {
  answerMeta,
  askResultItem,
  completeEvent,
  errorEvent,
  failureMeta,
  failureResponse,
  resultEvent,
  startEvent,
} from "@features/ask/response";

function* failureEvents(code: NLWebAskFailureCode): Generator<NLWebAskStreamEvent> {
  yield errorEvent({ _meta: failureMeta, error: failureResponse(code).error });
  yield completeEvent(failureMeta);
}

export function failureStream(code: NLWebAskFailureCode): AsyncGenerator<NLWebAskStreamEvent> {
  return (async function* () {
    yield startEvent(answerMeta);
    yield* failureEvents(code);
  })();
}

export function runStream(
  summarize: boolean,
  work: readonly Promise<AskStep>[],
): AsyncGenerator<NLWebAskStreamEvent> {
  const settled = work.map((task) =>
    task.then(
      (value) => ({ ok: true as const, value }),
      () => ({ ok: false as const }),
    ),
  );

  return (async function* () {
    yield startEvent(answerMeta);

    let pageIndex = summarize ? 1 : 0;

    for (const task of settled) {
      const outcome = await task;

      if (!outcome.ok) {
        yield* failureEvents("INTERNAL_ERROR");
        return;
      }

      if ("error" in outcome.value) {
        yield* failureEvents(outcome.value.error);
        return;
      }

      for (const result of outcome.value.results) {
        yield indexResult(result, pageIndex);
        if ("page" in result) pageIndex += 1;
      }
    }

    yield completeEvent(answerMeta);
  })();
}

function indexResult(result: AskResult, pageIndex: number) {
  return resultEvent("page" in result ? pageIndex : 0, askResultItem(result));
}
