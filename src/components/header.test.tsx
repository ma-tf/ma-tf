import { Header } from "@components/header";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

const props = {
  pages: [{ label: "About", href: "/about" }],
  email: "hello@example.com",
  github: "https://github.com/example",
  linkedin: "https://linkedin.com/in/example",
};

describe("Header chrome", () => {
  it("keeps the top-left plate inset where the CV chip exists", () => {
    const html = renderToStaticMarkup(<Header currentPath="/" {...props} />);

    expect(html).toContain("md:before:-left-69");
    expect(html).not.toContain("md:before:-left-76");
    expect(html).toContain('aria-label="CV"');
  });

  it("shifts the top-left plate by the omitted CV chip on the CV page", () => {
    const html = renderToStaticMarkup(<Header currentPath="/cv" {...props} />);

    expect(html).toContain("md:before:-left-76");
    expect(html).not.toContain("md:before:-left-69");
    expect(html).not.toContain('aria-label="CV"');
  });
});
