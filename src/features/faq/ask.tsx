import type { AnimatedIconHandle } from "@components/icons/animated-icon";

import { ArrowRight as ArrowRightAnimated } from "@components/icons/arrow-right";
import { Accordion, AccordionContent, AccordionItem } from "@components/ui/accordion";
import { AnswerBody } from "@features/faq/answer-body";
import { AskProvider, useAskUnit } from "@features/faq/ask-context";
import { FaqAccordionTrigger } from "@features/faq/faq-accordion-trigger";
import { FaqInput } from "@features/faq/faq-input";
import { useAsk } from "@features/faq/use-ask";
import { useId, useRef, useState } from "react";

function Composer({ onSubmit }: { onSubmit: (question: string) => void }) {
  const [draft, setDraft] = useState("");
  const arrow = useRef<AnimatedIconHandle>(null);

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
      <FaqInput
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Ask about this site"
        placeholder="Ask about this site…"
      />
      <button
        type="submit"
        aria-label="Ask"
        disabled={!draft.trim()}
        onMouseEnter={() => {
          if (draft.trim()) arrow.current?.play();
        }}
        onMouseLeave={() => arrow.current?.stop()}
        className="inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none enabled:hover:text-foreground disabled:opacity-40"
      >
        <ArrowRightAnimated ref={arrow} trigger="none" className="size-5" />
      </button>
    </form>
  );
}

function AnsweredItem() {
  const { itemValue, question } = useAskUnit();

  return (
    <Accordion defaultValue={[itemValue]} keepMounted>
      <AccordionItem value={itemValue}>
        <FaqAccordionTrigger>
          <span className="text-base uppercase">{question}</span>
        </FaqAccordionTrigger>
        <AccordionContent>
          <AnswerBody />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function FaqAskUnit({ onAsk }: { onAsk?: () => void }) {
  const { unit, question, ask, retry } = useAsk();
  const itemValue = useId();

  const submit = (text: string) => {
    onAsk?.();
    ask(text);
  };

  if (unit.status === "idle") {
    return <Composer onSubmit={submit} />;
  }

  return (
    <AskProvider value={{ itemValue, question, unit, retry }}>
      <AnsweredItem />
    </AskProvider>
  );
}

export function AskPanel() {
  const [units, setUnits] = useState<number[]>([1]);
  const next = useRef(2);

  const openQuestion = () => {
    const id = next.current;
    next.current += 1;
    setUnits((current) => [...current, id]);
  };

  return (
    <div className="flex w-full flex-col [&>*:not(:last-child)]:border-b">
      {units.map((id) => (
        <FaqAskUnit key={id} onAsk={openQuestion} />
      ))}
    </div>
  );
}
