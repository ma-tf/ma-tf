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
