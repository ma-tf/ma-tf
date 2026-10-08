export type RateLimit = {
  name: string;
  quota: number;
  windowSeconds: number;
};

export const askRateLimit: RateLimit = {
  name: "ask",
  quota: 20,
  windowSeconds: 60,
};

export function rateLimitPolicyValue(limit: RateLimit): string {
  return `"${limit.name}";q=${limit.quota};w=${limit.windowSeconds}`;
}
