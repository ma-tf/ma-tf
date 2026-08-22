import { VideoPlayer } from "@components/mux-player";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionNumber,
  SectionSubtitle,
  SectionTitle,
} from "@components/section";
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
      <SectionSubtitle>Experimental motion work exploring through the lens.</SectionSubtitle>
      <SectionContent>
        <p className="max-w-md indent-8 text-lg text-foreground">
          A series of short motion studies, shot on location in the quiet hours. Small observations
          of a place and the details that give it character.
        </p>
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
