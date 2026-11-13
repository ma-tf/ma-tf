import type { NLWebAskResponse } from "@features/ask/response";
import type { AskInput } from "@features/mcp/ask-schema";
import type { CallToolResult } from "@modelcontextprotocol/server";

import { ask } from "@features/ask/ask";
import { requestedSummarize } from "@features/ask/request";
import { answerResponse, failureResponses } from "@features/ask/response";
import { captureError, enrich } from "@lib/wide-event";

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

    enrich({ outcome: answer === null ? "no_results" : "success" });

    return answer === null
      ? askToolResult(failureResponses.NO_RESULTS, false)
      : askToolResult(answerResponse(answer), false);
  } catch (error) {
    captureError(error, { phase: "mcp_ask" });
    enrich({ outcome: "internal_error" });

    return askToolResult(failureResponses.INTERNAL_ERROR, true);
  }
}
