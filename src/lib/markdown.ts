import TurndownService from "turndown";

const turndown = new TurndownService();

type Representation =
  | { kind: "html" }
  | { kind: "markdown"; source: "suffix"; target: URL }
  | { kind: "markdown"; source: "accept" };

function getAcceptedQuality(value: string, mediaType: string): number {
  const candidate = value
    .split(",")
    .map((item) => item.trim())
    .find((item) => item.split(";", 1)[0]?.trim().toLowerCase() === mediaType);

  if (!candidate) return 0;

  const qualityMatch = candidate.match(/(?:^|;)\s*q\s*=\s*([^;]+)/i);
  const quality = Number.parseFloat(qualityMatch ? qualityMatch[1]! : "1");
  if (!Number.isFinite(quality)) return 0;

  return Math.min(Math.max(quality, 0), 1);
}

function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  const markdownQuality = getAcceptedQuality(accept, "text/markdown");
  const htmlQuality = getAcceptedQuality(accept, "text/html");

  return markdownQuality > 0 && markdownQuality >= htmlQuality;
}

export function selectRepresentation(url: URL, accept: string | null): Representation {
  if (url.pathname.endsWith(".md")) {
    return { kind: "markdown", source: "suffix", target: getMarkdownTarget(url) };
  }

  if (prefersMarkdown(accept)) return { kind: "markdown", source: "accept" };

  return { kind: "html" };
}

function getMarkdownTarget(url: URL): URL {
  const target = new URL(url);
  target.pathname =
    target.pathname === "/index.md" ? "/" : target.pathname.slice(0, -".md".length) || "/";

  return target;
}

function appendVaryValue(headers: Headers, value: string): void {
  const values = (headers.get("Vary") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!values.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
    values.push(value);
  }

  headers.set("Vary", values.join(", "));
}

function getMarkdownSource(html: string): string {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;

  return body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}

export async function formatMarkdownResponse(
  response: Response,
  shouldVaryByAccept: boolean,
): Promise<Response> {
  if (!response.headers.get("Content-Type")?.startsWith("text/html")) return response;

  const headers = new Headers(response.headers);
  if (shouldVaryByAccept) appendVaryValue(headers, "Accept");

  const markdown = turndown.turndown(getMarkdownSource(await response.text()));
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.delete("Content-Encoding");
  headers.delete("Content-Length");
  headers.delete("ETag");

  return new Response(markdown, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}
