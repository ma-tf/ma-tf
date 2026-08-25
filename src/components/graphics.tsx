import type { ImageMap } from "@lib/images";

import {
  Section,
  SectionContent,
  SectionHeader,
  SectionNumber,
  SectionSubtitle,
  SectionTitle,
} from "@components/section";

export function GraphicsPreview({ images }: { images: ImageMap }) {
  const oldHouseSrc = images["graphics/old house.png"];
  return (
    <Section className="py-24">
      <SectionHeader>
        <SectionNumber />
        <SectionTitle href="/graphics">Graphics</SectionTitle>
      </SectionHeader>
      <SectionSubtitle>Digital illustrations and visual experiments.</SectionSubtitle>
      <SectionContent>
        <div className="grid grid-cols-3 items-start gap-4">
          <p className="max-w-md indent-8 text-lg text-foreground">
            Visual experiments and illustrations made for the joy of it. Studies of form and colour,
            and other loose ends.
          </p>
          <img src={oldHouseSrc} alt="" className="border border-foreground" />
        </div>
      </SectionContent>
    </Section>
  );
}
