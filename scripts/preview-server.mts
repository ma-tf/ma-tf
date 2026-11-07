import type { IncomingMessage, ServerResponse } from "node:http";

import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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

function normalizeArgv(argv: string[]): string[] {
  const normalized: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === undefined) continue;
    if ((arg === "--port" || arg === "--host") && index + 1 < argv.length) {
      const next = argv[index + 1];
      if (next !== undefined) {
        normalized.push(`${arg}=${next}`);
        index += 1;
        continue;
      }
    }
    normalized.push(arg);
  }
  return normalized;
}

function parseOptions(argv: string[]): { port: number; host: string } {
  if (argv.includes("--help")) printHelpAndExit(HELP);
  const args = parseArgs(normalizeArgv(argv), OPTIONS, HELP);
  if (args.positionals.length > 0)
    throw new Error(`Unexpected argument ${args.positionals[0]}\n\n${HELP}`);
  const port = parseNumericFlag(readValue(args, "--port") ?? process.env.PORT, "--port", {
    fallback: 4321,
    minimum: 1,
    whole: true,
  });
  const host = readValue(args, "--host") ?? process.env.HOST ?? "127.0.0.1";
  return { port, host };
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

async function serveStatic(pathname: string, res: ServerResponse): Promise<boolean> {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  if (relative === "" || relative.startsWith("..") || relative.includes(`..${sep}`)) return false;
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

function nodeHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const entry of value) headers.append(name, entry);
    } else {
      headers.set(name, value);
    }
  }
  return headers;
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
      const url = new URL(req.url ?? "/", `http://${host}:${port}`);
      if (await serveStatic(url.pathname, res)) {
        console.log(`[${res.statusCode}] ${url.pathname} ${Date.now() - started}ms`);
        return;
      }

      const body = await readBody(req);
      const init: RequestInit = {
        method: req.method ?? "GET",
        headers: nodeHeaders(req),
      };
      if (body !== undefined) init.body = new Uint8Array(body);
      const request = new Request(url.href, init);

      const response = await handler(request, { ip: req.socket.remoteAddress ?? "127.0.0.1" });
      const payload = Buffer.from(await response.arrayBuffer());
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      res.writeHead(response.status, headers);
      res.end(payload);
      console.log(`[${response.status}] ${url.pathname} ${Date.now() - started}ms`);
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
