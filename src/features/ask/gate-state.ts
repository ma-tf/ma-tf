import type { PublishedPage } from "@features/ask/published-page";

export type GatePage = { url: string; title: string; excerpt: string };

export type GateState = { visitor_question: string; published_pages: GatePage[] };

const stateBudget = 48000;

const frontmatter = /^---\n([\s\S]*?)\n---\n?/;

const linkOrImage = /!?\[[^\][]*\]\([^()]*\)/g;

function isChrome(line: string): boolean {
  let stripped = line;

  for (let previous = ""; stripped !== previous;) {
    previous = stripped;
    stripped = stripped.replace(linkOrImage, "");
  }

  return stripped.trim() === "";
}

const tagMarker = "\n## Invisible tags\n";

function frontmatterField(block: string, name: string): string | undefined {
  const match = block.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
  const value = match?.[1];
  if (!value) return undefined;

  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed === "string") return parsed.trim();
  } catch {
    return value.trim();
  }

  return undefined;
}

function description(content: string): string | undefined {
  const block = content.match(frontmatter)?.[1];

  return block ? frontmatterField(block, "description") : undefined;
}

function tags(content: string): string | undefined {
  const at = content.indexOf(tagMarker);

  return at === -1 ? undefined : content.slice(at + 1).trim();
}

function stripChrome(content: string): string {
  const lines = content.replace(frontmatter, "").split("\n");
  let start = 0;

  while (start < lines.length) {
    const line = lines[start]!.trim();

    if (line !== "" && !isChrome(line)) break;

    start += 1;
  }

  return lines.slice(start).join("\n").trim();
}

function clip(text: string, budget: number): string {
  if (text.length <= budget) return text;

  const cut = text.slice(0, budget);
  const boundary = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(" "));

  return `${cut.slice(0, boundary > 0 ? boundary : budget).trimEnd()}…`;
}

export function pageExcerpt(page: PublishedPage, budget: number): string {
  const lead = [description(page.content), stripChrome(page.content)]
    .filter((part): part is string => Boolean(part))
    .join("\n\n");
  const tagBlock = tags(page.content);

  if (!tagBlock) return clip(lead, budget);

  const room = Math.max(budget - tagBlock.length - 2, 0);

  return `${clip(lead, room)}\n\n${tagBlock}`;
}

export function buildGateState(question: string, pages: PublishedPage[]): GateState {
  const budget = Math.floor(stateBudget / Math.max(pages.length, 1));

  return {
    visitor_question: question,
    published_pages: pages.map((page) => ({
      url: page.url,
      title: page.title,
      excerpt: pageExcerpt(page, budget),
    })),
  };
}
