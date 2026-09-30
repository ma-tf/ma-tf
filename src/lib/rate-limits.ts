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
