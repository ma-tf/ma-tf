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
import { useState } from "react";

export function VignettesPreview() {
  return (
    <Section>
      <SectionHeader>
        <SectionNumber>02</SectionNumber>
        <SectionTitle href="/vignettes">Vignettes</SectionTitle>
      </SectionHeader>
      <SectionSubtitle className="col-span-2">
        Experimental motion work; exploring through the lens.
      </SectionSubtitle>
      <SectionContent className="grid grid-cols-3 gap-4">
        <div className="border border-foreground" />
        <div className="col-span-1 indent-8 text-lg text-foreground">
          <p>
            A series of short motion studies, shot on location in the quiet hours. Small
            observations of a place and the details that give it character.
          </p>
          <p>
            The <span className="italic">Bolex H-16 SBM</span> offers a portable way to create true
            filmic experiences without electricity as a hard requirement. Using 30 metre film reels
            and a wind-up motor, I can shoot scenes up to 30 seconds long with a maximum of
            approximately 2 minutes and 45 seconds of footage per reel.
          </p>
          <p>
            For my own convenience, I use a battery powered Kern Vario-Switar 16-100mm lens. The
            battery powers the auto exposure and the in-built electric motor for zooming.
          </p>
          <p>
            Shooting on film is an exercise in economy. Each scene is a single take with no chance
            to delete or reshoot without paying for the footage again, so every second has to be
            deliberate. That constraint is part of what makes the format so rewarding.
          </p>
          <p>
            Everything is shot on 16mm film. Its grain and tonal latitude give the footage a texture
            that digital struggles to match, and the format's soft, rounded frame corners come
            straight from the lens and gate rather than any filter.
          </p>
          <p>
            Photographs freeze a single instant, but some places only come alive in motion. The
            speed of a moving train, the swing of shoes on a wire, the rolling waves on a beach
            during sunset. These studies are an attempt to hold on to those moving moments.
          </p>
          <Button
            variant="outline"
            render={<a href="/vignettes" />}
            className="mt-6 rounded-none border-none bg-foreground indent-0 text-background hover:bg-muted-foreground dark:bg-foreground dark:hover:bg-muted-foreground/80"
            size="lg"
          >
            View vignettes
          </Button>
        </div>
      </SectionContent>
    </Section>
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
        <VideoPlayer
          className="ml-[20vw] w-[35vw] shrink-0"
          playbackId={activeVideo.playbackId}
          onLoadStart={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
        />
        <p className="max-h-[calc(35vw*3/4)] max-w-md self-center overflow-clip text-4xl">
          {description}
        </p>
      </div>
      <Separator />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className="size-8" />
        </div>
      )}
    </div>
  );
}
