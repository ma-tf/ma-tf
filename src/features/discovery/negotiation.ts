export type Representation =
  | { kind: "html" }
  | { kind: "markdown-suffix"; target: URL }
  | { kind: "markdown-accept" };

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

export function prefersJson(accept: string | null): boolean {
  if (!accept) return false;

  const jsonQuality = getAcceptedQuality(accept, "application/json");
  const htmlQuality = getAcceptedQuality(accept, "text/html");

  return jsonQuality > 0 && jsonQuality >= htmlQuality;
}

function getMarkdownTarget(url: URL): URL {
  const target = new URL(url);
  target.pathname =
    target.pathname === "/index.md" ? "/" : target.pathname.slice(0, -".md".length) || "/";

  return target;
}

export function selectRepresentation(url: URL, accept: string | null): Representation {
  if (url.pathname.endsWith(".md")) {
    return { kind: "markdown-suffix", target: getMarkdownTarget(url) };
  }

  if (prefersMarkdown(accept)) return { kind: "markdown-accept" };

  return { kind: "html" };
}

export function appendVaryValue(headers: Headers, value: string): void {
  const values = (headers.get("Vary") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!values.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
    values.push(value);
  }

  headers.set("Vary", values.join(", "));
}
