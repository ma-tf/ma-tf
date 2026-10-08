import type { RateLimit } from "@lib/rate-limits";

import { rateLimitPolicyValue } from "@lib/rate-limits";
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

export function clientIp(request: Request): string | undefined {
  const visitor = request.headers.get("cf-connecting-ip");
  if (visitor) return visitor.trim();

  const direct = request.headers.get("x-nf-client-connection-ip");
  if (direct) return direct;

  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}

export function store(limit: RateLimit) {
  const options = { name: `rate-limit-${limit.name}`, consistency: "strong" } as const;

  return process.env.DEPLOY_ID ? getStore(options) : getDeployStore(options);
}

function limitHeaders(limit: RateLimit, remaining: number, resetAfter: number): Headers {
  const available = Math.max(0, remaining);

  return new Headers({
    RateLimit: `"${limit.name}";r=${available};t=${resetAfter}`,
    "RateLimit-Policy": rateLimitPolicyValue(limit),
    "RateLimit-Limit": String(limit.quota),
    "RateLimit-Remaining": String(available),
    "RateLimit-Reset": String(resetAfter),
  });
}

export async function enforceRateLimit(
  request: Request,
  limit: RateLimit,
): Promise<{ limited: Response | null; headers: Headers }> {
  const empty = new Headers();

  if (import.meta.env.DEV) return { limited: null, headers: empty };

  const ip = clientIp(request);
  const salt = process.env.RATE_LIMIT_SALT;

  if (!ip) {
    console.warn(`Rate limit for ${limit.name} skipped: no client IP`);
    return { limited: null, headers: empty };
  }

  if (!salt) {
    console.warn(`Rate limit for ${limit.name} skipped: RATE_LIMIT_SALT is not set`);
    return { limited: null, headers: empty };
  }

  try {
    const blobs = store(limit);
    const key = clientKey(ip, salt);
    const entry = (await blobs.get(key, { type: "json" })) as Window | null;
    const now = Date.now();
    const result = advanceWindow(entry, now, limit);
    const resetAfter = Math.max(
      0,
      Math.ceil((result.entry.windowStart + limit.windowSeconds * 1000 - now) / 1000),
    );
    const remaining = result.allowed ? limit.quota - result.entry.count : 0;

    if (!result.allowed) {
      return {
        limited: new Response(null, {
          status: 429,
          headers: limitHeaders(limit, remaining, resetAfter),
        }),
        headers: empty,
      };
    }

    const headers = limitHeaders(limit, remaining, resetAfter);

    await blobs.setJSON(key, result.entry);

    return { limited: null, headers };
  } catch (error) {
    console.warn(`Rate limit for ${limit.name} skipped: blob store error`, error);

    return { limited: null, headers: empty };
  }
}
