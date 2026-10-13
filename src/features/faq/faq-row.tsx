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
          <div className="py-1 text-lg leading-relaxed text-foreground [&_a]:text-steel-600 [&_a]:no-underline [&_a]:hover:text-steel-400 dark:[&_a]:text-steel-400 dark:[&_a]:hover:text-steel-200">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
