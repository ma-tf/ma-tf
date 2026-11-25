import {
  Crt,
  CrtContent,
  CrtDescription,
  CrtHeader,
  CrtTitle,
  CrtWorkbench,
} from "@features/crt/crt";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

describe("Crt server render", () => {
  it("renders the heading, description and upload prompt without a browser", () => {
    const html = renderToStaticMarkup(
      <Crt>
        <CrtHeader>
          <CrtTitle>CRT</CrtTitle>
          <CrtDescription>A cathode-ray screen</CrtDescription>
        </CrtHeader>
        <CrtContent>
          <CrtWorkbench />
        </CrtContent>
      </Crt>,
    );

    expect(html).toContain('data-slot="crt"');
    expect(html).toContain(">CRT</h1>");
    expect(html).toContain("A cathode-ray screen");
    expect(html).toContain("Drop an image, or choose one");
    expect(html).not.toContain("<canvas");
  });
});
