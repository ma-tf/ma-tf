import { Section, SectionContent, SectionHeader, SectionNumber } from "@components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import { FaqAskUnit } from "@features/faq/ask";
import { faqs } from "@features/seo/site-metadata";
import { askEnabled } from "@lib/feature-flags";
import { useRef, useState } from "react";

export function Faq() {
  const [units, setUnits] = useState<number[]>(askEnabled ? [1] : []);
  const [openValues, setOpenValues] = useState<string[]>([]);
  const next = useRef(2);

  const openQuestion = (value: string) => {
    const id = next.current++;
    setUnits((current) => [...current, id]);
    setOpenValues((current) => [...current, value]);
  };

  return (
    <Section className="mx-auto w-full max-w-480 py-24">
      <SectionHeader>
        <SectionNumber />
        <span>FAQ</span>
      </SectionHeader>
      <SectionContent className="w-full max-w-prose justify-self-center">
        <Accordion
          multiple
          keepMounted
          value={openValues}
          onValueChange={(values) => setOpenValues(values)}
        >
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>
                <span className="text-2xl uppercase">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-lg leading-relaxed text-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
          {units.map((id) => (
            <FaqAskUnit key={id} onAsk={openQuestion} />
          ))}
        </Accordion>
      </SectionContent>
    </Section>
  );
}
