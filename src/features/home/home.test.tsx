import { HomePage } from "@features/home/home";
import { DEFAULT_PLACEMENT } from "@lib/fragment-placement";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

describe("HomePage decorators", () => {
  it("keeps section numbers and indicators hidden without shifting titles", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("section-number");
    expect(html).toContain("bg-foreground/30");
    expect(html).toContain("invisible");
    expect(html).toContain("Blog");
    expect(html.match(/data-wire-landing/g)).toHaveLength(18);
    expect(html.match(/data-prev-led/g)).toHaveLength(2);
    expect(html).toContain("data-home-wires-front");
  });

  it("lifts the bottom plate only for washes that carry an image", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).not.toContain("data-preview-bottom:-translate-y-10");
  });

  it("freezes the mobile fan with a fixed composition width", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("perspective-midrange");
    expect(html).toContain("w-3xl shrink-0");
    expect(html).toContain("md:w-auto");
    expect(html).not.toContain("md:tilt-");
    expect(html).not.toContain("md:perspective-midrange");
  });

  it("curves the section stack on one convex surface", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html.match(/-tilt-x-19/g)).toHaveLength(1);
    expect(html.match(/tilt-x-19/g)).toHaveLength(2);
    expect(html.match(/tilt-z-53/g)).toHaveLength(2);
    expect(html.match(/tilt-z-19/g)).toHaveLength(2);
    expect(html.match(/tilt-z-2/g)).toHaveLength(2);
    expect(html.match(/tilt-z-14/g)).toHaveLength(1);
    expect(html.match(/-tilt-y-6/g)).toHaveLength(1);
  });

  it("swipes preview images on one screen without cropping them", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("data-prev-screen");
    expect(html).toContain("data-prev-loading");
    expect(html.match(/data-prev-image=/g)).toHaveLength(5);
    expect(html).not.toContain("transition-[display]");
    expect(html).toContain("object-contain");
    expect(html.match(/animate-scanline/g)).toHaveLength(1);
    expect(html.match(/crt-mask/g)).toHaveLength(1);
  });

  it("fades section photos to transparency rather than the page background", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).not.toContain("bg-linear-to-r from-background");
  });

  it("renders the fragment layer hidden and decorative until placement", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("data-home-fragments");
    expect(html).toContain('aria-hidden="true"');
    expect(html.match(/data-home-fragment="true"/g)).toHaveLength(12);
    expect(html.match(/data-fragments-avoid/g)).toHaveLength(13);
    expect(html).toContain("Notes, essays and changelogs");
    expect(html).toContain("w-56 font-mono text-2xs");
    expect(html).toContain("transition-opacity ease-in-out");
    expect(DEFAULT_PLACEMENT.width).toBe(224);
    expect(DEFAULT_PLACEMENT.height).toBe(120);
  });
});
