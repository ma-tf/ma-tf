import { resources, siteUrl } from "@features/discovery/catalog";
import { describeResource, resourceJsonResponse } from "@features/discovery/resource-json";
import { describe, expect, it } from "vite-plus/test";

describe("resourceJsonResponse", () => {
  it("returns a typed descriptor for every machine-readable resource", async () => {
    for (const resource of resources) {
      const response = resourceJsonResponse(resource.path);
      if (!response) throw new Error(`Missing JSON twin for ${resource.path}`);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toMatch(/^application\/json\b/);

      const body = (await response.json()) as Record<string, unknown>;
      expect(body).toEqual(describeResource(resource));
      expect(body.url).toBe(`${siteUrl}${resource.path}`);
    }
  });

  it("returns undefined for non-resource and unknown well-known paths", () => {
    expect(resourceJsonResponse("/about")).toBeUndefined();
    expect(resourceJsonResponse("/.well-known/missing")).toBeUndefined();
  });
});
