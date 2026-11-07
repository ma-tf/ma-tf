import type { IncomingMessage, ServerResponse } from "node:http";

import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { ParsedArgs } from "@/scripts/argv.mts";

import {
  formatHelp,
  parseArgs,
  parseNumericFlag,
  printHelpAndExit,
  readValue,
} from "@/scripts/argv.mts";

const root = fileURLToPath(new URL("../", import.meta.url));
const distDir = join(root, "dist");
const serverEntry = join(root, ".netlify", "build", "entry.mjs");

const OPTIONS = [
  { name: "--port", placeholder: "<port>", description: "Port to listen on (default 4321)" },
  { name: "--host", placeholder: "<host>", description: "Host to listen on (default 127.0.0.1)" },
];

const HELP = formatHelp(
  "node --import ./scripts/alias-loader.mjs scripts/preview-server.mts [--port=<port>] [--host=<host>]",
  OPTIONS,
);

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

for (const [name, value] of Object.entries({
  TYPESAFE_API_KEY: "render-only",
  OPENAI_API_KEY: "render-only",
})) {
  process.env[name] ??= value;
}

function isBareOptionFlag(arg: string): boolean {
  return arg === "--port" || arg === "--host";
}

function combinedOption(arg: string, next: string | undefined): string | null {
  if (!isBareOptionFlag(arg)) return null;
  if (next === undefined) return null;
  return `${arg}=${next}`;
}

function normalizeArgv(argv: string[]): string[] {
  const normalized: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === undefined) continue;
    const combined = combinedOption(arg, argv[index + 1]);
    if (combined !== null) {
      normalized.push(combined);
      index += 1;
      continue;
    }
    normalized.push(arg);
  }
  return normalized;
}

function resolvePreviewPort(args: ParsedArgs): number {
  return parseNumericFlag(readValue(args, "--port") ?? process.env.PORT, "--port", {
    fallback: 4321,
    minimum: 1,
    whole: true,
  });
}

function resolvePreviewHost(args: ParsedArgs): string {
  return readValue(args, "--host") ?? process.env.HOST ?? "127.0.0.1";
}

function parseOptions(argv: string[]): { port: number; host: string } {
  if (argv.includes("--help")) printHelpAndExit(HELP);
  const args = parseArgs(normalizeArgv(argv), OPTIONS, HELP);
  if (args.positionals.length > 0)
    throw new Error(`Unexpected argument ${args.positionals[0]}\n\n${HELP}`);
  return { port: resolvePreviewPort(args), host: resolvePreviewHost(args) };
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function contentType(path: string): string {
  return CONTENT_TYPES[extname(path).toLowerCase()] ?? "application/octet-stream";
}

function isUnsafeRelative(relative: string): boolean {
  return relative === "" || relative.startsWith("..") || relative.includes(`..${sep}`);
}

async function serveStatic(pathname: string, res: ServerResponse): Promise<boolean> {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  if (isUnsafeRelative(relative)) return false;
  const file = join(distDir, relative);
  if (!file.startsWith(distDir)) return false;
  if (!(await isFile(file))) return false;
  const body = await readFile(file);
  res.writeHead(200, { "content-type": contentType(file), "content-length": body.length });
  res.end(body);
  return true;
}

function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  if (req.method === "GET" || req.method === "HEAD" || req.method === undefined)
    return Promise.resolve(undefined);
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(chunks.length > 0 ? Buffer.concat(chunks) : undefined));
    req.on("error", reject);
  });
}

function appendHeaderValue(headers: Headers, name: string, value: string | string[]): void {
  if (Array.isArray(value)) {
    for (const entry of value) headers.append(name, entry);
    return;
  }
  headers.set(name, value);
}

function nodeHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    appendHeaderValue(headers, name, value);
  }
  return headers;
}

function previewUrl(req: IncomingMessage, host: string, port: number): URL {
  return new URL(req.url ?? "/", `http://${host}:${port}`);
}

function previewClientIp(req: IncomingMessage): string {
  return req.socket.remoteAddress ?? "127.0.0.1";
}

function previewRequestInit(req: IncomingMessage, body: Buffer | undefined): RequestInit {
  const init: RequestInit = {
    method: req.method ?? "GET",
    headers: nodeHeaders(req),
  };
  if (body !== undefined) init.body = new Uint8Array(body);
  return init;
}

function logPreview(status: number, pathname: string, started: number): void {
  console.log(`[${status}] ${pathname} ${Date.now() - started}ms`);
}

async function writePreviewResponse(
  res: ServerResponse,
  response: Response,
  pathname: string,
  started: number,
): Promise<void> {
  const payload = Buffer.from(await response.arrayBuffer());
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  res.writeHead(response.status, headers);
  res.end(payload);
  logPreview(response.status, pathname, started);
}

async function main(): Promise<void> {
  const { port, host } = parseOptions(process.argv.slice(2));

  if (!(await isFile(serverEntry))) {
    throw new Error(
      `Production server entry not found at ${serverEntry}. Run \`vp run build\` first.`,
    );
  }

  const { createHandler } = (await import(pathToFileURL(serverEntry).href)) as {
    createHandler: (options: {
      notFoundContent?: string;
    }) => (request: Request, context: { ip: string }) => Promise<Response>;
  };

  let notFoundContent: string | undefined;
  try {
    notFoundContent = await readFile(join(distDir, "404.html"), "utf8");
  } catch {
    notFoundContent = undefined;
  }

  const handler =
    notFoundContent === undefined ? createHandler({}) : createHandler({ notFoundContent });

  const server = createServer(async (req, res) => {
    const started = Date.now();
    try {
      const url = previewUrl(req, host, port);
      if (await serveStatic(url.pathname, res)) {
        logPreview(res.statusCode, url.pathname, started);
        return;
      }

      const body = await readBody(req);
      const request = new Request(url.href, previewRequestInit(req, body));

      const response = await handler(request, { ip: previewClientIp(req) });
      await writePreviewResponse(res, response, url.pathname, started);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Preview server error");
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        reject(
          new Error(
            `Port ${port} is already in use. Stop the server there or rerun with --port=<port>.`,
          ),
        );
        return;
      }
      reject(error);
    });
    server.listen(port, host, () => {
      console.log(`Preview server running at http://${host}:${port}`);
      resolve();
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
