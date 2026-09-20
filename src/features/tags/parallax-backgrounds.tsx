export function ParallaxBackgrounds({ baseUrl }: { baseUrl: string }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
      <div
        className="absolute -inset-2.5 parallax-10 bg-(image:--background-image) page-bg-cap-1440 bg-top-left bg-no-repeat"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-1.webp")` } as React.CSSProperties
        }
      />
      <div
        className="absolute -inset-2.5 parallax-20 bg-(image:--background-image) page-bg-cap-1440 bg-top-left bg-no-repeat"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-2.webp")` } as React.CSSProperties
        }
      />
      <div
        className="absolute -inset-2.5 parallax-30 bg-(image:--background-image) page-bg-cap-1440 bg-top-left bg-no-repeat dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-3.webp")` } as React.CSSProperties
        }
      />
      <div
        className="absolute -inset-2.5 parallax-40 bg-(image:--background-image) page-bg-cap-1440 bg-top-left bg-no-repeat dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-4.webp")` } as React.CSSProperties
        }
      />
      <div
        className="absolute -inset-5 -right-32 parallax-50 bg-(image:--background-image) page-bg-1440 bg-top-right bg-no-repeat xl:right-0 xl:bg-top-left dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-5.webp")` } as React.CSSProperties
        }
      />
    </div>
  );
}
