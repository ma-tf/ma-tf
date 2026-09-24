export function ParallaxBackgrounds({ baseUrl }: { baseUrl: string }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
      <div
        data-parallax={10}
        className="absolute -inset-2.5 bg-(image:--background-image) page-bg-cap-1440 bg-top-left bg-no-repeat"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-1.webp")` } as React.CSSProperties
        }
      />
      <div
        data-parallax={20}
        className="absolute -inset-2.5 bg-(image:--background-image) page-bg-cap-1440 bg-top-left bg-no-repeat"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-2.webp")` } as React.CSSProperties
        }
      />
      <div
        data-parallax={30}
        className="absolute -inset-2.5 bg-(image:--background-image) page-bg-cap-1440 bg-top-left bg-no-repeat dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-3.webp")` } as React.CSSProperties
        }
      />
      <div
        data-parallax={40}
        className="absolute -inset-2.5 bg-(image:--background-image) page-bg-cap-1440 bg-top-left bg-no-repeat dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-4.webp")` } as React.CSSProperties
        }
      />
      <div
        data-parallax={50}
        className="absolute -inset-5 -right-32 bg-(image:--background-image) page-bg-1440 bg-top-right bg-no-repeat xl:right-0 xl:bg-top-left dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-5.webp")` } as React.CSSProperties
        }
      />
    </div>
  );
}
