import {
  Section,
  SectionContent,
  SectionHeader,
  SectionNumber,
  SectionSubtitle,
  SectionTitle,
} from "@components/section";

export function Graphics() {
  return (
    <Section>
      <SectionHeader>
        <SectionNumber />
        <SectionTitle href="/graphics">Graphics</SectionTitle>
      </SectionHeader>
      <SectionSubtitle>Digital illustrations and visual experiments.</SectionSubtitle>
      <SectionContent>
        <p className="max-w-md indent-8 text-lg text-foreground">
          Visual experiments and illustrations made for the joy of it. Studies of form and colour,
          and other loose ends.
        </p>
      </SectionContent>
    </Section>
  );
}
