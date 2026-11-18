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
    expect(html.match(/data-wire-landing/g)).toHaveLength(12);
  });

  it("freezes the mobile fan with a fixed composition width", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("perspective-midrange");
    expect(html).toContain("tilt-y-16");
    expect(html).toContain("w-3xl shrink-0");
    expect(html).toContain("md:w-auto");
    expect(html).not.toContain("md:tilt-");
    expect(html).not.toContain("md:perspective-midrange");
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
