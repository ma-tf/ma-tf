import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const astro = fileURLToPath(new URL("../node_modules/astro/bin/astro.mjs", import.meta.url));
const host = "127.0.0.1";

function availablePort(): Promise<number> {
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

function decodeXml(value: string): string {
  return value.replace(/&(amp|lt|gt|quot|apos);/g, (entity) => {
    const entities = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&apos;": "'",
    };

    return entities[entity as keyof typeof entities];
  });
}

function hasServerExited(server: ReturnType<typeof spawn>): boolean {
  return server.exitCode !== null || server.signalCode !== null;
}

async function fetchSitemapOnce(url: URL): Promise<string | undefined> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
    return response.ok ? await response.text() : undefined;
  } catch {
    return undefined;
  }
}

async function loadSitemap(server: ReturnType<typeof spawn>, url: URL): Promise<string> {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    if (hasServerExited(server)) {
      throw new Error("Astro dev server exited before the sitemap was available");
    }

    const sitemap = await fetchSitemapOnce(url);
    if (sitemap !== undefined) return sitemap;

    await delay(250);
  }

  throw new Error(`Timed out waiting for the Astro sitemap at ${url}`);
}

function vignetteTitle(pathname: string, url: string): string {
  const slug = pathname.split("/").at(-1);
  if (!slug) throw new Error(`Vignette URL has no slug: ${url}`);

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function titleLine(markdown: string): string | undefined {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];

  return frontmatter?.match(/^title: ("(?:\\.|[^"\\])*")$/m)?.[1];
}

function decodeTitle(line: string, url: string): string {
  const title = JSON.parse(line);
  if (typeof title !== "string") throw new Error(`Markdown twin has an invalid title for ${url}`);

  return title.replace(/ \| [^|]+$/, "");
}

function markdownTitle(markdown: string, url: string): string {
  const line = titleLine(markdown);
  if (!line) throw new Error(`Markdown twin has no title for ${url}`);

  return decodeTitle(line, url);
}

function pageTitle(markdown: string, url: string): string {
  const pathname = new URL(url).pathname;

  return pathname.startsWith("/vignettes/")
    ? vignetteTitle(pathname, url)
    : markdownTitle(markdown, url);
}

async function loadPage(
  path: string,
  origin: string,
  canonicalOrigin: string,
): Promise<{ url: string; title: string; content: string }> {
  const localUrl = new URL(path, origin);
  const response = await fetch(localUrl, {
    headers: { Accept: "text/markdown" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) throw new Error(`Could not render published page ${localUrl.href}`);
  if (!response.headers.get("Content-Type")?.startsWith("text/markdown")) {
    throw new Error(`Expected a Markdown twin for ${localUrl.href}`);
  }

  const content = await response.text();
  const url = new URL(path, canonicalOrigin).href;

  return { url, title: pageTitle(content, url), content };
}

async function stopServer(server: ReturnType<typeof spawn>): Promise<void> {
  if (hasServerExited(server)) return;

  const exited = new Promise<void>((resolve) => server.once("exit", () => resolve()));
  server.kill("SIGTERM");
  await Promise.race([exited, delay(5_000)]);

  if (hasServerExited(server)) return;

  server.kill("SIGKILL");
  await exited;
}

const port = await availablePort();
const origin = `http://${host}:${port}`;
const server = spawn(
  process.execPath,
  [astro, "dev", "--host", host, "--port", String(port), "--strictPort"],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
);

server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);

try {
  const sitemap = await loadSitemap(server, new URL("/sitemap.xml", origin));
  const locations =
    sitemap.match(/<loc>[^<]+<\/loc>/g)?.map((location) => decodeXml(location.slice(5, -6))) ?? [];
  if (locations.length === 0) throw new Error("The sitemap contained no published pages");

  const firstLocation = locations.at(0);
  if (!firstLocation) throw new Error("The sitemap contained no published pages");

  const canonicalOrigin = new URL(firstLocation).origin;
  const paths = [
    ...new Set(
      locations
        .map((location) => new URL(location).pathname)
        .filter((path) => !path.startsWith("/tags/"))
        .map((path) => path.replace(/\/+$/, "") || "/"),
    ),
  ];
  const pages = await Promise.all(paths.map((path) => loadPage(path, origin, canonicalOrigin)));
  const output = fileURLToPath(
    new URL("../src/features/ask/published-pages.generated.json", import.meta.url),
  );

  await writeFile(output, `${JSON.stringify(pages, null, 2)}\n`);
  console.log(`Generated Ask corpus with ${pages.length} published pages.`);
} finally {
  await stopServer(server);
}
