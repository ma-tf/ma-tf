import { htmlToMarkdown } from "@features/discovery/html-markdown";
import { appendVaryValue } from "@features/discovery/negotiation";

export async function formatMarkdownResponse(
  response: Response,
  shouldVaryByAccept: boolean,
): Promise<Response> {
  if (!response.headers.get("Content-Type")?.startsWith("text/html")) return response;

  const headers = new Headers(response.headers);
  if (shouldVaryByAccept) appendVaryValue(headers, "Accept");

  const markdown = await htmlToMarkdown(await response.text());
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
