import type { AskSource } from "@features/faq/ask-site";
import type { AskUnit } from "@features/faq/use-ask";
import type { ReactNode } from "react";

import { Pill } from "@components/pill";
import { proseComponents } from "@components/prose";
import { useAskUnit } from "@features/faq/ask-context";
import { ArrowClockwiseIcon, LinkSimpleIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Thinking() {
  return (
    <p className="flex min-h-7.5 items-center text-lg text-muted-foreground">
      <span role="status" className="shimmer">
        Thinking
      </span>
      <span aria-hidden="true" className="animate-ellipsis" />
    </p>
  );
}

function Sources({ sources }: { sources: AskSource[] }) {
  if (sources.length === 0) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {sources.map((source) => (
        <li key={source.url}>
          <Pill href={source.url}>
            <span className="inline-flex items-center gap-1 pr-2">
              <LinkSimpleIcon size={14} className="shrink-0" />
              {source.title}
            </span>
          </Pill>
        </li>
      ))}
    </ul>
  );
}

function Answer({ answer, sources }: { answer: string; sources: AskSource[] }) {
  return (
    <>
      <div className="answer-content text-lg text-foreground">
        <Markdown components={proseComponents} remarkPlugins={[remarkGfm]}>
          {answer}
        </Markdown>
      </div>
      <span role="status" className="sr-only">
        Answer ready
      </span>
      <Sources sources={sources} />
    </>
  );
}

function Refusal({ answer }: { answer: string }) {
  return (
    <p role="status" className="min-h-7.5 text-lg leading-relaxed text-foreground">
      {answer}
    </p>
  );
}

function Failure({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex min-h-7.5 flex-wrap items-center gap-3 text-lg leading-relaxed text-muted-foreground"
    >
      <span>Couldn't reach the site agent.</span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-foreground bg-foreground px-2 py-1 text-sm text-background transition-colors hover:bg-transparent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ArrowClockwiseIcon aria-hidden="true" className="size-4" />
        Try again
      </button>
    </div>
  );
}

export function AnswerBody({ className }: { className?: string }) {
  const { unit, retry } = useAskUnit();
  const answer = "answer" in unit ? unit.answer : "";
  const sources = unit.status === "answered" ? unit.sources : [];

  const bodies = {
    thinking: <Thinking />,
    answered: <Answer answer={answer} sources={sources} />,
    refused: <Refusal answer={answer} />,
    error: <Failure onRetry={retry} />,
  } satisfies Record<Exclude<AskUnit, { status: "idle" }>["status"], ReactNode>;

  return <div className={cn("py-1", className)}>{bodies[unit.status]}</div>;
}
