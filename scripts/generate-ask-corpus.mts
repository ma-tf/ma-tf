import type { McpResource } from "@features/mcp/catalogue";

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join, relative } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const astro = fileURLToPath(new URL("../node_modules/astro/bin/astro.mjs", import.meta.url));
const tagsFile = fileURLToPath(new URL("../src/features/ask/ask-tags.json", import.meta.url));
const output = fileURLToPath(
  new URL("../src/features/ask/published-pages.generated.json", import.meta.url),
);
const resourcesOutput = fileURLToPath(
  new URL("../src/features/mcp/resources.generated.json", import.meta.url),
);
const host = "127.0.0.1";

const hashFileCandidates = [
  "astro.config.mjs",
  "tsconfig.json",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  ".node-version",
];

const hashEnvKeys = ["R2_PUBLIC_URL"];

export type AskTag = {
  short: string;
  keywords: string[];
};

export type AskTagFile = Record<string, Record<string, AskTag>>;

type CorpusPage = {
  url: string;
  title: string;
  content: string;
};

export type ResourceCatalogue = {
  sourceHash: string;
  resources: (McpResource & { text: string })[];
};

export function assembleResourceCatalogue(
  sourceHash: string,
  resources: McpResource[],
  bodies: ReadonlyMap<string, string>,
): ResourceCatalogue {
  return {
    sourceHash,
    resources: resources.map((resource) => {
      const text = bodies.get(resource.uri);

      if (text === undefined) throw new Error(`No body fetched for ${resource.uri}`);

      return { ...resource, text };
    }),
  };
}

export function shouldRegenerate(
  forced: boolean,
  sourceHash: string,
  storedCorpusHash: string | undefined,
  storedResourcesHash: string | undefined,
  hasResources: boolean,
): boolean {
  return (
    forced || storedCorpusHash !== sourceHash || storedResourcesHash !== sourceHash || !hasResources
  );
}

export function isCatalogueCurrent(
  sourceHash: string,
  storedCorpusHash: string | undefined,
  storedResourcesHash: string | undefined,
  hasResources: boolean,
): boolean {
  return storedCorpusHash === sourceHash && storedResourcesHash === sourceHash && hasResources;
}

function renderEnvKeys(): string[] {
  const keys = new Set(hashEnvKeys);

  for (const key of Object.keys(process.env)) {
    if (key.startsWith("PUBLIC_PREVIEW_")) keys.add(key);
  }

  return [...keys].sort();
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith("."))
      .map((entry) => {
        const path = join(dir, entry.name);

        return entry.isDirectory() ? walkFiles(path) : Promise.resolve([path]);
      }),
  );

  return nested.flat();
}

async function hashInputs(): Promise<string> {
  const hash = createHash("sha256");
  const walked = (
    await Promise.all(["src", "scripts"].map((dir) => walkFiles(join(root, dir))))
  ).flat();
  const files = [...new Set([...walked, ...hashFileCandidates.map((file) => join(root, file))])]
    .filter((path) => path !== output && path !== resourcesOutput)
    .sort();

  for (const path of files) {
    hash.update(relative(root, path));
    hash.update("\0");

    try {
      hash.update(await readFile(path));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;

      hash.update("\0missing");
    }

    hash.update("\0");
  }

  for (const key of renderEnvKeys()) {
    hash.update(key);
    hash.update("\0");
    hash.update(process.env[key] ?? "\0missing");
    hash.update("\0");
  }

  return hash.digest("hex");
}

async function readStoredHash(path: string): Promise<string | undefined> {
  try {
    const stored = JSON.parse(await readFile(path, "utf8")) as { sourceHash?: unknown };

    return typeof stored.sourceHash === "string" ? stored.sourceHash : undefined;
  } catch {
    return undefined;
  }
}

async function hasResourceCatalogue(): Promise<boolean> {
  try {
    const stored = JSON.parse(await readFile(resourcesOutput, "utf8")) as {
      resources?: unknown;
    };

    return Array.isArray(stored.resources);
  } catch {
    return false;
  }
}

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
): Promise<CorpusPage> {
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

function normaliseTarget(target: string): string {
  const pathname = new URL(target, "https://ask-corpus.invalid").pathname.replace(/\/+$/, "");

  return pathname === "" ? "/" : pathname;
}

function tagBlock(tags: Record<string, AskTag>): string {
  const items = Object.entries(tags)
    .sort(([first], [second]) => (first < second ? -1 : first > second ? 1 : 0))
    .map(([key, tag]) => {
      const keywords = tag.keywords.length > 0 ? ` — Keywords: ${tag.keywords.join(", ")}` : "";

      return `- ${key} — ${tag.short}${keywords}`;
    });

  return `\n\n## Invisible tags\n\n${items.join("\n")}\n`;
}

export function applyAskTags(pages: CorpusPage[], tags: AskTagFile | undefined): CorpusPage[] {
  if (!tags) return pages;

  const byPath = new Map(
    Object.entries(tags)
      .filter(([, items]) => Object.keys(items).length > 0)
      .map(([target, items]) => [normaliseTarget(target), items]),
  );

  return pages.map((page) => {
    const items = byPath.get(normaliseTarget(page.url));
    if (!items) return page;

    return { ...page, content: `${page.content}${tagBlock(items)}` };
  });
}

async function loadAskTags(): Promise<AskTagFile | undefined> {
  try {
    return JSON.parse(await readFile(tagsFile, "utf8")) as AskTagFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;

    throw error;
  }
}

async function loadCatalogueMetadata(origin: string): Promise<McpResource[]> {
  const response = await fetch(new URL("/mcp-catalogue.json", origin), {
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) throw new Error("Could not read the MCP catalogue metadata");

  const payload = (await response.json()) as { resources?: unknown };

  if (!Array.isArray(payload.resources)) {
    throw new Error("The MCP catalogue metadata had no resources");
  }

  return payload.resources as McpResource[];
}

function resourceHeaders(uri: string): Record<string, string> {
  return new URL(uri).pathname.endsWith("/llms.txt") ? {} : { Accept: "text/markdown" };
}

async function loadResourceBody(resource: McpResource, origin: string): Promise<string> {
  const localUrl = new URL(new URL(resource.uri).pathname, origin);
  const response = await fetch(localUrl, {
    headers: resourceHeaders(resource.uri),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) throw new Error(`Could not read the MCP resource ${resource.uri}`);

  return response.text();
}

async function loadResourceCatalogue(
  sourceHash: string,
  origin: string,
  pages: CorpusPage[],
): Promise<ResourceCatalogue> {
  const resources = await loadCatalogueMetadata(origin);
  const bodies = new Map(pages.map((page) => [page.url, page.content]));

  await Promise.all(
    resources
      .filter((resource) => !bodies.has(resource.uri))
      .map(async (resource) => {
        bodies.set(resource.uri, await loadResourceBody(resource, origin));
      }),
  );

  return assembleResourceCatalogue(sourceHash, resources, bodies);
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

async function main(): Promise<void> {
  const forced = process.argv.includes("--force") || process.env.ASK_CORPUS_FORCE === "1";
  const check = process.argv.includes("--check");
  const sourceHash = await hashInputs();

  if (check) {
    const current = isCatalogueCurrent(
      sourceHash,
      await readStoredHash(output),
      await readStoredHash(resourcesOutput),
      await hasResourceCatalogue(),
    );

    if (!current) {
      console.error(
        "Generated Ask corpus and MCP catalogue are stale; run `node scripts/generate-ask-corpus.mts` and commit the result.",
      );
      process.exitCode = 1;
      return;
    }

    console.log("Ask corpus and MCP catalogue are up to date.");
    return;
  }

  if (
    !shouldRegenerate(
      forced,
      sourceHash,
      await readStoredHash(output),
      await readStoredHash(resourcesOutput),
      await hasResourceCatalogue(),
    )
  ) {
    console.log("Ask corpus is up to date; skipping generation.");
    return;
  }

  const port = await availablePort();
  const origin = `http://${host}:${port}`;
  const server = spawn(
    process.execPath,
    [astro, "dev", "--host", host, "--port", String(port), "--strictPort", "--ignore-lock"],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
  );

  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);

  try {
    const sitemap = await loadSitemap(server, new URL("/sitemap.xml", origin));
    const locations =
      sitemap.match(/<loc>[^<]+<\/loc>/g)?.map((location) => decodeXml(location.slice(5, -6))) ??
      [];
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
    const tagged = applyAskTags(pages, await loadAskTags());

    await writeFile(output, `${JSON.stringify({ sourceHash, pages: tagged }, null, 2)}\n`);
    console.log(`Generated Ask corpus with ${tagged.length} published pages.`);

    const catalogue = await loadResourceCatalogue(sourceHash, origin, tagged);
    await writeFile(resourcesOutput, `${JSON.stringify(catalogue, null, 2)}\n`);
    console.log(`Generated MCP catalogue with ${catalogue.resources.length} resources.`);
  } finally {
    await stopServer(server);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
