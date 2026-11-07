import { askSite } from "@features/faq/ask-site";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

function stubFetch(document: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(document), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

function stubLocation(pathname: string) {
  vi.stubGlobal("window", { location: { pathname, origin: "https://m4t.tf" } });
}

function answerDocument() {
  return {
    results: [
      { text: "Matt builds software." },
      { name: "About", url: "https://m4t.tf/about" },
      { name: "CV", url: "https://m4t.tf/cv" },
    ],
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("askSite current-page filter", () => {
  it("drops the source matching the current pathname and keeps the rest", async () => {
    stubLocation("/about");
    stubFetch(answerDocument());

    const result = await askSite("Who is Matt?", new AbortController().signal);

    expect(result).toEqual({
      kind: "answer",
      text: "Matt builds software.",
      sources: [{ title: "CV", url: "https://m4t.tf/cv" }],
    });
  });

  it("matches with or without a trailing slash", async () => {
    stubLocation("/about/");
    stubFetch(answerDocument());

    const result = await askSite("Who is Matt?", new AbortController().signal);

    expect(result).toEqual({
      kind: "answer",
      text: "Matt builds software.",
      sources: [{ title: "CV", url: "https://m4t.tf/cv" }],
    });
  });

  it("keeps every source when there is no window", async () => {
    stubFetch(answerDocument());

    const result = await askSite("Who is Matt?", new AbortController().signal);

    expect(result).toEqual({
      kind: "answer",
      text: "Matt builds software.",
      sources: [
        { title: "About", url: "https://m4t.tf/about" },
        { title: "CV", url: "https://m4t.tf/cv" },
      ],
    });
  });

  it("keeps sources with unparseable urls", async () => {
    stubLocation("/about");
    stubFetch({
      results: [{ text: "Matt builds software." }, { name: "Odd", url: "https://" }],
    });

    const result = await askSite("Who is Matt?", new AbortController().signal);

    expect(result).toEqual({
      kind: "answer",
      text: "Matt builds software.",
      sources: [{ title: "Odd", url: "https://" }],
    });
  });

  it("leaves refusals untouched", async () => {
    stubLocation("/about");
    stubFetch({ error: { code: "NO_RESULTS" } });

    const result = await askSite("Who is Matt?", new AbortController().signal);

    expect(result.kind).toBe("refusal");
  });
});
