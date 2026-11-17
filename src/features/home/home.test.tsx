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

  it("renders the fragment layer hidden and decorative until placement", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("data-home-fragments");
    expect(html).toContain('aria-hidden="true"');
    expect(html.match(/data-home-fragment="true"/g)).toHaveLength(6);
    expect(html.match(/data-fragments-avoid/g)).toHaveLength(13);
    expect(html).toContain("Lorem ipsum dolor sit amet");
    expect(html).toContain("w-56 font-mono text-xs");
    expect(html).toContain("transition-opacity ease-in-out");
    expect(DEFAULT_PLACEMENT.width).toBe(224);
  });
});
