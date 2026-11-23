import { HeaderAudio } from "@components/header-audio";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

describe("Header audio", () => {
  it("renders the transport and volume bar at the default level", () => {
    const html = renderToStaticMarkup(<HeaderAudio />);

    expect(html).toContain('aria-label="Play music"');
    expect(html).toContain('aria-label="Music volume"');
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuenow="70"');
    expect(html).toContain('src="/demo-menu-loop.mp3"');
    expect(html).toContain('preload="metadata"');
  });
});
