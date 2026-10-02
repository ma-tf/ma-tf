import type { AskPageJudgment, PublishedPage } from "@features/ask/published-page";

import { enrich } from "@lib/wide-event";
import { noul, TypeSafeClient, type NoulResponse } from "@typesafe-ai/sdk";
import { TYPESAFE_API_KEY } from "astro:env/server";

const PAGE_QUESTION_PREFIX = "page_";

export async function judgeAskPages(
  question: string,
  pages: PublishedPage[],
  signal: AbortSignal,
): Promise<AskPageJudgment> {
  const client = new TypeSafeClient({ apiKey: TYPESAFE_API_KEY });
  const payload = {
    state: {
      visitor_question: question,
      published_pages: pages,
    },
    questions: {
      answerable: noul(
        "Can the visitor's question be answered from the supplied published website content?",
        {
          true: "The published content states or clearly implies enough information to answer the question.",
          false:
            "The published content does not provide enough information to answer the question.",
        },
      ),
      ...Object.fromEntries(
        pages.map((page, index) => [
          `${PAGE_QUESTION_PREFIX}${index}`,
          noul(
            {
              page_url: page.url,
              question:
                "Does the published page with a `url` matching `page_url` contain information that helps answer `visitor_question`?",
            },
            {
              true: "The page contains specific information that supports an answer to the visitor's question.",
              false:
                "The page is unrelated or does not provide information useful for answering the visitor's question.",
            },
          ),
        ]),
      ),
    },
  };
  const startedAt = Date.now();
  const response = await client.systemOne(payload, { signal });

  enrich({ ask: { decision_gate: { duration_ms: Date.now() - startedAt } } });

  const pageAnswers = response.answers as Record<string, NoulResponse>;

  return {
    answerability: response.answers.answerable.noul,
    pageRelevance: pages.map((page, index) => ({
      page,
      probability: pageAnswers[`${PAGE_QUESTION_PREFIX}${index}`]!.noul,
    })),
  };
}
