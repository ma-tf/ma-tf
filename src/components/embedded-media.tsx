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
      className="w-full shrink-0 h-11"
      src={`https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=small/bgcol=ffffff/linkcol=0687f5/artwork=none/transparent=true/`}
      allow="encrypted-media; fullscreen; autoplay; idle-detection; speaker-selection; web-share;"
      title={title}
      seamless
    >
      <a href={href}>{title}</a>
    </iframe>
  );
}

export function MixcloudEmbed({ feed, title }: { feed: string; title: string }) {
  return (
    <iframe
      className="w-full shrink-0 h-30"
      src={`https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&light=1&hide_artwork=1&feed=${feed}`}
      title={title}
      allow="encrypted-media; fullscreen; autoplay; idle-detection; speaker-selection; web-share;"
    />
  );
}
