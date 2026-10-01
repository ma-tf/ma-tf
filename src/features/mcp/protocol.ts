export const MCP_PROTOCOL_VERSION = "2026-07-28";

export const RESULT_TYPE = "complete";

export const ErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  HeaderMismatch: -32020,
  UnsupportedProtocolVersion: -32022,
} as const;

export type RequestId = string | number;

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
