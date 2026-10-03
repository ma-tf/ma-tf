import { escapeXml } from "@lib/xml";
import { describe, expect, it } from "vite-plus/test";

describe("escapeXml", () => {
  it("escapes the five XML entities", () => {
    expect(escapeXml(`<a href="x" title='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title=&apos;y&apos;&gt;&amp;&lt;/a&gt;",
    );
  });
});
