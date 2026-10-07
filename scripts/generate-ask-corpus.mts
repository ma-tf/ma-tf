import type { McpResource } from "@features/mcp/catalogue";

import {
  askTagsPath,
  buildCorpus,
  catalogueOutputPath,
  corpusOutputPath,
  corpusSourceHash,
  corpusStatus,
  type AskTagFile,
  type CorpusPage,
} from "@features/ask/corpus";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { startDevServer } from "@/scripts/dev-server.mts";

async function readStoredHash(path: string): Promise<string | undefined> {
  try {
    const stored = JSON.parse(await readFile(path, "utf8")) as { sourceHash?: unknown };

    return typeof stored.sourceHash === "string" ? stored.sourceHash : undefined;
  } catch {
    return undefined;
  }
}

export async function hasResourceCatalogue(path = catalogueOutputPath): Promise<boolean> {
  try {
    const stored = JSON.parse(await readFile(path, "utf8")) as {
      resources?: unknown;
    };

    return Array.isArray(stored.resources) && stored.resources.length > 0;
  } catch {
    return false;
  }
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

async function loadAskTags(): Promise<AskTagFile | undefined> {
  try {
    return JSON.parse(await readFile(askTagsPath, "utf8")) as AskTagFile;
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

async function loadResourceBody(uri: string, origin: string): Promise<string> {
  const localUrl = new URL(new URL(uri).pathname, origin);
  const response = await fetch(localUrl, {
    headers: resourceHeaders(uri),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) throw new Error(`Could not read the MCP resource ${uri}`);

  return response.text();
}

async function main(): Promise<void> {
  const forced = process.argv.includes("--force") || process.env.ASK_CORPUS_FORCE === "1";
  const check = process.argv.includes("--check");
  const sourceHash = await corpusSourceHash();
  const stored = {
    corpusHash: await readStoredHash(corpusOutputPath),
    resourcesHash: await readStoredHash(catalogueOutputPath),
    hasResources: await hasResourceCatalogue(),
  };

  if (check) {
    if (corpusStatus(sourceHash, stored).state !== "current") {
      console.error(
        "Generated Ask corpus and MCP catalogue are stale; run `vp run generate:ask-corpus` and commit the result.",
      );
      process.exitCode = 1;
      return;
    }

    console.log("Ask corpus and MCP catalogue are up to date.");
    return;
  }

  if (!forced && corpusStatus(sourceHash, stored).state === "current") {
    console.log("Ask corpus is up to date; skipping generation.");
    return;
  }

  const server = await startDevServer();

  try {
    const locations =
      (await server.sitemap())
        .match(/<loc>[^<]+<\/loc>/g)
        ?.map((location) => decodeXml(location.slice(5, -6))) ?? [];
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
    const pages = await Promise.all(
      paths.map((path) => loadPage(path, server.origin, canonicalOrigin)),
    );
    const result = await buildCorpus({
      pages,
      resources: await loadCatalogueMetadata(server.origin),
      tags: await loadAskTags(),
      sourceHash,
      fetchBody: (uri) => loadResourceBody(uri, server.origin),
    });

    await writeFile(corpusOutputPath, `${JSON.stringify(result.corpus, null, 2)}\n`);
    console.log(`Generated Ask corpus with ${result.corpus.pages.length} published pages.`);

    await writeFile(catalogueOutputPath, `${JSON.stringify(result.catalogue, null, 2)}\n`);
    console.log(`Generated MCP catalogue with ${result.catalogue.resources.length} resources.`);
  } finally {
    await server.stop();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
