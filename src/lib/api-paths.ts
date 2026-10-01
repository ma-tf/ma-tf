import type { RateLimit } from "@lib/rate-limits";

import { askRateLimit } from "@lib/rate-limits";

const apiPaths = new Set<string>(["/ask", "/mcp"]);

const apiPathLimits = new Map<string, RateLimit>([["/ask", askRateLimit]]);

export function isApiPath(pathname: string): boolean {
  return apiPaths.has(pathname);
}

export function apiRateLimitFor(pathname: string): RateLimit | undefined {
  return apiPathLimits.get(pathname);
}
