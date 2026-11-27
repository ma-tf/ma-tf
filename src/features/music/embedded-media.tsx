import { PlayIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useState } from "react";

export function BandcampEmbed({
  albumId,
  href,
  title,
  className,
}: {
  albumId: string;
  href: string;
  title: string;
  className?: string;
}) {
  return (
    <iframe
      className={cn(
        "aspect-square w-full grayscale transition-[filter] duration-150 hover:grayscale-0",
        className,
      )}
      src={`https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=large/bgcol=ffffff/linkcol=0687f5/minimal=true/transparent=true/`}
      allow="encrypted-media; fullscreen; autoplay; web-share;"
      title={title}
      seamless
    >
      <a href={href}>{title}</a>
    </iframe>
  );
}

export function MixcloudEmbed({
  feed,
  title,
  artworkSrc,
  className,
}: {
  feed: string;
  title: string;
  artworkSrc: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "group relative aspect-square w-full grayscale transition-[filter] duration-150 hover:grayscale-0",
        className,
      )}
    >
      <img
        src={artworkSrc}
        alt=""
        width={1999}
        height={1999}
        className="absolute aspect-square w-full object-cover"
      />
      {loaded ? (
        <iframe
          className="absolute aspect-square w-full"
          src={`https://player-widget.mixcloud.com/widget/iframe/?autoplay=1&mini=false&hide_cover=false&hide_artwork=true&feed=${feed}`}
          title={title}
          allow="encrypted-media; fullscreen; autoplay; web-share;"
          ref={(frame) => frame?.focus()}
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={`Play ${title} on Mixcloud`}
          className="absolute grid aspect-square w-full cursor-pointer place-items-center"
        >
          <span className="grid size-12 place-items-center rounded-full bg-background/80 text-foreground">
            <PlayIcon size={20} weight="fill" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
}
