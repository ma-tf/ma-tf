import type { RateLimit } from "@lib/rate-limits";

import { askRateLimit } from "@lib/rate-limits";

const apiPathLimits = new Map<string, RateLimit>([["/ask", askRateLimit]]);

export function apiRateLimitFor(pathname: string): RateLimit | undefined {
  return apiPathLimits.get(pathname);
}
