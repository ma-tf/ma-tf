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
import { cn } from "@lib/cn";
import {
  CassetteTapeIcon,
  HeadphonesIcon,
  SpeakerSimpleHighIcon,
  WaveformIcon,
  WaveTriangleIcon,
} from "@phosphor-icons/react";

export function MusicPreview({ images }: { images: ImageMap }) {
  const japanSrc = images["music/20251014_Japan 6_19.jpg"];
  return (
    <div className="bg-slate-200 dark:bg-slate-800">
      <Section className="mx-auto max-w-480 py-24">
        <SectionHeader>
          <SectionNumber />
          <SectionTitle href="/music">Music</SectionTitle>
        </SectionHeader>
        <SectionSubtitle className="border border-foreground p-4 pt-40">
          Original compositions, remixes, and live recordings.
        </SectionSubtitle>
        <div className="col-start-2 row-span-2 hidden md:block">
          <img src={japanSrc} alt="" className="border border-foreground" />
        </div>
        <SectionContent>
          <div className="flex flex-col gap-8">
            <p className="max-w-xl indent-8 text-xl text-foreground">
              My music splits into two strands. The drum and bass leans into an atmospheric style.
              Long evolving pads sit under chopped breaks, the space left between them doing as much
              work as the drums themselves. It is built around tension and groove - breaks cut up
              and re-assembled, with percussion threading through the gaps to keep things moving
              forward. The ambient work moves slower, toward darker, more sinister soundscapes.
              Drone and texture over melody, made to fill a room rather than hold a hook.
            </p>
            <div className="row-span-2 block md:hidden">
              <img src={japanSrc} alt="" className="border border-foreground" />
            </div>
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
              <div className="flex flex-col border border-foreground px-3 py-2">
                <span className="text-2xl">WM-D6C Walkman Professional</span>
                <span className="text-xs uppercase">Sony</span>
                <div className="mt-auto pt-4" title="Cassette Recorder">
                  <CassetteTapeIcon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <div className="flex flex-col border border-foreground px-3 py-2">
                <span className="text-2xl">HD 800 S</span>
                <span className="text-xs uppercase">Sennheiser</span>
                <div className="mt-auto pt-4" title="Headphones">
                  <HeadphonesIcon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <div className="flex flex-col border border-foreground px-3 py-2">
                <span className="text-2xl">Element III</span>
                <span className="text-xs uppercase">JDS Labs</span>
                <div className="mt-auto flex items-center gap-2 pt-4" title="DAC/Amp">
                  <span className="relative inline-flex size-5">
                    <WaveTriangleIcon
                      className="absolute inset-0 size-5 animate-icon-crossfade"
                      aria-hidden="true"
                    />
                    <WaveformIcon
                      className="absolute inset-0 size-5 animate-icon-crossfade [animation-delay:-2s]"
                      aria-hidden="true"
                    />
                  </span>
                  <SpeakerSimpleHighIcon className="size-5" aria-hidden="true" />
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              render={<a href="/music">Go to Music</a>}
              className="mt-6 w-fit rounded-none border-none bg-foreground indent-0 text-background hover:bg-muted-foreground dark:bg-foreground dark:hover:bg-muted-foreground/80"
              size="lg"
            />
          </div>
          {/* <p className="max-w-md indent-8 text-lg text-foreground">
          Everything is made inside FL Studio, my DAW of choice. Sounds come from sample CDs by
          E-Lab, Zero-G, and Spectrasonics, loaded through Amigo Sampler - a hardware sampler
          emulator that gives the discs the crunch of a 90s rack unit. For synths I lean on software
          emulations of Korg, Roland, and E-mu synths, alongside Omnisphere. For effects I use the
          Airwindows suite of plugins, and Alesis QuadraVerb impulses run through a convolver. When
          a track needs more character, I might pass it through my Sony WM-D6C for tape effects, a
          little compression, and warmth. It is all an imitation of rooms full of gear, but it takes
          up no space and still gets close enough the sound I am after.
        </p> */}
        </SectionContent>
      </Section>
    </div>
  );
}

export function Music({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col justify-center", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-3", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-right text-9xl md:text-[240px]", className)} {...props}>
      {children}
    </h2>
  );
}

export function MusicHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicDescription({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("indent-8 text-2xl", className)} {...props}>
      {children}
    </p>
  );
}
