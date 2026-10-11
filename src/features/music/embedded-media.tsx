import { cn } from "cn";

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
      <iframe
        className="pointer-events-none absolute aspect-square w-full opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
        src={`https://player-widget.mixcloud.com/widget/iframe/?mini=false&hide_cover=false&hide_artwork=true&feed=${feed}`}
        title={title}
        allow="encrypted-media; fullscreen; autoplay; web-share;"
      />
    </div>
  );
}
