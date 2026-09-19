export function ParallaxBackgrounds({ baseUrl }: { baseUrl: string }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
      <div
        className="absolute -inset-2.5 parallax-[0.1] bg-(image:--background-image) bg-size-[min(1440px,100vw)_auto] bg-top-left bg-no-repeat"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-1.webp")` } as React.CSSProperties
        }
      />
      <div
        className="absolute -inset-2.5 parallax-[0.2] bg-(image:--background-image) bg-size-[min(1440px,100vw)_auto] bg-top-left bg-no-repeat"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-2.webp")` } as React.CSSProperties
        }
      />
      <div
        className="absolute -inset-2.5 parallax-[0.3] bg-(image:--background-image) bg-size-[min(1440px,100vw)_auto] bg-top-left bg-no-repeat dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-3.webp")` } as React.CSSProperties
        }
      />
      <div
        className="absolute -inset-2.5 parallax-[0.4] bg-(image:--background-image) bg-size-[min(1440px,100vw)_auto] bg-top-left bg-no-repeat dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-4.webp")` } as React.CSSProperties
        }
      />
      <div
        className="absolute -inset-5 -right-32 parallax-0.5 bg-(image:--background-image) bg-size-[1440px_auto] bg-top-right bg-no-repeat xl:right-0 xl:bg-top-left dark:invert"
        style={
          { "--background-image": `url("${baseUrl}/blog/tags-bg-5.webp")` } as React.CSSProperties
        }
      />
    </div>
  );
}
