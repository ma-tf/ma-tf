import { VideoPlayer } from "@components/mux-player";
import { Button } from "@components/ui/button";
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
  videos,
  className,
  ...props
}: { videos: { playbackId: string; order: number }[] } & React.ComponentProps<"div">) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const activeVideo = videos[activeIndex];

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex gap-2">
        {videos.map((video, i) => (
          <Button
            key={video.order}
            variant={i === activeIndex ? "default" : "outline"}
            size="xs"
            onClick={() => setActiveIndex(i)}
          >
            {video.order}
          </Button>
        ))}
      </div>
      {activeVideo && (
        <div className="relative">
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
      )}
    </div>
  );
}
