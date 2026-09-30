export type AskSource = { title: string; url: string };

export type AskAnswer =
  | { kind: "answer"; text: string; sources: AskSource[] }
  | { kind: "refusal"; text: string };

const REFUSAL_TEXT =
  "I can only answer from what's published on this site, and that isn't covered. Try asking about my work or my writing.";

const THROTTLED_TEXT = "That's a lot of questions at once. Give it a minute and try again.";

type Item = { "@type"?: string; text?: string; name?: string; url?: string };

type Document = { results?: Item[]; error?: { code?: string } };

export async function askSite(question: string, signal: AbortSignal): Promise<AskAnswer> {
  const response = await fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: { text: question }, prefer: { mode: "summarize" } }),
    signal,
  });

  if (response.status === 429) return { kind: "refusal", text: THROTTLED_TEXT };

  if (!response.ok) throw new Error(`Ask failed with ${response.status}`);

  const document = (await response.json()) as Document;

  if (document.error) {
    if (document.error.code === "NO_RESULTS") return { kind: "refusal", text: REFUSAL_TEXT };

    throw new Error(`Ask failed with ${document.error.code ?? "an error"}`);
  }

  const items = document.results ?? [];

  return {
    kind: "answer",
    text: items.find((item) => item["@type"] === "SearchSummary")?.text ?? "",
    sources: items.flatMap((item) =>
      item["@type"] === "WebPage" && item.url
        ? [{ title: item.name ?? item.url, url: item.url }]
        : [],
    ),
  };
}
