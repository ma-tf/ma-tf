import { HomePage } from "@features/home/home";
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
});
