import { VideoPlayer } from "@components/mux-player";
import { Card, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { Spinner } from "@components/ui/spinner";
import { cn } from "@lib/cn";
import { useState } from "react";

export function VignettesPreview() {
  return (
    <Card className="w-3xl">
      <CardHeader>
        <CardTitle>
          <a
            href="/vignettes"
            className="underline-offset-4 transition-colors hover:text-foreground/70 hover:underline"
          >
            Vignettes
          </a>
        </CardTitle>
        <CardDescription>Experimental motion work exploring through the lens.</CardDescription>
      </CardHeader>
    </Card>
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
