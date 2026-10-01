import type { ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";

export function FaqRow({ question, children }: { question: string; children: ReactNode }) {
  return (
    <Accordion keepMounted>
      <AccordionItem value={question}>
        <AccordionTrigger>
          <span className="text-base uppercase">{question}</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="text-lg leading-relaxed text-foreground">{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
