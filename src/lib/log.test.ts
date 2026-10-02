import type { LogFields } from "@lib/wide-event";

import { log } from "@lib/log";
import { beginRequest, enrich, finish, runWith } from "@lib/wide-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

const route = { path: "/ask", method: "POST" };

function request(): Request {
  return new Request("https://m4t.tf/ask", {
    method: "POST",
    headers: { "x-nf-request-id": "req-test" },
  });
}

function captureLog(): string[] {
  const lines: string[] = [];

  vi.spyOn(console, "log").mockImplementation((message: string) => {
    lines.push(message);
  });

  return lines;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("log", () => {
  it("emits one canonical line with the finished event", () => {
    const lines = captureLog();
    const event = beginRequest(request(), route);

    runWith(event, () => {
      enrich({ ask: { decision: "answered" } });
      log(finish(event, { status_code: 200, outcome: "answered" }));
    });

    expect(lines).toHaveLength(1);

    const line = JSON.parse(lines[0] as string) as LogFields;

    expect(line.service).toBe("m4t.tf");
    expect(line.request_id).toBe("req-test");
    expect(line.method).toBe("POST");
    expect(line.path).toBe("/ask");
    expect(line.status_code).toBe(200);
    expect(line.outcome).toBe("answered");
    expect(typeof line.duration_ms).toBe("number");
    expect(line.ask).toEqual({ decision: "answered" });
  });

  it("emits an event only once", () => {
    const lines = captureLog();
    const event = beginRequest(request(), route);

    runWith(event, () => {
      log(finish(event, { status_code: 200 }));
      log(finish(event, { status_code: 200 }));
    });

    expect(lines).toHaveLength(1);
  });
});
