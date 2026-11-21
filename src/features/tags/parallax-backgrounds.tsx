export function ParallaxBackgrounds({ baseUrl }: { baseUrl: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute -top-2.5 -left-2.5 h-450 w-600 origin-top-left scale-50 md:scale-35 lg:scale-45 xl:scale-60">
        <img
          data-parallax={10}
          src={`${baseUrl}/blog/tags-bg-1.avif`}
          alt=""
          decoding="async"
          className="absolute top-0 left-0 max-w-none"
        />
        <img
          data-parallax={20}
          src={`${baseUrl}/blog/tags-bg-2.avif`}
          alt=""
          decoding="async"
          className="absolute top-0 left-0 max-w-none"
        />
        <img
          data-parallax={30}
          src={`${baseUrl}/blog/tags-bg-3.avif`}
          alt=""
          decoding="async"
          className="absolute top-1.5 left-2 max-w-none dark:invert"
        />
        <img
          data-parallax={40}
          src={`${baseUrl}/blog/tags-bg-4.avif`}
          alt=""
          decoding="async"
          className="absolute top-0 left-0 max-w-none dark:invert"
        />
        <img
          data-parallax={50}
          src={`${baseUrl}/blog/tags-bg-5.avif`}
          alt=""
          decoding="async"
          className="absolute top-0 left-352 hidden max-w-none md:block dark:invert"
        />
      </div>
    </div>
  );
}
