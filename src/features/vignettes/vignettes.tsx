import { Separator } from "@components/ui/separator";
import { Spinner } from "@components/ui/spinner";
import { VideoPlayer } from "@features/vignettes/mux-player";
import { cn } from "@lib/cn";
import { useState } from "react";

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
