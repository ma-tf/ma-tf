import { discoverResult } from "@features/mcp/discover";
import {
  ErrorCode,
  errorResponse,
  MCP_PROTOCOL_VERSION,
  resultResponse,
  type RequestId,
} from "@features/mcp/protocol";
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

export async function handleMcp(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(null, ErrorCode.ParseError, "Parse error", 400);
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return errorResponse(null, ErrorCode.InvalidRequest, "Invalid Request", 400);
  }

  const record = body as Record<string, unknown>;
  const envelope = v.safeParse(EnvelopeSchema, record);

  if (!envelope.success) {
    return errorResponse(requestId(record.id), ErrorCode.InvalidRequest, "Invalid Request", 400);
  }

  if (!("id" in record)) return new Response(null, { status: 202 });

  const id = envelope.output.id as RequestId;
  const { method } = envelope.output;

  const protocolVersionHeader = headerValue(request, PROTOCOL_VERSION_HEADER);
  const methodHeader = headerValue(request, METHOD_HEADER);

  if (protocolVersionHeader === null || methodHeader === null || methodHeader !== method) {
    return errorResponse(id, ErrorCode.HeaderMismatch, "Header mismatch", 400);
  }

  const namedParam = NAMED_PARAMS[method];

  if (namedParam !== undefined) {
    const nameHeader = headerValue(request, NAME_HEADER);
    const expected = objectAt(objectAt(record, "params"), namedParam);

    if (nameHeader === null || nameHeader !== expected) {
      return errorResponse(id, ErrorCode.HeaderMismatch, "Header mismatch", 400);
    }
  }

  const params = objectAt(record, "params");
  const meta = objectAt(params, "_meta");
  const metaParsed = v.safeParse(MetaSchema, meta);

  if (!metaParsed.success) {
    return errorResponse(id, ErrorCode.InvalidParams, "Invalid params", 400);
  }

  const bodyVersion = metaParsed.output[META_PROTOCOL_VERSION];

  if (protocolVersionHeader !== bodyVersion) {
    return errorResponse(id, ErrorCode.HeaderMismatch, "Header mismatch", 400);
  }

  if (bodyVersion !== MCP_PROTOCOL_VERSION) {
    return errorResponse(
      id,
      ErrorCode.UnsupportedProtocolVersion,
      "Unsupported protocol version",
      400,
      { supported: [MCP_PROTOCOL_VERSION], requested: bodyVersion },
    );
  }

  if (!KNOWN_METHODS.has(method)) {
    return errorResponse(id, ErrorCode.MethodNotFound, "Method not found", 404);
  }

  if (!v.safeParse(ParamsSchema, params).success) {
    return errorResponse(id, ErrorCode.InvalidParams, "Invalid params", 400);
  }

  if (method === "server/discover") {
    return resultResponse(id, discoverResult());
  }

  return errorResponse(id, ErrorCode.InternalError, "Method not implemented", 500);
}
