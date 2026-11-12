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

export async function htmlToMarkdown(html: string): Promise<string> {
  const { default: TurndownService } = await import("turndown");

  return frontmatter(html) + new TurndownService().turndown(getMarkdownSource(html));
}
