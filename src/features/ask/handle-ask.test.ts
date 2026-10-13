import { ask } from "@features/ask/ask";
import { handleAsk } from "@features/ask/handle-ask";
import { failureResponses } from "@features/ask/response";
import { log } from "@lib/log";
import { beginRequest, finish, runWith } from "@lib/wide-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("@features/ask/ask", () => ({ ask: vi.fn(), streamAsk: vi.fn() }));

const askMock = vi.mocked(ask);

const route = { path: "/ask", method: "POST" };

function request() {
  return new Request("https://m4t.tf/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: { text: "Who is Matt?" }, prefer: { mode: "summarize" } }),
  });
}

beforeEach(() => {
  askMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleAsk", () => {
  it("maps a thrown ask to an INTERNAL_ERROR document", async () => {
    askMock.mockRejectedValue(new Error("boom"));

    const lines: string[] = [];

    vi.spyOn(console, "log").mockImplementation((message: string) => {
      lines.push(message);
    });

    const event = beginRequest(request(), route);

    const response = await runWith(event, async () => {
      const result = await handleAsk(request());

      log(finish(event, { status_code: result.status }));

      return result;
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(failureResponses.INTERNAL_ERROR);

    const line = JSON.parse(lines[0] as string) as Record<string, unknown>;

    expect(line.outcome).toBe("internal_error");
    expect(line.error).toMatchObject({ name: "Error", message: "boom", phase: "ask" });
  });
});
