import { discoverResult } from "@features/mcp/discover";
import { validateMcpRequest } from "@features/mcp/request";
import { failureResponse, resultResponse } from "@features/mcp/response";

export async function handleMcp(request: Request): Promise<Response> {
  const outcome = await validateMcpRequest(request);

  if (outcome.kind === "failure") return failureResponse(outcome.failure);
  if (outcome.kind === "notification") return new Response(null, { status: 202 });

  const { id, method } = outcome.request;

  if (method === "server/discover") return resultResponse(id, discoverResult());

  return failureResponse({ id, error: "notImplemented" });
}
