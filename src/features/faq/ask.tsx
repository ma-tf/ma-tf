import { AccordionContent, AccordionItem, AccordionTrigger } from "@components/ui/accordion";
import { AnswerBody } from "@features/faq/answer-body";
import { AskProvider, useAskUnit } from "@features/faq/ask-context";
import { useAsk } from "@features/faq/use-ask";
import { ArrowRightIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";

function Composer({ onSubmit }: { onSubmit: (question: string) => void }) {
  const [draft, setDraft] = useState("");

  const submitDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setDraft("");
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitDraft();
      }}
      className="flex items-center gap-3 py-4"
    >
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Ask about this site"
        placeholder="Ask about this site…"
        className="min-w-0 flex-1 bg-transparent text-xl font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground/60"
      />
      <button
        type="submit"
        aria-label="Ask"
        disabled={!draft.trim()}
        className="inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none enabled:hover:text-foreground disabled:opacity-40"
      >
        <ArrowRightIcon className="size-5" />
      </button>
    </form>
  );
}

function AnsweredItem() {
  const { itemValue, question, unit } = useAskUnit();
  const inProgress = unit.status === "thinking" || unit.status === "streaming";

  return (
    <AccordionItem value={itemValue}>
      <AccordionTrigger hideIcon={inProgress}>
        <span className="text-xl font-semibold">{question}</span>
        {inProgress && (
          <CircleNotchIcon
            aria-hidden="true"
            className="ml-auto size-4 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none"
          />
        )}
      </AccordionTrigger>
      <AccordionContent>
        <AnswerBody />
      </AccordionContent>
    </AccordionItem>
  );
}

export function FaqAskUnit({ onAsk }: { onAsk?: (value: string) => void }) {
  const { unit, question, ask, retry } = useAsk();
  const itemValue = useId();

  const submit = (text: string) => {
    onAsk?.(itemValue);
    ask(text);
  };

  if (unit.status === "idle") {
    return (
      <div className="not-last:border-b">
        <Composer onSubmit={submit} />
      </div>
    );
  }

  return (
    <AskProvider value={{ itemValue, question, unit, retry }}>
      <AnsweredItem />
    </AskProvider>
  );
}
