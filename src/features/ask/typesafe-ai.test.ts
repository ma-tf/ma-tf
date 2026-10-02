import { beginRequest, runWith } from "@lib/wide-event";
import { RateLimitError } from "@typesafe-ai/sdk";
import { describe, expect, it, vi } from "vite-plus/test";

const systemOne = vi.fn();

vi.mock("@typesafe-ai/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@typesafe-ai/sdk")>();

  return {
    ...actual,
    TypeSafeClient: class {
      systemOne = systemOne;
    },
  };
});

vi.mock("astro:env/server", () => ({ TYPESAFE_API_KEY: "test-key" }));

const { judgeAskPages } = await import("@features/ask/typesafe-ai");

function run() {
  const event = beginRequest(new Request("https://m4t.tf/ask", { method: "POST" }), {
    path: "/ask",
    method: "POST",
  });

  return { event, result: runWith(event, () => judgeAskPages("q", [], AbortSignal.timeout(100))) };
}

describe("judgeAskPages", () => {
  it("records the provider status before rethrowing", async () => {
    systemOne.mockRejectedValue(new RateLimitError(429, undefined, new Headers(), "rate limited"));

    const { event, result } = run();

    await expect(result).rejects.toThrow("rate limited");

    expect(event.ask).toEqual({
      decision_gate: {
        duration_ms: expect.any(Number),
        provider: "typesafe",
        status: 429,
        retry_after_ms: undefined,
      },
    });
  });

  it("leaves the provider context off a success", async () => {
    systemOne.mockResolvedValue({
      model: "jev-1.13.0",
      usage: { input_tokens: 900, output_tokens: 2 },
      answers: { answerable: { noul: 1 } },
    });

    const { event, result } = run();

    await result;

    expect(event.ask).toEqual({
      decision_gate: {
        duration_ms: expect.any(Number),
        model: "jev-1.13.0",
        input_tokens: 900,
        output_tokens: 2,
      },
    });
  });
});
