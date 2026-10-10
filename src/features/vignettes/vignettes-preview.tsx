import type { ImageMap } from "@lib/images";

import {
  Section,
  SectionContent,
  SectionHeader,
  SectionNumber,
  SectionSubtitle,
  SectionTitle,
} from "@components/section";
import { Button } from "@components/ui/button";
import { ApertureIcon, FilmReelIcon } from "@phosphor-icons/react";

export function VignettesPreview({ images }: { images: ImageMap }) {
  const bgDitherSrc = images["vignettes/bolex-bg-dither.png"];
  const fgDitherSrc = images["vignettes/bolex-fg-dither-anon.png"];
  return (
    <div className="bg-slate-100 dark:bg-slate-900">
      <Section className="mx-auto max-w-480 py-24">
        <SectionHeader>
          <SectionNumber />
          <SectionTitle href="/vignettes">Vignettes</SectionTitle>
        </SectionHeader>
        <SectionSubtitle>Motion work; exploring through the lens.</SectionSubtitle>
        <SectionContent className="grid grid-cols-1 gap-12 md:grid-cols-9 md:gap-24">
          <div className="relative aspect-4/3 self-center overflow-hidden border border-foreground md:col-span-3">
            <img
              src={bgDitherSrc}
              alt=""
              className="absolute inset-0 size-full origin-[45%_100%] scale-200 object-cover"
            />
            <img
              src={fgDitherSrc}
              alt=""
              className="absolute inset-0 size-full origin-[45%_100%] scale-200 object-cover"
            />
          </div>
          <div className="flex flex-col gap-4 text-lg text-foreground md:col-span-3">
            <p className="indent-8">
              A series of short motion studies, shot on location in the quiet hours — small
              observations of a place and the details that give it character. Photography freezes a
              single instant, but some places only come alive in motion, and these studies are an
              attempt to hold on to those moving moments. Everything is shot on 16mm film: its grain
              and soft frame corners give the footage a texture digital struggles to match, and each
              scene is a single deliberate take, with no chance to reshoot without paying for the
              footage again.
            </p>
            <Button
              variant="inverted"
              shape="sharp"
              size="lg"
              render={
                <a href="/vignettes" className="mt-6 w-full md:w-fit">
                  View vignettes
                </a>
              }
            />
          </div>
          <div className="flex flex-col gap-4 md:col-span-3 md:items-end md:justify-center">
            <div className="flex shrink-0 flex-col border border-foreground px-3 py-2 md:size-48">
              <span className="text-2xl">Vision3 Color Negative</span>
              <span className="text-xs uppercase">KODAK</span>
              <div className="mt-auto pt-4">
                <FilmReelIcon className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex shrink-0 flex-col border border-foreground px-3 py-2 md:size-48">
                <span className="text-2xl">Vario-Switar 16-100mm</span>
                <span className="text-xs uppercase">Kern-Paillard</span>
                <div className="mt-auto pt-4">
                  <ApertureIcon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <div className="flex shrink-0 flex-col border border-foreground px-3 py-2 md:size-48">
                <span className="text-2xl">4mm f/2.8 Fisheye</span>
                <span className="text-xs uppercase">LAOWA</span>
                <div className="mt-auto pt-4">
                  <ApertureIcon className="size-5" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </SectionContent>
      </Section>
    </div>
  );
}
