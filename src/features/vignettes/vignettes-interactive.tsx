import { NavButton } from "@components/nav-button";
import { Spinner } from "@components/ui/spinner";
import { VideoPlayer } from "@features/vignettes/mux-player";
import { cn } from "@lib/cn";
import { PlayIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";

type Vignette = {
  id: string;
  playbackId: string;
  order: number;
  summary: string;
  description: string;
};

const VIGNETTE_NAVIGATION_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/music", label: "Music" },
  { href: "/photos", label: "Photography" },
];

const VIGNETTE_ROW_OFFSET_CLASSES = ["translate-x-0", "translate-x-4", "translate-x-8"];

function thumbnailUrl(playbackId: string, width: number, height: number) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0&width=${width}&height=${height}&fit_mode=crop`;
}

function VignetteBackground({ playbackId }: { playbackId: string }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-slate-500">
      <img
        src={thumbnailUrl(playbackId, 1920, 1080)}
        alt=""
        aria-hidden="true"
        className="size-full object-cover opacity-10 grayscale"
      />
    </div>
  );
}

function VignetteVideo({ playbackId }: { playbackId: string }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full min-w-0 md:w-2/3">
      <VideoPlayer
        className="w-full"
        playbackId={playbackId}
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

function VignetteDescription({
  description,
  className,
}: {
  description: string;
  className?: string;
}) {
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  function updateScrollProgress() {
    const element = descriptionRef.current;
    if (!element) return;

    const scrollableHeight = element.scrollHeight - element.clientHeight;
    setScrollProgress(scrollableHeight ? element.scrollTop / scrollableHeight : 0);
  }

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full max-w-md p-4 md:absolute md:inset-y-0 md:right-0 md:w-1/3 md:max-w-none",
        className,
      )}
    >
      <p
        ref={descriptionRef}
        onScroll={updateScrollProgress}
        className="min-w-0 flex-1 scrollbar-hidden overflow-y-auto text-3xl/11 whitespace-pre-line text-zinc-50 text-shadow-sm md:h-full md:min-h-0"
      >
        {description}
      </p>
      <div className="pointer-events-none relative w-1 shrink-0" aria-hidden="true">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zinc-50/40" />
        <div
          className="absolute left-1/2 size-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-50"
          style={{ top: `${scrollProgress * 100}%` }}
        />
      </div>
    </div>
  );
}

function VignetteThumbnail({
  vignette,
  index,
  activeIndex,
  onSelect,
}: {
  vignette: Vignette;
  index: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const outline =
    "[filter:drop-shadow(0_1px_1px_rgb(0_0_0/0.05))_drop-shadow(2px_0_0_var(--thumb-outline))_drop-shadow(-2px_0_0_var(--thumb-outline))_drop-shadow(0_2px_0_var(--thumb-outline))_drop-shadow(0_-2px_0_var(--thumb-outline))]";
  const rowIndex = Math.floor(index / 3);
  const isActive = index === activeIndex;

  return (
    <div className={cn("min-w-0", VIGNETTE_ROW_OFFSET_CLASSES[rowIndex] ?? "translate-x-0")}>
      <button
        type="button"
        onClick={() => onSelect(index)}
        aria-label={`Show vignette ${vignette.order}`}
        aria-pressed={isActive}
        className={cn(
          "group flex min-w-0 cursor-pointer items-start gap-2 text-left transition-[transform,color] duration-150 hover:-translate-y-0.5",
        )}
      >
        <div
          className={cn(
            outline,
            "shrink-0 [--thumb-outline:transparent]",
            "group-hover:[--thumb-outline:var(--muted-foreground)]",
            "group-focus-visible:[--thumb-outline:var(--muted-foreground)]",
            isActive && "[--thumb-outline:var(--foreground)]",
          )}
        >
          <span className="block overflow-hidden [clip-path:polygon(0_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%)]">
            <img
              src={thumbnailUrl(vignette.playbackId, 128, 96)}
              alt={`Vignette ${vignette.order}`}
              loading="lazy"
              className="block aspect-5/3 w-12 object-cover transition-transform duration-200 group-hover:scale-110"
            />
          </span>
        </div>
        <div className="min-w-0 text-sm">
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "text-xs font-medium text-muted-foreground lowercase transition-colors duration-150 group-hover:text-foreground",
                isActive && "text-foreground",
              )}
            >
              {vignette.id}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "grid size-3 shrink-0 place-items-center border border-foreground bg-background text-foreground transition-[background-color,color] duration-150 group-hover:bg-foreground group-hover:text-background",
              )}
            >
              <PlayIcon className="size-1.5" weight="fill" />
            </span>
          </div>
          <span
            className={cn(
              "block text-[0.625rem] text-muted-foreground lowercase transition-colors duration-200 group-hover:text-foreground",
              isActive && "text-foreground",
            )}
          >
            {vignette.summary}
          </span>
        </div>
      </button>
    </div>
  );
}

function VignettesNavigation() {
  return (
    <nav className="mr-4 flex flex-col items-stretch gap-1" aria-label="Section navigation">
      {VIGNETTE_NAVIGATION_LINKS.map(({ href, label }) => (
        <NavButton key={href} href={href} variant="outline">
          {label}
        </NavButton>
      ))}
    </nav>
  );
}

export function VignettesInteractive({ vignettes }: { vignettes: Vignette[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVignette = vignettes[activeIndex]!;

  return (
    <>
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-y border-zinc-50">
        <VignetteBackground playbackId={activeVignette.playbackId} />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl">
          <VignetteVideo playbackId={activeVignette.playbackId} />
          <VignetteDescription description={activeVignette.description} />
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid grid-cols-3 gap-x-8 gap-y-2">
          {vignettes.map((vignette, index) => (
            <VignetteThumbnail
              key={vignette.id}
              vignette={vignette}
              index={index}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
            />
          ))}
        </div>
        <VignettesNavigation />
      </div>
    </>
  );
}
