import { VideoPlayer } from "@components/mux-player";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@components/ui/card";
import { Spinner } from "@components/ui/spinner";
import { cn } from "@lib/cn";
import { useState } from "react";

export function VignettesPreview() {
  return (
    <Card className="w-3xl">
      <CardHeader>
        <CardTitle>Vignettes</CardTitle>
        <CardDescription>Experimental motion work exploring through the lens.</CardDescription>
      </CardHeader>
      <CardFooter>
        <a
          href="/vignettes"
          className="underline underline-offset-4 transition-colors hover:text-foreground/70"
        >
          View vignettes
        </a>
      </CardFooter>
    </Card>
  );
}

export function Vignettes({
  activeVideo,
  className,
  ...props
}: {
  activeVideo: { playbackId: string; order: number };
} & React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(true);

  return (
    <div className={cn("relative min-h-0 flex-1", className)} {...props}>
      <VideoPlayer
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
  );
}
