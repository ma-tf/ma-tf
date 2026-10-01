export type AskSource = { title: string; url: string };

export type AskAnswer =
  | { kind: "answer"; text: string; sources: AskSource[] }
  | { kind: "refusal"; text: string };

const REFUSAL_TEXT =
  "I can only answer from what's published on this site, and that isn't covered. Try asking about my work or my writing.";

const THROTTLED_TEXT = "That's a lot of questions at once. Give it a minute and try again.";

type Document =
  | { results: [{ text: string }, ...{ name: string; url: string }[]] }
  | { error: { code: string } };

type DocumentPayload =
  | { refusal: string }
  | { summary: string; pages: { name: string; url: string }[] };

function parseDocument(document: Document): DocumentPayload {
  if ("error" in document) {
    if (document.error.code === "NO_RESULTS") return { refusal: REFUSAL_TEXT };

    throw new Error(`Ask failed with ${document.error.code}`);
  }

  const [summary, ...pages] = document.results;

  return { summary: summary.text, pages };
}

export async function askSite(question: string, signal: AbortSignal): Promise<AskAnswer> {
  const response = await fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: { text: question }, prefer: { mode: "summarize" } }),
    signal,
  });

  if (response.status === 429) return { kind: "refusal", text: THROTTLED_TEXT };

  if (!response.ok) throw new Error(`Ask failed with ${response.status}`);

  const payload = parseDocument((await response.json()) as Document);

  if ("refusal" in payload) return { kind: "refusal", text: payload.refusal };

  return {
    kind: "answer",
    text: payload.summary,
    sources: payload.pages.map(({ name, url }) => ({ title: name, url })),
  };
}
