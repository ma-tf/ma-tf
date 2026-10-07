import { describe, expect, it } from "vite-plus/test";

import { availablePort } from "@/scripts/dev-server.mts";

describe("availablePort", () => {
  it("reserves and releases a port", async () => {
    const port = await availablePort();

    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThan(65_536);
  });
});
