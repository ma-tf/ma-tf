import {
  Section,
  SectionContent,
  SectionHeader,
  SectionNumber,
  SectionSubtitle,
  SectionTitle,
} from "@components/section";
import { Button } from "@components/ui/button";
import { CameraIcon, FilmStripIcon } from "@phosphor-icons/react";

export function PhotographyPreview() {
  return (
    <Section className="mx-auto max-w-480 py-24">
      <SectionHeader>
        <SectionNumber />
        <SectionTitle href="/photography">Photography</SectionTitle>
      </SectionHeader>
      <SectionSubtitle>Digital and analogue photography.</SectionSubtitle>
      <SectionContent>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-4 text-lg">
            <p className="indent-8">
              In my spare time I am an amateur photographer. I shoot on both digital and film, and
              have collected a small family of cameras over the years, each covering a different use
              case.
            </p>
            <p className="indent-8">
              The cameras I use include: a Canon EOS-1V as my primary camera with swappable lenses;
              an Olympus mju mini Digital for when I want retro digital shots; a Ricoh Mirai when I
              need an all rounder bridge camera. They have served me well so far.
            </p>
            <p className="indent-8">
              I scan every roll myself on a Nikon CoolScan V ED using SilverFast, and colour correct
              the frames in SilverFast HDR. It's a slow, hands-on part of the process, but it's
              become as much a part of the craft as the shooting itself.
            </p>
            <Button
              variant="inverted"
              shape="sharp"
              size="lg"
              render={
                <a href="/photography" className="mt-6 w-full md:w-fit">
                  View photography
                </a>
              }
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col border border-foreground px-3 py-2">
              <span className="text-2xl">EOS-1V</span>
              <span className="text-xs uppercase">Canon</span>
              <div className="mt-auto pt-4">
                <FilmStripIcon className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="flex flex-col border border-foreground px-3 py-2">
              <span className="text-2xl">Mirai</span>
              <span className="text-xs uppercase">Ricoh</span>
              <div className="mt-auto pt-4">
                <FilmStripIcon className="size-5" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="flex flex-col border border-foreground px-3 py-2">
            <span className="text-2xl">mju mini Digital</span>
            <span className="text-xs uppercase">Olympus</span>
            <div className="mt-auto pt-4">
              <CameraIcon className="size-5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </SectionContent>
    </Section>
  );
}
