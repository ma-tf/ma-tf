import type { ReactNode } from "react";

import { Accordion, AccordionContent, AccordionItem } from "@components/ui/accordion";
import { FaqAccordionTrigger } from "@features/faq/faq-accordion-trigger";

export function FaqRow({ question, children }: { question: string; children: ReactNode }) {
  return (
    <Accordion keepMounted>
      <AccordionItem value={question}>
        <FaqAccordionTrigger>
          <span className="text-base uppercase">{question}</span>
        </FaqAccordionTrigger>
        <AccordionContent>
          <div className="py-1 text-lg leading-relaxed text-foreground">{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
