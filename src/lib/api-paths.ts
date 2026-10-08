import type { RateLimit } from "@lib/rate-limits";

import { askRateLimit } from "@lib/rate-limits";

const apiPaths = new Set<string>(["/ask", "/mcp"]);

const apiPathLimits = new Map<string, RateLimit>([["/ask", askRateLimit]]);

export function isApiPath(pathname: string): boolean {
  return apiPaths.has(pathname);
}

const base64SentinelPrefix = "=?base64?";
const base64SentinelSuffix = "?=";
const canonicalBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function decodeMcpName(value: string | null): string | null {
  if (value === null) return null;

  if (!(value.startsWith(base64SentinelPrefix) && value.endsWith(base64SentinelSuffix))) {
    return value;
  }

  const payload = value.slice(
    base64SentinelPrefix.length,
    value.length - base64SentinelSuffix.length,
  );

  if (!canonicalBase64.test(payload)) return null;

  try {
    const binary = atob(payload);
    const bytes = Uint8Array.from(binary, (character) => character.codePointAt(0) ?? 0);

    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function apiRateLimitFor(pathname: string, request: Request): RateLimit | undefined {
  if (pathname !== "/mcp") return apiPathLimits.get(pathname);

  return request.headers.get("Mcp-Method") === "tools/call" &&
    decodeMcpName(request.headers.get("Mcp-Name")) === "ask"
    ? askRateLimit
    : undefined;
}

function isLegacyAskCall(message: unknown): boolean {
  if (typeof message !== "object" || message === null) return false;

  const { method, params } = message as { method?: unknown; params?: unknown };
  if (method !== "tools/call") return false;
  if (typeof params !== "object" || params === null || Array.isArray(params)) return false;

  return (params as { name?: unknown }).name === "ask";
}

export async function apiRateLimitForRequest(
  pathname: string,
  request: Request,
): Promise<RateLimit | undefined> {
  const headerLimit = apiRateLimitFor(pathname, request);
  if (headerLimit) return headerLimit;
  if (pathname !== "/mcp" || request.method !== "POST") return undefined;

  try {
    const body: unknown = await request.clone().json();
    const messages = Array.isArray(body) ? body : [body];

    return messages.some(isLegacyAskCall) ? askRateLimit : undefined;
  } catch {
    return undefined;
  }
}
