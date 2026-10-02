import { runStream } from "@features/ask/nlweb-stream";
import { beginRequest, runWith } from "@lib/wide-event";
import { describe, expect, it } from "vite-plus/test";

const route = { path: "/ask", method: "POST" };

function askEvent() {
  return beginRequest(new Request("https://m4t.tf/ask", { method: "POST" }), route);
}

async function collect(events: AsyncIterable<unknown>): Promise<void> {
  for await (const event of events) void event;
}

describe("runStream", () => {
  it("captures a rejected step and settles internal_error", async () => {
    const event = askEvent();

    const stream = runWith(event, () => runStream(false, [Promise.reject(new Error("boom"))]));

    await collect(stream);

    const line = event as unknown as Record<string, unknown>;

    expect(line.outcome).toBe("internal_error");
    expect(line.ask).toEqual({ stream: { completed: 0, results: 0 } });
    expect(line.error).toMatchObject({ name: "Error", message: "boom", phase: "stream_step" });
  });

  it("settles success and counts the completed step", async () => {
    const event = askEvent();

    const stream = runWith(event, () => runStream(false, [Promise.resolve({ results: [] })]));

    await collect(stream);

    const line = event as unknown as Record<string, unknown>;

    expect(line.outcome).toBe("success");
    expect(line.ask).toEqual({ stream: { completed: 1, results: 0 } });
    expect(line.error).toBeUndefined();
  });
});
