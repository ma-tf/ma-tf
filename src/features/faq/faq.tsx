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
      <SectionContent className="w-full max-w-prose justify-self-center">
        <Accordion multiple keepMounted>
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>
                <span className="text-xl font-semibold text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-lg leading-relaxed text-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContent>
    </Section>
  );
}
