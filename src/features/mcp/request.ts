import type { RequestId } from "@features/mcp/protocol";

import { MCP_PROTOCOL_VERSION } from "@features/mcp/protocol";
import * as v from "valibot";

const PROTOCOL_VERSION_HEADER = "MCP-Protocol-Version";
const METHOD_HEADER = "Mcp-Method";
const NAME_HEADER = "Mcp-Name";

const META_PROTOCOL_VERSION = "io.modelcontextprotocol/protocolVersion";
const META_CLIENT_CAPABILITIES = "io.modelcontextprotocol/clientCapabilities";

const KNOWN_METHODS = new Set([
  "server/discover",
  "tools/list",
  "tools/call",
  "resources/list",
  "resources/read",
]);

const NAMED_PARAMS: Record<string, string> = {
  "tools/call": "name",
  "resources/read": "uri",
};

const EnvelopeSchema = v.looseObject({
  jsonrpc: v.literal("2.0"),
  method: v.string(),
  id: v.optional(v.union([v.string(), v.number()])),
});

const MetaSchema = v.looseObject({
  [META_PROTOCOL_VERSION]: v.string(),
  [META_CLIENT_CAPABILITIES]: v.unknown(),
});

const ParamsSchema = v.looseObject({ _meta: MetaSchema });

export type McpErrorName =
  | "parseError"
  | "invalidRequest"
  | "headerMismatch"
  | "invalidParams"
  | "unsupportedProtocolVersion"
  | "methodNotFound"
  | "notImplemented";

export type McpFailure = {
  id: RequestId | null;
  error: McpErrorName;
  data?: unknown;
};

export type McpRequest = { id: RequestId; method: string; params: unknown };

export type McpRequestOutcome =
  | { kind: "request"; request: McpRequest }
  | { kind: "notification" }
  | { kind: "failure"; failure: McpFailure };

function decodeHeaderValue(value: string): string {
  const prefix = "=?base64?";
  const suffix = "?=";

  if (!value.startsWith(prefix) || !value.endsWith(suffix)) return value;

  try {
    return atob(value.slice(prefix.length, -suffix.length));
  } catch {
    return value;
  }
}

function headerValue(request: Request, name: string): string | null {
  const value = request.headers.get(name);

  return value === null ? null : decodeHeaderValue(value);
}

function requestId(value: unknown): RequestId | null {
  if (typeof value === "string" || typeof value === "number") return value;

  return null;
}

function objectAt(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null) return undefined;

  return (value as Record<string, unknown>)[key];
}

function failure(id: RequestId | null, error: McpErrorName, data?: unknown): McpRequestOutcome {
  return { kind: "failure", failure: { id, error, data } };
}

export async function validateMcpRequest(request: Request): Promise<McpRequestOutcome> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return failure(null, "parseError");
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return failure(null, "invalidRequest");
  }

  const record = body as Record<string, unknown>;
  const envelope = v.safeParse(EnvelopeSchema, record);

  if (!envelope.success) return failure(requestId(record.id), "invalidRequest");

  if (!("id" in record)) return { kind: "notification" };

  const id = envelope.output.id as RequestId;
  const { method } = envelope.output;

  const protocolVersionHeader = headerValue(request, PROTOCOL_VERSION_HEADER);
  const methodHeader = headerValue(request, METHOD_HEADER);

  if (protocolVersionHeader === null || methodHeader === null || methodHeader !== method) {
    return failure(id, "headerMismatch");
  }

  const namedParam = NAMED_PARAMS[method];

  if (namedParam !== undefined) {
    const nameHeader = headerValue(request, NAME_HEADER);
    const expected = objectAt(objectAt(record, "params"), namedParam);

    if (nameHeader === null || nameHeader !== expected) return failure(id, "headerMismatch");
  }

  const params = objectAt(record, "params");
  const meta = objectAt(params, "_meta");
  const metaParsed = v.safeParse(MetaSchema, meta);

  if (!metaParsed.success) return failure(id, "invalidParams");

  const bodyVersion = metaParsed.output[META_PROTOCOL_VERSION];

  if (protocolVersionHeader !== bodyVersion) return failure(id, "headerMismatch");

  if (bodyVersion !== MCP_PROTOCOL_VERSION) {
    return failure(id, "unsupportedProtocolVersion", {
      supported: [MCP_PROTOCOL_VERSION],
      requested: bodyVersion,
    });
  }

  if (!KNOWN_METHODS.has(method)) return failure(id, "methodNotFound");

  if (!v.safeParse(ParamsSchema, params).success) return failure(id, "invalidParams");

  return { kind: "request", request: { id, method, params } };
}
