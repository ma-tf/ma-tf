import { ask } from "@features/ask/ask";
import { askTool } from "@features/mcp/ask";
import { log } from "@lib/log";
import { beginRequest, finish, runWith } from "@lib/wide-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("@features/ask/ask", () => ({ ask: vi.fn() }));

const askMock = vi.mocked(ask);

const route = { path: "/mcp", method: "POST" };

beforeEach(() => {
  askMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("askTool", () => {
  it("captures a thrown ask and reports INTERNAL_ERROR", async () => {
    askMock.mockRejectedValue(new Error("boom"));

    const lines: string[] = [];

    vi.spyOn(console, "log").mockImplementation((message: string) => {
      lines.push(message);
    });

    const event = beginRequest(new Request("https://m4t.tf/mcp", { method: "POST" }), route);

    const result = await runWith(event, async () => {
      const callResult = await askTool(
        { query: { text: "Who is Matt?" } },
        new AbortController().signal,
      );

      log(finish(event, { status_code: 200 }));

      return callResult;
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toMatchObject({ error: { code: "INTERNAL_ERROR" } });
    expect(askMock).toHaveBeenCalledOnce();
    expect(lines).toHaveLength(1);

    const line = JSON.parse(lines[0] as string) as Record<string, unknown>;

    expect(line.outcome).toBe("internal_error");
    expect(line.error).toMatchObject({ name: "Error", message: "boom", phase: "mcp_ask" });
  });
});
