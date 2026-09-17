import { Section, SectionContent, SectionHeader, SectionNumber } from "@components/section";
import { faqs } from "@features/seo/site-metadata";

export function Faq() {
  return (
    <Section className="mx-auto max-w-480 py-24">
      <SectionHeader>
        <SectionNumber />
        <span>FAQ</span>
      </SectionHeader>
      <SectionContent>
        <div className="flex max-w-3xl flex-col gap-8">
          {faqs.map((faq) => (
            <div key={faq.question} className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold text-foreground">{faq.question}</h3>
              <p className="text-lg leading-relaxed text-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </SectionContent>
    </Section>
  );
}
