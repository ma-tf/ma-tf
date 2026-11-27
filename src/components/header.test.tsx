import { Header } from "@components/header";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

const props = {
  pages: [{ label: "About", href: "/about" }],
  email: "hello@example.com",
  github: "https://github.com/example",
  linkedin: "https://linkedin.com/in/example",
  audioEnabled: true,
};

describe("Header chrome", () => {
  it("keeps the top-left plate inset where the CV chip exists", () => {
    const html = renderToStaticMarkup(<Header currentPath="/" {...props} />);

    expect(html).toContain("md:before:-left-41.5");
    expect(html).not.toContain("md:before:-left-48.5");
    expect(html).toContain('aria-label="CV"');
  });

  it("shifts the top-left plate by the omitted CV chip on the CV page", () => {
    const html = renderToStaticMarkup(<Header currentPath="/cv" {...props} />);

    expect(html).toContain("md:before:-left-48.5");
    expect(html).not.toContain("md:before:-left-41.5");
    expect(html).not.toContain('aria-label="CV"');
  });

  it("mounts the looping audio control", () => {
    const html = renderToStaticMarkup(<Header currentPath="/" {...props} />);

    expect(html).toContain('aria-label="Music volume"');
    expect(html).toContain('aria-label="Play music"');
  });

  it("renders the sound effects toggle with or without the audio control", () => {
    for (const audioEnabled of [true, false]) {
      const html = renderToStaticMarkup(
        <Header currentPath="/" {...props} audioEnabled={audioEnabled} />,
      );

      expect(html).toContain('aria-label="Mute sound effects"');
    }
  });

  it("keeps the original chrome and omits the audio control when the flag is off", () => {
    const html = renderToStaticMarkup(<Header currentPath="/" {...props} audioEnabled={false} />);
    const cvHtml = renderToStaticMarkup(
      <Header currentPath="/cv" {...props} audioEnabled={false} />,
    );

    expect(html).toContain("md:before:-left-70");
    expect(html).not.toContain("md:before:-left-41.5");
    expect(cvHtml).toContain("md:before:-left-77");
    expect(cvHtml).not.toContain("md:before:-left-48.5");
    expect(html).not.toContain('aria-label="Music volume"');
    expect(html).not.toContain('aria-label="Play music"');
  });
});
