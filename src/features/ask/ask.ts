import type { AskPageJudgment } from "@features/ask/published-page";
import type { NLWebAskRequest } from "@features/ask/request";
import type { NLWebAskResponse, NLWebAskStreamEvent } from "@features/ask/response";

import { answerAsk } from "@features/ask/answer";
import pages from "@features/ask/published-pages.generated.json";
import { answerResponse, noResultsResponse } from "@features/ask/response";
import { runStream, type StreamStep } from "@features/ask/run-stream";
import { judgeAskPages } from "@features/ask/typesafe-ai";

function selectAskSources(judgment: AskPageJudgment) {
  if (judgment.answerability <= 0.5) return [];

  return judgment.pageRelevance
    .filter(({ probability }) => probability > 0.5)
    .map(({ page }) => page);
}

export async function ask(
  request: NLWebAskRequest,
  signal: AbortSignal,
): Promise<NLWebAskResponse> {
  const judgment = await judgeAskPages(request.query.text, pages, signal);
  const sources = selectAskSources(judgment);

  if (sources.length === 0) return noResultsResponse();

  const answer = await answerAsk(request.query.text, sources, signal);

  return answerResponse(answer, sources);
}

export function streamAsk(
  request: NLWebAskRequest,
  signal: AbortSignal,
): AsyncGenerator<NLWebAskStreamEvent> {
  const sources = judgeAskPages(request.query.text, pages, signal).then(selectAskSources);

  const pageWork: Promise<StreamStep> = sources.then((selected) =>
    selected.length
      ? {
          results: selected.map((source, index) => ({
            index: index + 1,
            item: {
              "@type": "WebPage" as const,
              name: source.title,
              url: source.url,
            },
          })),
        }
      : { error: noResultsResponse().error },
  );

  const answerWork: Promise<StreamStep> = sources.then(async (selected) =>
    selected.length
      ? {
          results: [
            {
              index: 0,
              item: {
                "@type": "SearchSummary" as const,
                text: await answerAsk(request.query.text, selected, signal),
              },
            },
          ],
        }
      : { results: [] },
  );

  return runStream([pageWork, answerWork]);
}
