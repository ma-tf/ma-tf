import { resources, siteUrl } from "@features/discovery/catalog";
import { buildArd } from "@features/discovery/documents/ard";
import { describe, expect, it } from "vite-plus/test";

const manifest = buildArd();

describe("buildArd", () => {
  it("keeps the ARD manifest outer shape", () => {
    expect(Object.keys(manifest)).toEqual(["specVersion", "host", "entries"]);
    expect(manifest.specVersion).toBe("1.0");
  });

  it("lists one entry per discovery resource", () => {
    expect(manifest.entries).toHaveLength(resources.length);
    expect(manifest.entries.map((entry) => entry.url)).toEqual(
      resources.map((resource) => `${siteUrl}${resource.path}`),
    );
  });

  it("describes the catalogue as an ARD resource", () => {
    expect(manifest.entries).toContainEqual(
      expect.objectContaining({
        identifier: "urn:air:m4t.tf:catalog:ard",
        type: "application/ard+json",
        url: `${siteUrl}/.well-known/ard.json`,
      }),
    );
  });
});
