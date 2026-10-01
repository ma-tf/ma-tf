import type { NLWebAskResponse } from "@features/ask/response";
import type { ServerContext } from "@modelcontextprotocol/server";

import { ask } from "@features/ask/ask";
import { NLWebAskRequestSchema, requestedSummarize } from "@features/ask/request";
import { answerResponse, failureResponses } from "@features/ask/response";
import { toStandardJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

const askInputSchemaSchema = v.object({
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

type AskInput = v.InferOutput<typeof askInputSchemaSchema>;

const askInputSchema = toStandardJsonSchema(askInputSchemaSchema);

const answerDocumentSchema = v.looseObject({
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
});

const failureDocumentSchema = v.looseObject({
  _meta: v.looseObject({ response_type: v.string(), version: v.literal("0.55") }),
  error: v.looseObject({ code: v.string(), message: v.string() }),
});

const askOutputSchema = toStandardJsonSchema(
  v.union([answerDocumentSchema, failureDocumentSchema]),
);

export const ASK_TOOL = {
  title: "Ask m4t.tf",
  description:
    "Answer a question from the content published on m4t.tf; returns the matching pages and, in summarize mode, a written answer.",
  inputSchema: askInputSchema,
  outputSchema: askOutputSchema,
  annotations: { readOnlyHint: true, openWorldHint: false },
};

function askToolResult(document: NLWebAskResponse, isError: boolean) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(document) }],
    structuredContent: document,
    isError,
  };
}

export async function askTool(args: AskInput, ctx: ServerContext) {
  const parsed = v.safeParse(NLWebAskRequestSchema, args);

  if (!parsed.success) return askToolResult(failureResponses.INTERNAL_ERROR, true);

  const summarize = requestedSummarize(parsed.output.prefer);

  if (summarize === undefined) return askToolResult(failureResponses.UNSUPPORTED_MODE, true);

  try {
    const answer = await ask(parsed.output.query.text, summarize, ctx.mcpReq.signal);

    return answer === null
      ? askToolResult(failureResponses.NO_RESULTS, false)
      : askToolResult(answerResponse(answer), false);
  } catch {
    return askToolResult(failureResponses.INTERNAL_ERROR, true);
  }
}
