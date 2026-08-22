import { Vignettes } from "@components/vignettes";
import { cn } from "@lib/cn";
import { useState } from "react";

type Video = { playbackId: string; order: number; description: string };

const outline =
  "[filter:drop-shadow(0_1px_1px_rgb(0_0_0/0.05))_drop-shadow(2px_0_0_var(--thumb-outline))_drop-shadow(-2px_0_0_var(--thumb-outline))_drop-shadow(0_2px_0_var(--thumb-outline))_drop-shadow(0_-2px_0_var(--thumb-outline))]";

export function VignetteSelector({ videos }: { videos: Video[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = videos[activeIndex]!;

  return (
    <>
      <Vignettes activeVideo={activeVideo} description={activeVideo.description} />
      <div className="mt-6 flex flex-wrap gap-2 lg:ml-[20vw]">
        {videos.map((video, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={video.order}
              className={cn(
                outline,
                "[--thumb-outline:transparent]",
                "hover:[--thumb-outline:var(--muted-foreground)]",
                "focus-within:[--thumb-outline:var(--muted-foreground)]",
                isActive && "[--thumb-outline:var(--foreground)]",
              )}
            >
              <button
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "group block cursor-pointer overflow-hidden",
                  "[clip-path:polygon(0_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%)]",
                )}
              >
                <img
                  src={`https://image.mux.com/${video.playbackId}/thumbnail.jpg?time=2&width=128&height=96&fit_mode=crop`}
                  alt={`Vignette ${video.order}`}
                  loading="lazy"
                  className="block aspect-5/3 w-12 object-cover transition-transform duration-200 group-hover:scale-110"
                />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
