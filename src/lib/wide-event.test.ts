import type { LogFields } from "@lib/wide-event";

import {
  beginRequest,
  captureError,
  current,
  deferEmission,
  enrich,
  finish,
  isDeferred,
  runWith,
} from "@lib/wide-event";
import { describe, expect, it } from "vite-plus/test";

const route = { path: "/ask", method: "POST" };

function request(): Request {
  return new Request("https://m4t.tf/ask", {
    method: "POST",
    headers: { "x-nf-request-id": "req-test" },
  });
}

describe("beginRequest", () => {
  it("seeds the base fields and takes the request id from the header", () => {
    const event = beginRequest(request(), route);

    expect(event.service).toBe("m4t.tf");
    expect(event.request_id).toBe("req-test");
    expect(event.method).toBe("POST");
    expect(event.path).toBe("/ask");
    expect(typeof event.timestamp).toBe("string");
  });
});

describe("finish", () => {
  it("stamps the status, outcome and duration", () => {
    const event = beginRequest(request(), route);

    const result = finish(event, { status_code: 200, outcome: "answered" });

    expect(result).toBe(event);
    expect(event.status_code).toBe(200);
    expect(event.outcome).toBe("answered");
    expect(typeof event.duration_ms).toBe("number");
  });
});

describe("enrich", () => {
  it("deep-merges nested namespaces across calls", () => {
    const event = beginRequest(request(), route);

    runWith(event, () => {
      enrich({ ask: { decision: "answered", usage: { tokens: 10 } } });
      enrich({ ask: { usage: { latency_ms: 42 } } });
    });

    expect(event.ask).toEqual({
      decision: "answered",
      usage: { tokens: 10, latency_ms: 42 },
    });
  });

  it("replaces arrays instead of merging them", () => {
    const event = beginRequest(request(), route);

    runWith(event, () => {
      enrich({ ask: { tags: ["one"] } });
      enrich({ ask: { tags: ["two"] } });
    });

    expect(event.ask).toEqual({ tags: ["two"] });
  });

  it("is a no-op with no ambient event", () => {
    enrich({ ask: { decision: "answered" } });

    expect(current()).toBeUndefined();
  });
});

describe("captureError", () => {
  it("serialises an Error with name, message and stack", () => {
    const event = beginRequest(request(), route);

    runWith(event, () => {
      captureError(new Error("boom"), { stage: "answer" });
    });

    expect(event.error).toMatchObject({ name: "Error", message: "boom", stage: "answer" });
    expect(typeof (event.error as LogFields).stack).toBe("string");
  });

  it("serialises a thrown string", () => {
    const event = beginRequest(request(), route);

    runWith(event, () => {
      captureError("nope");
    });

    expect(event.error).toEqual({ message: "nope" });
  });

  it("is a no-op with no ambient event", () => {
    captureError(new Error("boom"));

    expect(current()).toBeUndefined();
  });
});

describe("current", () => {
  it("is undefined outside runWith and the event inside it", () => {
    const event = beginRequest(request(), route);

    expect(current()).toBeUndefined();

    runWith(event, () => {
      expect(current()).toBe(event);
    });

    expect(current()).toBeUndefined();
  });

  it("follows an async runWith across awaits", async () => {
    const event = beginRequest(request(), route);

    await runWith(event, async () => {
      await Promise.resolve();

      expect(current()).toBe(event);
    });
  });
});

describe("deferEmission", () => {
  it("marks the event as deferred for its owner to finish", () => {
    const event = beginRequest(request(), route);

    runWith(event, () => {
      deferEmission();

      expect(isDeferred(event)).toBe(true);

      finish(event, { status_code: 202, outcome: "accepted" });
    });

    expect(isDeferred(event)).toBe(true);
    expect(event.status_code).toBe(202);
    expect(event.outcome).toBe("accepted");
  });
});
