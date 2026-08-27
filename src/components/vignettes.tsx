import type { ImageMap } from "@lib/images";

import { VideoPlayer } from "@components/mux-player";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionNumber,
  SectionSubtitle,
  SectionTitle,
} from "@components/section";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { Spinner } from "@components/ui/spinner";
import { cn } from "@lib/cn";
import { ApertureIcon, FilmReelIcon } from "@phosphor-icons/react";
import { useState } from "react";

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
        <SectionSubtitle className="col-span-2">
          Experimental motion work; exploring through the lens.
        </SectionSubtitle>
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
          <div className="flex flex-col gap-4 indent-8 text-lg text-foreground md:col-span-3">
            <p>
              A series of short motion studies, shot on location in the quiet hours. Small
              observations of a place and the details that give it character. Photographs freeze a
              single instant, but some places only come alive in motion. The speed of a moving
              train, the swing of shoes on a wire, the rolling waves on a beach during sunset. These
              studies are an attempt to hold on to those moving moments.
            </p>
            <p>
              The <span className="italic">Bolex H-16 SBM</span> offers a portable way to create
              true filmic experiences without electricity as a hard requirement. Using 30 metre film
              reels and a wind-up motor, I can shoot scenes up to 30 seconds long with a maximum of
              approximately 2 minutes and 45 seconds of footage per reel. For my own convenience, I
              use a battery powered <span className="italic">Kern Vario-Switar 16-100mm</span> lens.
              The battery powers the auto exposure and the in-built electric motor for zooming.
            </p>
            <p>
              Everything is shot on 16mm film. Its grain and tonal latitude give the footage a
              texture that digital struggles to match, and the format's soft, rounded frame corners
              come straight from the lens and gate rather than any filter. Shooting on film is an
              exercise in economy. Each scene is a single take with no chance to delete or reshoot
              without paying for the footage again, so every second has to be deliberate. That
              constraint is part of what makes the format so rewarding.
            </p>
            <p></p>
            <Button
              variant="outline"
              render={<a href="/vignettes">View vignettes</a>}
              className="mt-6 w-full rounded-none border-none bg-foreground indent-0 text-background hover:bg-muted-foreground md:w-fit dark:bg-foreground dark:hover:bg-muted-foreground/80"
              size="lg"
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

export function Vignettes({
  activeVideo,
  description,
  className,
  ...props
}: {
  activeVideo: { playbackId: string; order: number };
  description: string;
} & React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(true);

  return (
    <div className={cn("relative min-h-0 flex-1", className)} {...props}>
      <Separator />
      <div className="flex items-center gap-4">
        <div className="relative ml-[20vw] w-[35vw] shrink-0">
          <VideoPlayer
            className="w-full"
            playbackId={activeVideo.playbackId}
            onLoadStart={() => setLoading(true)}
            onCanPlay={() => setLoading(false)}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner className="size-8" />
            </div>
          )}
        </div>
        <p className="max-h-[calc(35vw*3/4)] max-w-md self-center overflow-clip text-4xl">
          {description}
        </p>
      </div>
      <Separator />
    </div>
  );
}
