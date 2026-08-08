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
      className="w-full aspect-square grayscale"
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
    <div className="group relative w-full aspect-square grayscale">
      <img src={artworkSrc} alt="" className="absolute w-full aspect-square object-cover" />
      <iframe
        className="absolute w-full aspect-square opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
        src={`https://player-widget.mixcloud.com/widget/iframe/?mini=false&hide_cover=false&hide_artwork=true&feed=${feed}`}
        title={title}
        allow="encrypted-media; fullscreen; autoplay; idle-detection; speaker-selection; web-share;"
      />
    </div>
  );
}
