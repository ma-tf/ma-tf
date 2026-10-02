import type { NLWebAskResponse } from "@features/ask/response";
import type { CallToolResult } from "@modelcontextprotocol/server";

import { ask } from "@features/ask/ask";
import { requestedSummarize } from "@features/ask/request";
import { answerResponse, failureResponses } from "@features/ask/response";
import { toStandardJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

const askInputSchemaSource = v.object({
  query: v.object({
    text: v.pipe(
      v.string(),
      v.description("The question to answer from the site's published content."),
    ),
  }),
  prefer: v.optional(
    v.object({
      mode: v.optional(
        v.pipe(
          v.picklist(["list", "summarize"]),
          v.description("list returns the matching pages; summarize also writes a prose answer."),
        ),
      ),
    }),
  ),
});

export type AskInput = v.InferOutput<typeof askInputSchemaSource>;

export const askInputSchema = toStandardJsonSchema(askInputSchemaSource);

export const askOutputSchema = toStandardJsonSchema(
  v.union([
    v.looseObject({
      _meta: v.looseObject({
        response_type: v.string(),
        response_format: v.literal("conversational_search"),
        version: v.literal("0.55"),
      }),
      results: v.array(
        v.union([
          v.looseObject({ "@type": v.literal("SearchSummary"), text: v.string() }),
          v.looseObject({ "@type": v.literal("WebPage"), name: v.string(), url: v.string() }),
        ]),
      ),
    }),
    v.looseObject({
      _meta: v.looseObject({ response_type: v.string(), version: v.literal("0.55") }),
      error: v.looseObject({ code: v.string(), message: v.string() }),
    }),
  ]),
);

function askToolResult(document: NLWebAskResponse, isError: boolean): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(document) }],
    structuredContent: document,
    isError,
  };
}

export async function askTool(args: AskInput, signal: AbortSignal): Promise<CallToolResult> {
  try {
    const answer = await ask(args.query.text, requestedSummarize(args.prefer) ?? false, signal);

    return answer === null
      ? askToolResult(failureResponses.NO_RESULTS, false)
      : askToolResult(answerResponse(answer), false);
  } catch {
    return askToolResult(failureResponses.INTERNAL_ERROR, true);
  }
}
