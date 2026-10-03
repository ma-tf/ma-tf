import { buildRobotsTxt } from "@features/discovery/documents/robots";
import { describe, expect, it } from "vite-plus/test";

describe("buildRobotsTxt", () => {
  it("points the Agentmap directive at the ARD catalogue", () => {
    expect(buildRobotsTxt()).toContain("Agentmap: https://m4t.tf/.well-known/ard.json");
  });

  it("points the schemamap directive at the schema map", () => {
    expect(buildRobotsTxt()).toContain("schemamap: https://m4t.tf/schemamap.xml");
  });
});
