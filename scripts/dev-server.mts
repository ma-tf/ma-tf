import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const root = fileURLToPath(new URL("../", import.meta.url));
const astro = fileURLToPath(new URL("../node_modules/astro/bin/astro.mjs", import.meta.url));

export type DevServer = {
  origin: string;
  sitemap: () => Promise<string>;
  stop: () => Promise<void>;
};

type Server = ReturnType<typeof spawn>;

function hasExited(server: Server): boolean {
  return server.exitCode !== null || server.signalCode !== null;
}

export function availablePort(): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, host, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not determine an available port"));
        return;
      }

      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}

async function fetchSitemapOnce(url: URL): Promise<string | undefined> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });

    return response.ok ? await response.text() : undefined;
  } catch {
    return undefined;
  }
}

async function loadSitemap(server: Server, url: URL): Promise<string> {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    if (hasExited(server)) {
      throw new Error("Astro dev server exited before the sitemap was available");
    }

    const sitemap = await fetchSitemapOnce(url);
    if (sitemap !== undefined) return sitemap;

    await delay(250);
  }

  throw new Error(`Timed out waiting for the Astro sitemap at ${url}`);
}

async function stopServer(server: Server): Promise<void> {
  if (hasExited(server)) return;

  const exited = new Promise<void>((resolve) => server.once("exit", () => resolve()));
  server.kill("SIGTERM");
  await Promise.race([exited, delay(5_000)]);

  if (hasExited(server)) return;

  server.kill("SIGKILL");
  await exited;
}

export async function startDevServer(): Promise<DevServer> {
  const port = await availablePort();
  const origin = `http://${host}:${port}`;
  const server = spawn(
    process.execPath,
    [astro, "dev", "--host", host, "--port", String(port), "--strictPort", "--ignore-lock"],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
  );

  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);

  return {
    origin,
    sitemap: () => loadSitemap(server, new URL("/sitemap.xml", origin)),
    stop: () => stopServer(server),
  };
}
