import { Spinner } from "@components/ui/spinner";
import { VideoPlayer } from "@features/vignettes/mux-player";
import { cn } from "@lib/cn";
import { useState } from "react";

type Vignette = {
  playbackId: string;
  order: number;
  description: string;
};

function thumbnailUrl(playbackId: string, width: number, height: number) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0&width=${width}&height=${height}&fit_mode=crop`;
}

function VignetteStage({ vignette }: { vignette: Vignette }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative isolate overflow-hidden border-y border-y-white bg-slate-300 dark:bg-slate-500">
      <img
        src={thumbnailUrl(vignette.playbackId, 1920, 1080)}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover opacity-10 grayscale"
      />
      <div className="relative z-10 flex items-center gap-4">
        <div className="relative ml-[20vw] w-[35vw] shrink-0">
          <VideoPlayer
            className="w-full"
            playbackId={vignette.playbackId}
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
          {vignette.description}
        </p>
      </div>
    </div>
  );
}

function VignetteThumbnails({
  vignettes,
  activeIndex,
  onSelect,
}: {
  vignettes: Vignette[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const outline =
    "[filter:drop-shadow(0_1px_1px_rgb(0_0_0/0.05))_drop-shadow(2px_0_0_var(--thumb-outline))_drop-shadow(-2px_0_0_var(--thumb-outline))_drop-shadow(0_2px_0_var(--thumb-outline))_drop-shadow(0_-2px_0_var(--thumb-outline))]";

  return (
    <div className="mt-6 flex flex-wrap gap-2 lg:ml-[20vw]">
      {vignettes.map((vignette, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={vignette.playbackId}
            className={cn(
              outline,
              "[--thumb-outline:transparent]",
              "hover:[--thumb-outline:var(--muted-foreground)]",
              "focus-within:[--thumb-outline:var(--muted-foreground)]",
              isActive && "[--thumb-outline:var(--foreground)]",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Show vignette ${vignette.order}`}
              aria-pressed={isActive}
              className="group block cursor-pointer overflow-hidden [clip-path:polygon(0_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%)]"
            >
              <img
                src={thumbnailUrl(vignette.playbackId, 128, 96)}
                alt={`Vignette ${vignette.order}`}
                loading="lazy"
                className="block aspect-5/3 w-12 object-cover transition-transform duration-200 group-hover:scale-110"
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function Vignettes({ vignettes }: { vignettes: Vignette[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVignette = vignettes[activeIndex]!;

  return (
    <>
      <VignetteStage vignette={activeVignette} />
      <VignetteThumbnails
        vignettes={vignettes}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
      />
    </>
  );
}
