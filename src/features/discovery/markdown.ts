import { appendVaryValue } from "@features/discovery/negotiation";
import TurndownService from "turndown";

const turndown = new TurndownService();

function getMarkdownSource(html: string): string {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;

  return body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}

function headField(html: string, pattern: RegExp): string | undefined {
  return html.match(pattern)?.[1]?.trim() || undefined;
}

function frontmatter(html: string): string {
  const title = headField(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title) return "";

  const fields = [`title: ${JSON.stringify(title)}`];
  const description = headField(html, /<meta[^>]*\bname="description"[^>]*\bcontent="([^"]*)"/i);
  if (description) fields.push(`description: ${JSON.stringify(description)}`);
  const canonical = headField(html, /<link[^>]*\brel="canonical"[^>]*\bhref="([^"]*)"/i);
  if (canonical) fields.push(`canonical: ${canonical}`);

  return `---\n${fields.join("\n")}\n---\n\n`;
}

export async function formatMarkdownResponse(
  response: Response,
  shouldVaryByAccept: boolean,
): Promise<Response> {
  if (!response.headers.get("Content-Type")?.startsWith("text/html")) return response;

  const headers = new Headers(response.headers);
  if (shouldVaryByAccept) appendVaryValue(headers, "Accept");

  const html = await response.text();
  const markdown = frontmatter(html) + turndown.turndown(getMarkdownSource(html));
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
