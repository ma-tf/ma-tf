import type { AskUnit } from "@features/faq/use-ask";
import type { ReactNode } from "react";

import { useAskUnit } from "@features/faq/ask-context";

function Thinking() {
  return (
    <p className="flex items-center text-lg text-muted-foreground">
      <span role="status">Thinking</span>
      <span aria-hidden="true" className="animate-ellipsis" />
    </p>
  );
}

function Answer({ answer, streaming }: { answer: string; streaming: boolean }) {
  return (
    <>
      <p
        aria-busy={streaming ? true : undefined}
        className="text-lg leading-relaxed text-foreground"
      >
        {answer}
      </p>
      {!streaming && (
        <span role="status" className="sr-only">
          Answer ready
        </span>
      )}
    </>
  );
}

function Refusal({ answer }: { answer: string }) {
  return (
    <p role="status" className="text-lg leading-relaxed text-muted-foreground">
      {answer}
    </p>
  );
}

function Failure({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 text-lg leading-relaxed text-muted-foreground"
    >
      <span>Couldn't reach the site agent.</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-border px-3 py-1 text-sm text-foreground transition-colors hover:border-foreground"
      >
        Try again
      </button>
    </div>
  );
}

export function AnswerBody() {
  const { unit, retry } = useAskUnit();
  const answer = "answer" in unit ? unit.answer : "";

  const bodies = {
    thinking: <Thinking />,
    streaming: <Answer answer={answer} streaming />,
    done: <Answer answer={answer} streaming={false} />,
    refused: <Refusal answer={answer} />,
    error: <Failure onRetry={retry} />,
  } satisfies Record<Exclude<AskUnit, { status: "idle" }>["status"], ReactNode>;

  return bodies[unit.status];
}
