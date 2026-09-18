import { Section, SectionContent, SectionHeader, SectionNumber } from "@components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import { faqs } from "@features/seo/site-metadata";

export function Faq() {
  return (
    <Section className="mx-auto w-full max-w-480 py-24">
      <SectionHeader>
        <SectionNumber />
        <span>FAQ</span>
      </SectionHeader>
      <SectionContent>
        <Accordion multiple keepMounted className="mx-auto max-w-prose">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-xl font-semibold text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-lg leading-relaxed text-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContent>
    </Section>
  );
}
