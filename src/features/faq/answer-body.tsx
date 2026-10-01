import type { AskSource } from "@features/faq/ask-site";
import type { AskUnit } from "@features/faq/use-ask";
import type { ReactNode } from "react";

import { useAskUnit } from "@features/faq/ask-context";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";

function Thinking() {
  return (
    <p className="flex items-center text-lg text-muted-foreground">
      <span role="status">Thinking</span>
      <span aria-hidden="true" className="animate-ellipsis" />
    </p>
  );
}

function Sources({ sources }: { sources: AskSource[] }) {
  if (sources.length === 0) return null;

  return (
    <ul className="mt-4 flex flex-col gap-1 text-base text-muted-foreground">
      {sources.map((source) => (
        <li key={source.url}>
          <a
            href={source.url}
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            {source.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Answer({ answer, sources }: { answer: string; sources: AskSource[] }) {
  return (
    <>
      <p className="text-lg leading-relaxed text-foreground">{answer}</p>
      <span role="status" className="sr-only">
        Answer ready
      </span>
      <Sources sources={sources} />
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
        className="inline-flex items-center gap-2 rounded-none border border-foreground bg-foreground px-2 py-1 text-sm text-background transition-colors hover:bg-transparent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ArrowClockwiseIcon aria-hidden="true" className="size-4" />
        Try again
      </button>
    </div>
  );
}

export function AnswerBody() {
  const { unit, retry } = useAskUnit();
  const answer = "answer" in unit ? unit.answer : "";
  const sources = unit.status === "answered" ? unit.sources : [];

  const bodies = {
    thinking: <Thinking />,
    answered: <Answer answer={answer} sources={sources} />,
    refused: <Refusal answer={answer} />,
    error: <Failure onRetry={retry} />,
  } satisfies Record<Exclude<AskUnit, { status: "idle" }>["status"], ReactNode>;

  return bodies[unit.status];
}
