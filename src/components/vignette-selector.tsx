import { Button } from "@components/ui/button";
import { Vignettes } from "@components/vignettes";
import { useState } from "react";

type Video = { playbackId: string; order: number; description: string };

export function VignetteSelector({ videos }: { videos: Video[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = videos[activeIndex]!;

  return (
    <>
      <div className="flex gap-2 mb-6">
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
      <div className="">
        <Vignettes activeVideo={activeVideo} />
        <p>{activeVideo.description}</p>
      </div>
    </>
  );
}
