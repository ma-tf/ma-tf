import { appendVaryValue } from "@features/discovery/negotiation";
import TurndownService from "turndown";

const turndown = new TurndownService();

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
