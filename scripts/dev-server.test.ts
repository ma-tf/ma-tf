import { spawn } from "node:child_process";
import { describe, expect, it } from "vite-plus/test";

import { availablePort, stopServer } from "@/scripts/dev-server.mts";

describe("availablePort", () => {
  it("reserves and releases a port", async () => {
    const port = await availablePort();

    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThan(65_536);
  });
});

describe("stopServer", () => {
  function spawnLive(): ReturnType<typeof spawn> {
    return spawn(process.execPath, ["-e", "setInterval(() => {}, 1_000)"], {
      stdio: "ignore",
    });
  }

  function hasStopped(child: ReturnType<typeof spawn>): boolean {
    return child.exitCode !== null || child.signalCode !== null;
  }

  it("terminates a live child", async () => {
    const child = spawnLive();

    await stopServer(child);

    expect(hasStopped(child)).toBe(true);
  });

  it("is idempotent", async () => {
    const child = spawnLive();

    await stopServer(child);

    await expect(stopServer(child)).resolves.toBeUndefined();
  });

  it("force-kills a child that ignores SIGTERM", async () => {
    const child = spawn(
      process.execPath,
      ["-e", "process.on('SIGTERM', () => {}); setInterval(() => {}, 1_000)"],
      { stdio: "ignore" },
    );

    await stopServer(child, 100);

    expect(hasStopped(child)).toBe(true);
  });

  it("resolves for an already-exited child", async () => {
    const child = spawn(process.execPath, ["-e", "process.exit(0)"], { stdio: "ignore" });

    await new Promise<void>((resolve) => child.once("exit", () => resolve()));

    await expect(stopServer(child)).resolves.toBeUndefined();
  });
});
