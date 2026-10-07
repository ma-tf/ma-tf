import type { AskTag, AskTagFile, CorpusPage } from "@features/ask/corpus/types";

function normaliseTarget(target: string): string {
  const pathname = new URL(target, "https://ask-corpus.invalid").pathname.replace(/\/+$/, "");

  return pathname === "" ? "/" : pathname;
}

function tagBlock(tags: Record<string, AskTag>): string {
  const items = Object.entries(tags)
    .sort(([first], [second]) => (first < second ? -1 : first > second ? 1 : 0))
    .map(([key, tag]) => {
      const keywords = tag.keywords.length > 0 ? ` — Keywords: ${tag.keywords.join(", ")}` : "";

      return `- ${key} — ${tag.short}${keywords}`;
    });

  return `\n\n## Invisible tags\n\n${items.join("\n")}\n`;
}

export function applyAskTags(pages: CorpusPage[], tags: AskTagFile | undefined): CorpusPage[] {
  if (!tags) return pages;

  const byPath = new Map(
    Object.entries(tags)
      .filter(([, items]) => Object.keys(items).length > 0)
      .map(([target, items]) => [normaliseTarget(target), items]),
  );

  return pages.map((page) => {
    const items = byPath.get(normaliseTarget(page.url));
    if (!items) return page;

    return { ...page, content: `${page.content}${tagBlock(items)}` };
  });
}
