export function BandcampEmbed({
  albumId,
  href,
  title,
}: {
  albumId: string;
  href: string;
  title: string;
}) {
  return (
    <iframe
      className="aspect-square w-full grayscale transition-[filter] duration-150 hover:grayscale-0"
      src={`https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=large/bgcol=ffffff/linkcol=0687f5/minimal=true/transparent=true/`}
      allow="encrypted-media; fullscreen; autoplay; idle-detection; speaker-selection; web-share;"
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
}: {
  feed: string;
  title: string;
  artworkSrc: string;
}) {
  return (
    <div className="group relative aspect-square w-full grayscale transition-[filter] duration-150 hover:grayscale-0">
      <img src={artworkSrc} alt="" className="absolute aspect-square w-full object-cover" />
      <iframe
        className="pointer-events-none absolute aspect-square w-full opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
        src={`https://player-widget.mixcloud.com/widget/iframe/?mini=false&hide_cover=false&hide_artwork=true&feed=${feed}`}
        title={title}
        allow="encrypted-media; fullscreen; autoplay; idle-detection; speaker-selection; web-share;"
      />
    </div>
  );
}
