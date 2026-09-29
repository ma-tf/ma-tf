import type { AskPageJudgment, PublishedPage } from "@features/ask/published-page";

import { answerAsk } from "@features/ask/answer";
import pages from "@features/ask/published-pages.generated.json";
import { judgeAskPages } from "@features/ask/typesafe-ai";

export type AskAnswer = { sources: PublishedPage[]; summary?: string };

export type AskResult = { page: PublishedPage } | { summary: string };

export type AskStep = { results: AskResult[] } | { error: "NO_RESULTS" };

function rankSources(judgment: AskPageJudgment) {
  return judgment.pageRelevance
    .filter(({ probability }) => probability > 0.5)
    .sort((a, b) => b.probability - a.probability)
    .map(({ page }) => page);
}

export async function ask(
  question: string,
  summarize: boolean,
  signal: AbortSignal,
): Promise<AskAnswer | null> {
  const judgment = await judgeAskPages(question, pages, signal);
  const sources = rankSources(judgment);

  if (sources.length === 0 || (summarize && judgment.answerability <= 0.5)) return null;
  if (!summarize) return { sources };

  return { sources, summary: await answerAsk(question, sources, signal) };
}

export function streamAsk(
  question: string,
  summarize: boolean,
  signal: AbortSignal,
): readonly Promise<AskStep>[] {
  const prepared = judgeAskPages(question, pages, signal).then((judgment) => {
    const sources = rankSources(judgment);

    return {
      sources,
      supported: sources.length > 0 && (!summarize || judgment.answerability > 0.5),
    };
  });

  const pageWork: Promise<AskStep> = prepared.then(({ sources, supported }) =>
    supported ? { results: sources.map((page): AskResult => ({ page })) } : { error: "NO_RESULTS" },
  );

  const answerWork: Promise<AskStep> = prepared.then(async ({ sources, supported }) =>
    supported
      ? { results: [{ summary: await answerAsk(question, sources, signal) }] }
      : { results: [] },
  );

  return summarize ? [pageWork, answerWork] : [pageWork];
}
