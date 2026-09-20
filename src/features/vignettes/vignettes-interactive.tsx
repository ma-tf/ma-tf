import type { CollectionEntry } from "astro:content";

import { NavButton } from "@components/nav-button";
import { Spinner } from "@components/ui/spinner";
import { VideoPlayer } from "@features/vignettes/mux-player";
import { thumbnailUrl, VignetteThumbnail } from "@features/vignettes/vignette-thumbnail";
import { VignetteThumbnailProvider } from "@features/vignettes/vignette-thumbnail-context";
import { VIGNETTE_NAVIGATION_LINKS } from "@features/vignettes/vignettes-menu";
import { cn } from "cn";
import { useRef, useState } from "react";

function VignetteBackground({ playbackId }: { playbackId: string }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-vignettes-video">
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
          <Spinner size="xl" />
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
        "relative flex min-h-0 w-full overflow-hidden py-4 pl-4 md:h-full md:w-1/3",
        className,
      )}
    >
      <p
        ref={descriptionRef}
        onScroll={updateScrollProgress}
        className="min-h-0 min-w-0 flex-1 scrollbar-hidden overflow-y-auto text-2xl/9 whitespace-pre-line text-vignettes-video-ink text-shadow-sm md:text-3xl/11"
      >
        {description}
      </p>
      <div className="pointer-events-none relative hidden w-1 shrink-0 md:block" aria-hidden="true">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-vignettes-video-ink/40" />
        <div
          className="absolute scroll-progress-dot left-1/2 size-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-vignettes-video-ink"
          style={{ "--scroll-progress": scrollProgress } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

function VignettesNavigation() {
  return (
    <nav className="hidden flex-col items-stretch gap-1 md:flex" aria-label="Section navigation">
      {VIGNETTE_NAVIGATION_LINKS.map(({ href, label }) => (
        <NavButton key={href} href={href} variant="solid">
          {label}
        </NavButton>
      ))}
    </nav>
  );
}

export function VignettesInteractive({
  vignettes,
  activeVignette,
}: {
  vignettes: CollectionEntry<"vignettes">["data"][];
  activeVignette: CollectionEntry<"vignettes">["data"];
}) {
  return (
    <>
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-y border-vignettes-video-ink">
        <VignetteBackground playbackId={activeVignette.playbackId} />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-8">
          <div className="flex w-full flex-col md:aspect-2/1 md:flex-row">
            <VignetteVideo playbackId={activeVignette.playbackId} />
            <VignetteDescription description={activeVignette.description} />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-4 md:px-8">
        <div className="flex flex-col md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-2">
          {vignettes.map((vignette, index) => (
            <VignetteThumbnailProvider
              key={vignette.id}
              vignette={vignette}
              index={index}
              isActive={vignette.slug === activeVignette.slug}
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
