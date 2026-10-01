import type { RequestId } from "@features/mcp/protocol";
import type { McpErrorName, McpFailure } from "@features/mcp/request";

import { ErrorCode, RESULT_TYPE } from "@features/mcp/protocol";

export type DiscoverResult = {
  resultType: typeof RESULT_TYPE;
  supportedVersions: string[];
  capabilities: { tools: Record<string, never>; resources: Record<string, never> };
  instructions: string;
  ttlMs: number;
  cacheScope: string;
  _meta: {
    "io.modelcontextprotocol/serverInfo": { name: string; version: string };
  };
};

type ErrorResponse = { code: number; message: string; status: number };

const errorResponses = {
  parseError: { code: ErrorCode.ParseError, message: "Parse error", status: 400 },
  invalidRequest: { code: ErrorCode.InvalidRequest, message: "Invalid Request", status: 400 },
  headerMismatch: { code: ErrorCode.HeaderMismatch, message: "Header mismatch", status: 400 },
  invalidParams: { code: ErrorCode.InvalidParams, message: "Invalid params", status: 400 },
  unsupportedProtocolVersion: {
    code: ErrorCode.UnsupportedProtocolVersion,
    message: "Unsupported protocol version",
    status: 400,
  },
  methodNotFound: { code: ErrorCode.MethodNotFound, message: "Method not found", status: 404 },
  notImplemented: { code: ErrorCode.InternalError, message: "Method not implemented", status: 500 },
} satisfies Record<McpErrorName, ErrorResponse>;

function envelope(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function resultResponse(id: RequestId, result: unknown, status = 200): Response {
  return envelope({ jsonrpc: "2.0", id, result }, status);
}

export function errorResponse(
  id: RequestId | null,
  code: number,
  message: string,
  status: number,
  data?: unknown,
): Response {
  const error = data === undefined ? { code, message } : { code, message, data };

  return envelope({ jsonrpc: "2.0", id, error }, status);
}

export function failureResponse(failure: McpFailure): Response {
  const { code, message, status } = errorResponses[failure.error];

  return errorResponse(failure.id, code, message, status, failure.data);
}
