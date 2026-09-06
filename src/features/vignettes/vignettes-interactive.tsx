import type { CollectionEntry } from "astro:content";

import { NavButton } from "@components/nav-button";
import { Spinner } from "@components/ui/spinner";
import { VideoPlayer } from "@features/vignettes/mux-player";
import { thumbnailUrl, VignetteThumbnail } from "@features/vignettes/vignette-thumbnail";
import { VignetteThumbnailProvider } from "@features/vignettes/vignette-thumbnail-context";
import { cn } from "@lib/cn";
import { useRef, useState } from "react";

const VIGNETTE_NAVIGATION_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/music", label: "Music" },
  { href: "/photos", label: "Photography" },
];

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

export function VignettesInteractive({
  vignettes,
}: {
  vignettes: CollectionEntry<"vignettes">["data"][];
}) {
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
            <VignetteThumbnailProvider
              key={vignette.id}
              vignette={vignette}
              index={index}
              activeIndex={activeIndex}
              isActive={index === activeIndex}
              onSelect={setActiveIndex}
            >
              <VignetteThumbnail />
            </VignetteThumbnailProvider>
          ))}
        </div>
        <VignettesNavigation />
      </div>
    </>
  );
}
