export const rateLimit = {
  name: "m4t",
  quota: 600,
  windowSeconds: 60,
} as const;

export const rateLimitPolicy = `"${rateLimit.name}";q=${rateLimit.quota};w=${rateLimit.windowSeconds}`;

export const rateLimitHeaders: Record<string, string> = {
  "RateLimit-Policy": rateLimitPolicy,
  "RateLimit-Limit": String(rateLimit.quota),
  "RateLimit-Reset": String(rateLimit.windowSeconds),
};
