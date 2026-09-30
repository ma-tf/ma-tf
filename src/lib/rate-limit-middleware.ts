import type { RateLimit } from "@lib/rate-limits";

import { getDeployStore, getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

type Window = { count: number; windowStart: number };

export function advanceWindow(
  entry: Window | null,
  now: number,
  limit: RateLimit,
): { allowed: boolean; entry: Window; retryAfter: number } {
  const windowMs = limit.windowSeconds * 1000;

  if (!entry || now - entry.windowStart >= windowMs) {
    return { allowed: true, entry: { count: 1, windowStart: now }, retryAfter: 0 };
  }

  if (entry.count < limit.quota) {
    return {
      allowed: true,
      entry: { count: entry.count + 1, windowStart: entry.windowStart },
      retryAfter: 0,
    };
  }

  return {
    allowed: false,
    entry,
    retryAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000),
  };
}

export function clientKey(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function clientIp(request: Request): string | undefined {
  const direct = request.headers.get("x-nf-client-connection-ip");
  if (direct) return direct;

  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}

function store(limit: RateLimit) {
  const options = { name: `rate-limit-${limit.name}`, consistency: "strong" } as const;

  return process.env.CONTEXT === "production" ? getStore(options) : getDeployStore(options);
}

export async function enforceRateLimit(
  request: Request,
  limit: RateLimit,
): Promise<Response | null> {
  if (import.meta.env.DEV) return null;

  const ip = clientIp(request);
  const salt = process.env.RATE_LIMIT_SALT;
  if (!ip || !salt) return null;

  try {
    const blobs = store(limit);
    const key = clientKey(ip, salt);
    const entry = (await blobs.get(key, { type: "json" })) as Window | null;
    const result = advanceWindow(entry, Date.now(), limit);

    if (!result.allowed) {
      return new Response(null, {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfter),
          "RateLimit-Policy": `"${limit.name}";q=${limit.quota};w=${limit.windowSeconds}`,
          "RateLimit-Limit": String(limit.quota),
          "RateLimit-Reset": String(result.retryAfter),
        },
      });
    }

    await blobs.setJSON(key, result.entry);

    return null;
  } catch {
    return null;
  }
}
