import type { NLWebAskStreamEvent } from "@features/ask/response";

import {
  answerMeta,
  completeEvent,
  errorEvent,
  failureMeta,
  resultEvent,
  startEvent,
} from "@features/ask/response";

export type StreamStep =
  | { results: Extract<NLWebAskStreamEvent, { event: "result" }>["data"][] }
  | { error: Extract<NLWebAskStreamEvent, { event: "error" }>["data"]["error"] };

export function runStream(
  work: readonly Promise<StreamStep>[],
): AsyncGenerator<NLWebAskStreamEvent> {
  const settled = work.map((task) =>
    task.then(
      (value) => ({ ok: true as const, value }),
      () => ({ ok: false as const }),
    ),
  );

  return (async function* () {
    yield startEvent(answerMeta);

    for (const task of settled) {
      const outcome = await task;
      const step: StreamStep = outcome.ok
        ? outcome.value
        : {
            error: {
              code: "INTERNAL_ERROR",
              message: "Unable to complete the request.",
            },
          };

      if ("error" in step) {
        yield errorEvent({ _meta: failureMeta, error: step.error });
        yield completeEvent(failureMeta);
        return;
      }

      for (const result of step.results) {
        yield resultEvent(result.index, result.item);
      }
    }

    yield completeEvent(answerMeta);
  })();
}
