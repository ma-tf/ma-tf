import type { AskPageJudgment, PublishedPage } from "@features/ask/published-page";

import { answerAsk } from "@features/ask/answer";
import corpus from "@features/ask/published-pages.generated.json";
import { judgeAskPages } from "@features/ask/typesafe-ai";
import { siteUrl } from "@features/discovery/catalog";

export type AskAnswer = { sources: PublishedPage[]; summary?: string };

export type AskResult = { page: PublishedPage } | { summary: string };

export type AskStep = { results: AskResult[] } | { error: "NO_RESULTS" };

const relevanceFloor = 0.85;
const answerabilityFloor = 0.85;

const sourceBlacklist = [`${siteUrl}/`];

type AskSelection = { supported: true; sources: PublishedPage[] } | { supported: false };

function rankSources(judgment: AskPageJudgment, summarize: boolean): AskSelection {
  const ranked = judgment.pageRelevance
    .filter(({ page }) => !sourceBlacklist.includes(page.url))
    .filter(({ probability }) => probability > relevanceFloor)
    .sort((a, b) => b.probability - a.probability);

  const sources = ranked.map(({ page }) => page);

  if (sources.length === 0 || (summarize && judgment.answerability <= answerabilityFloor)) {
    return { supported: false };
  }

  return { supported: true, sources };
}

export async function ask(
  question: string,
  summarize: boolean,
  signal: AbortSignal,
): Promise<AskAnswer | null> {
  const judgment = await judgeAskPages(question, corpus.pages, signal);
  const selection = rankSources(judgment, summarize);

  if (!selection.supported) return null;
  if (!summarize) return { sources: selection.sources };

  return {
    sources: selection.sources,
    summary: await answerAsk(question, selection.sources, signal),
  };
}

export function streamAsk(
  question: string,
  summarize: boolean,
  signal: AbortSignal,
): readonly Promise<AskStep>[] {
  const prepared = judgeAskPages(question, corpus.pages, signal).then((judgment) =>
    rankSources(judgment, summarize),
  );

  const pageWork: Promise<AskStep> = prepared.then((selection) =>
    selection.supported
      ? { results: selection.sources.map((page): AskResult => ({ page })) }
      : { error: "NO_RESULTS" },
  );

  const answerWork: Promise<AskStep> = prepared.then(async (selection) =>
    selection.supported
      ? { results: [{ summary: await answerAsk(question, selection.sources, signal) }] }
      : { results: [] },
  );

  return summarize ? [pageWork, answerWork] : [pageWork];
}
