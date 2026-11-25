import { isCrtReply, replyKind, replyOutcome } from "@features/crt/protocol";
import { describe, expect, it } from "vite-plus/test";

const blob = new Blob(["png"], { type: "image/png" });

describe("isCrtReply", () => {
  it("accepts the worker's replies", () => {
    expect(isCrtReply({ type: "loaded", job: 1, width: 2, height: 3 })).toBe(true);
    expect(isCrtReply({ type: "rendered", job: 1 })).toBe(true);
    expect(isCrtReply({ type: "exported", job: 1, blob })).toBe(true);
    expect(isCrtReply({ type: "failed", job: 1, kind: "screen", message: "no" })).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isCrtReply(null)).toBe(false);
    expect(isCrtReply("rendered")).toBe(false);
    expect(isCrtReply({ type: "render", job: 1 })).toBe(false);
    expect(isCrtReply({ type: "rendered" })).toBe(false);
  });
});

describe("replyKind", () => {
  it("files exports and export failures under export", () => {
    expect(replyKind({ type: "exported", job: 1, blob })).toBe("export");
    expect(replyKind({ type: "failed", job: 1, kind: "export", message: "no" })).toBe("export");
  });

  it("files everything else under screen", () => {
    expect(replyKind({ type: "loaded", job: 1, width: 1, height: 1 })).toBe("screen");
    expect(replyKind({ type: "rendered", job: 1 })).toBe("screen");
    expect(replyKind({ type: "failed", job: 1, kind: "screen", message: "no" })).toBe("screen");
  });
});

describe("replyOutcome", () => {
  it("maps each reply to the state it settles", () => {
    expect(replyOutcome({ type: "loaded", job: 1, width: 4, height: 3 })).toEqual({
      source: { width: 4, height: 3 },
    });
    expect(replyOutcome({ type: "rendered", job: 1 })).toEqual({ rendering: false });
    expect(replyOutcome({ type: "exported", job: 1, blob })).toEqual({ saving: false, blob });
    expect(replyOutcome({ type: "failed", job: 1, kind: "screen", message: "no" })).toEqual({
      rendering: false,
    });
    expect(replyOutcome({ type: "failed", job: 1, kind: "export", message: "no" })).toEqual({
      saving: false,
    });
  });
});
