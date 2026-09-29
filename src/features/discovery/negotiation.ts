import type { DiscoveryResource } from "@features/discovery/catalog";

import { isJsonMediaType, resourceByPath } from "@features/discovery/catalog";
import { acceptsMediaType, getAcceptedQuality } from "@lib/accept";

export type Representation =
  | { kind: "html" }
  | { kind: "json-document" }
  | { kind: "json-descriptor"; resource: DiscoveryResource }
  | { kind: "markdown-suffix"; target: URL }
  | { kind: "markdown-accept" };

export function prefersMarkdown(accept: string | null): boolean {
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

const representableTypes = ["text/html", "text/markdown", "application/json"] as const;

export function acceptsSupportedRepresentation(accept: string | null): boolean {
  return representableTypes.some((mediaType) => acceptsMediaType(accept, mediaType));
}

export function prefersHtml(accept: string | null): boolean {
  return acceptsMediaType(accept, "text/html", { explicitOnly: true });
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

  const resource = resourceByPath(url.pathname);
  if (resource && prefersJson(accept)) {
    return isJsonMediaType(resource.type)
      ? { kind: "json-document" }
      : { kind: "json-descriptor", resource };
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
